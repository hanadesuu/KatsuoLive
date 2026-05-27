import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTourDto, UpdateTourDto } from './dto/tour.dto';

@Injectable()
export class ToursService {
  constructor(private prisma: PrismaService) {}

  async create(createTourDto: CreateTourDto) {
    const data: any = {
      artistId: createTourDto.artistId,
      name: createTourDto.name,
      description: createTourDto.description,
      officialPageUrl: createTourDto.officialPageUrl,
    };

    // 只有在明确提供时才设置日期，否则让系统自动计算
    if (createTourDto.startDate) {
      data.startDate = new Date(createTourDto.startDate);
    }
    if (createTourDto.endDate) {
      data.endDate = new Date(createTourDto.endDate);
    }

    return this.prisma.tour.create({
      data,
      include: {
        artist: true,
        _count: {
          select: { lives: true },
        },
      },
    });
  }

  async findAll(artistId?: string) {
    const where: any = {};
    if (artistId) {
      where.artistId = artistId;
    }

    const tours = await this.prisma.tour.findMany({
      where,
      include: {
        artist: true,
        lives: {
          select: {
            dateStart: true,
            dateEnd: true,
          },
          orderBy: {
            dateStart: 'asc',
          },
        },
        _count: {
          select: { lives: true },
        },
      },
    });

    // 自动计算每个巡演的开始和结束日期
    return tours.map(tour => {
      let startDate = tour.startDate;
      let endDate = tour.endDate;

      // 如果有关联的演出，从演出中计算日期
      if (tour.lives && tour.lives.length > 0) {
        const dates = tour.lives
          .map(live => live.dateStart)
          .filter(date => date != null);
        
        if (dates.length > 0) {
          startDate = new Date(Math.min(...dates.map(d => d.getTime())));
          
          // 计算结束日期（使用dateEnd或dateStart）
          const endDates = tour.lives
            .map(live => live.dateEnd || live.dateStart)
            .filter(date => date != null);
          
          if (endDates.length > 0) {
            endDate = new Date(Math.max(...endDates.map(d => d.getTime())));
          }
        }
      }

      // 移除lives字段，只保留计算后的日期
      const { lives, ...tourWithoutLives } = tour;
      return {
        ...tourWithoutLives,
        startDate,
        endDate,
      };
    }).sort((a, b) => {
      // 按计算后的startDate排序
      const aDate = a.startDate?.getTime() || 0;
      const bDate = b.startDate?.getTime() || 0;
      return bDate - aDate;
    });
  }

  async findOne(id: string) {
    const tour = await this.prisma.tour.findUnique({
      where: { id },
      include: {
        artist: true,
        lives: {
          include: {
            _count: {
              select: { lotteries: true },
            },
          },
          orderBy: {
            dateStart: 'asc',
          },
        },
      },
    });

    if (!tour) {
      throw new NotFoundException(`Tour with ID ${id} not found`);
    }

    // 自动计算开始和结束日期
    let startDate = tour.startDate;
    let endDate = tour.endDate;

    if (tour.lives && tour.lives.length > 0) {
      const dates = tour.lives
        .map(live => live.dateStart)
        .filter(date => date != null);
      
      if (dates.length > 0) {
        startDate = new Date(Math.min(...dates.map(d => d.getTime())));
        
        const endDates = tour.lives
          .map(live => live.dateEnd || live.dateStart)
          .filter(date => date != null);
        
        if (endDates.length > 0) {
          endDate = new Date(Math.max(...endDates.map(d => d.getTime())));
        }
      }
    }

    return {
      ...tour,
      startDate,
      endDate,
    };
  }

  async update(id: string, updateTourDto: UpdateTourDto) {
    try {
      const data: any = { ...updateTourDto };
      if (updateTourDto.startDate) {
        data.startDate = new Date(updateTourDto.startDate);
      }
      if (updateTourDto.endDate) {
        data.endDate = new Date(updateTourDto.endDate);
      }

      return await this.prisma.tour.update({
        where: { id },
        data,
        include: {
          artist: true,
          _count: {
            select: { lives: true },
          },
        },
      });
    } catch (error) {
      throw new NotFoundException(`Tour with ID ${id} not found`);
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.tour.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Tour with ID ${id} not found`);
    }
  }
}
