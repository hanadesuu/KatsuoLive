import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLiveDto, UpdateLiveDto } from './dto/live.dto';

@Injectable()
export class LivesService {
  constructor(private prisma: PrismaService) {}

  async create(createLiveDto: CreateLiveDto) {
    return this.prisma.live.create({
      data: createLiveDto,
      include: {
        artist: true,
        lotteries: true,
      },
    });
  }

  async findAll(filters?: {
    artistId?: string;
    tourId?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const where: any = {};

    if (filters?.artistId) where.artistId = filters.artistId;
    if (filters?.tourId) where.tourId = filters.tourId;
    if (filters?.status) where.status = filters.status;
    if (filters?.startDate || filters?.endDate) {
      where.dateStart = {};
      if (filters.startDate) where.dateStart.gte = filters.startDate;
      if (filters.endDate) where.dateStart.lte = filters.endDate;
    }

    const lives = await this.prisma.live.findMany({
      where,
      include: {
        artist: true,
        lotteries: {
          include: {
            lottery: true,
          },
        },
        _count: {
          select: { lotteries: true },
        },
      },
      orderBy: {
        dateStart: 'desc',
      },
    });

    // 转换数据结构，将中间表的 lottery 提取出来
    return lives.map(live => ({
      ...live,
      lotteries: live.lotteries.map(ll => ll.lottery).sort((a, b) => a.startTime.getTime() - b.startTime.getTime()),
    }));
  }

  async findOne(id: string) {
    const live = await this.prisma.live.findUnique({
      where: { id },
      include: {
        artist: true,
        lotteries: {
          include: {
            lottery: true,
          },
        },
        documents: true,
      },
    });

    if (!live) {
      throw new NotFoundException(`Live with ID ${id} not found`);
    }

    // 转换数据结构
    return {
      ...live,
      lotteries: live.lotteries.map(ll => ll.lottery).sort((a, b) => a.startTime.getTime() - b.startTime.getTime()),
    };
  }

  async update(id: string, updateLiveDto: UpdateLiveDto) {
    try {
      const { lotteryIds, ...liveData } = updateLiveDto;
      
      // 如果提供了lotteryIds，更新抽选关联
      if (lotteryIds !== undefined) {
        // 先删除现有的所有抽选关联
        await this.prisma.liveLottery.deleteMany({
          where: { liveId: id },
        });
        
        // 创建新的抽选关联
        if (lotteryIds.length > 0) {
          await this.prisma.liveLottery.createMany({
            data: lotteryIds.map((lotteryId) => ({
              liveId: id,
              lotteryId,
            })),
          });
        }
      }
      
      // 更新演出基本信息
      return await this.prisma.live.update({
        where: { id },
        data: liveData,
        include: {
          artist: true,
          lotteries: {
            include: {
              lottery: true,
            },
          },
        },
      });
    } catch (error) {
      throw new NotFoundException(`Live with ID ${id} not found`);
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.live.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Live with ID ${id} not found`);
    }
  }

  async getUpcoming() {
    const lives = await this.prisma.live.findMany({
      where: {
        dateStart: {
          gte: new Date(),
        },
        status: 'UPCOMING',
      },
      include: {
        artist: true,
        lotteries: {
          include: {
            lottery: true,
          },
        },
      },
      orderBy: {
        dateStart: 'asc',
      },
      take: 10,
    });

    return lives.map(live => ({
      ...live,
      lotteries: live.lotteries.map(ll => ll.lottery).sort((a, b) => a.startTime.getTime() - b.startTime.getTime()),
    }));
  }

  async getCalendar(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const lives = await this.prisma.live.findMany({
      where: {
        OR: [
          {
            dateStart: {
              gte: startDate,
              lte: endDate,
            },
          },
          {
            dateEnd: {
              gte: startDate,
              lte: endDate,
            },
          },
        ],
      },
      include: {
        artist: true,
        lotteries: {
          include: {
            lottery: true,
          },
        },
      },
      orderBy: {
        dateStart: 'asc',
      },
    });

    return lives.map(live => ({
      ...live,
      lotteries: live.lotteries.map(ll => ll.lottery).sort((a, b) => a.startTime.getTime() - b.startTime.getTime()),
    }));
  }
}
