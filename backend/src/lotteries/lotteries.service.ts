import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLotteryDto, UpdateLotteryDto } from './dto/lottery.dto';

@Injectable()
export class LotteriesService {
  constructor(private prisma: PrismaService) {}

  async create(createLotteryDto: CreateLotteryDto) {
    return this.prisma.lottery.create({
      data: createLotteryDto,
      include: {
        lives: {
          include: {
            live: {
              include: {
                artist: true,
              },
            },
          },
        },
      },
    });
  }

  async findAll(liveId?: string) {
    const where: any = {};
    
    // 如果指定了 liveId，则通过中间表查询
    if (liveId) {
      where.lives = {
        some: {
          liveId: liveId,
        },
      };
    }

    const lotteries = await this.prisma.lottery.findMany({
      where,
      include: {
        lives: {
          include: {
            live: {
              include: {
                artist: true,
              },
            },
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    // 转换数据结构
    return lotteries.map(lottery => ({
      ...lottery,
      lives: lottery.lives.map(ll => ll.live),
    }));
  }

  async findOne(id: string) {
    const lottery = await this.prisma.lottery.findUnique({
      where: { id },
      include: {
        lives: {
          include: {
            live: {
              include: {
                artist: true,
              },
            },
          },
        },
      },
    });

    if (!lottery) {
      throw new NotFoundException(`Lottery with ID ${id} not found`);
    }

    // 转换数据结构
    return {
      ...lottery,
      lives: lottery.lives.map(ll => ll.live),
    };
  }

  async update(id: string, updateLotteryDto: UpdateLotteryDto) {
    try {
      const lottery = await this.prisma.lottery.update({
        where: { id },
        data: updateLotteryDto,
        include: {
          lives: {
            include: {
              live: {
                include: {
                  artist: true,
                },
              },
            },
          },
        },
      });

      return {
        ...lottery,
        lives: lottery.lives.map(ll => ll.live),
      };
    } catch (error) {
      throw new NotFoundException(`Lottery with ID ${id} not found`);
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.lottery.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Lottery with ID ${id} not found`);
    }
  }

  async getTimeline(startDate?: Date, endDate?: Date) {
    const where: any = {};

    if (startDate || endDate) {
      where.OR = [
        {
          startTime: {
            gte: startDate,
            lte: endDate,
          },
        },
        {
          endTime: {
            gte: startDate,
            lte: endDate,
          },
        },
      ];
    }

    const lotteries = await this.prisma.lottery.findMany({
      where,
      include: {
        lives: {
          include: {
            live: {
              include: {
                artist: true,
              },
            },
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    return lotteries.map(lottery => ({
      ...lottery,
      lives: lottery.lives.map(ll => ll.live),
    }));
  }

  async getActive() {
    const now = new Date();
    const lotteries = await this.prisma.lottery.findMany({
      where: {
        startTime: {
          lte: now,
        },
        endTime: {
          gte: now,
        },
      },
      include: {
        lives: {
          include: {
            live: {
              include: {
                artist: true,
              },
            },
          },
        },
      },
      orderBy: {
        endTime: 'asc',
      },
    });

    return lotteries.map(lottery => ({
      ...lottery,
      lives: lottery.lives.map(ll => ll.live),
    }));
  }
}
