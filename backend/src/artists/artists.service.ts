import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArtistDto, UpdateArtistDto } from './dto/artist.dto';

@Injectable()
export class ArtistsService {
  constructor(private prisma: PrismaService) {}

  async create(createArtistDto: CreateArtistDto) {
    return this.prisma.artist.create({
      data: createArtistDto,
    });
  }

  async findAll(skip?: number, take?: number) {
    const query: any = {
      include: {
        _count: {
          select: { 
            lives: true,
            tours: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    };
    
    if (skip !== undefined && !isNaN(skip)) {
      query.skip = skip;
    }
    if (take !== undefined && !isNaN(take)) {
      query.take = take;
    }
    
    return this.prisma.artist.findMany(query);
  }

  async findOne(id: string) {
    const artist = await this.prisma.artist.findUnique({
      where: { id },
      include: {
        lives: {
          include: {
            lotteries: {
              include: {
                lottery: true,
              },
            },
          },
          orderBy: {
            dateStart: 'desc',
          },
        },
      },
    });

    if (!artist) {
      throw new NotFoundException(`Artist with ID ${id} not found`);
    }

    // 转换数据结构，将中间表的 lottery 提取出来，与 lives 接口保持一致
    return {
      ...artist,
      lives: artist.lives.map(live => ({
        ...live,
        lotteries: live.lotteries.map(ll => ll.lottery).sort((a, b) => a.startTime.getTime() - b.startTime.getTime()),
      })),
    };
  }

  async update(id: string, updateArtistDto: UpdateArtistDto) {
    try {
      return await this.prisma.artist.update({
        where: { id },
        data: updateArtistDto,
      });
    } catch (error) {
      throw new NotFoundException(`Artist with ID ${id} not found`);
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.artist.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Artist with ID ${id} not found`);
    }
  }

  async search(query: string) {
    const lowerQuery = query.toLowerCase();
    
    // Find all artists first
    const allArtists = await this.prisma.artist.findMany({
      include: {
        _count: {
          select: { 
            lives: true,
            tours: true,
          },
        },
      },
    });
    
    // Filter artists that match the query in name or searchKeywords
    const matchedArtists = allArtists.filter((artist) => {
      // Check if query matches any name field
      const nameMatch = 
        (artist.nameJp && artist.nameJp.toLowerCase().includes(lowerQuery)) ||
        (artist.nameEn && artist.nameEn.toLowerCase().includes(lowerQuery)) ||
        (artist.nameCn && artist.nameCn.toLowerCase().includes(lowerQuery));
      
      // Check if query matches any search keyword
      const keywordMatch = artist.searchKeywords.some((keyword) =>
        keyword.toLowerCase().includes(lowerQuery)
      );
      
      return nameMatch || keywordMatch;
    });
    
    return matchedArtists;
  }
}
