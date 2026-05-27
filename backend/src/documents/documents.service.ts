import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto, UpdateDocumentDto } from './dto/document.dto';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async create(createDocumentDto: CreateDocumentDto) {
    return this.prisma.document.create({
      data: createDocumentDto,
      include: {
        live: {
          include: {
            artist: true,
          },
        },
      },
    });
  }

  async findAll(liveId?: string) {
    const where = liveId ? { liveId } : {};

    return this.prisma.document.findMany({
      where,
      include: {
        live: {
          include: {
            artist: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const document = await this.prisma.document.findUnique({
      where: { id },
      include: {
        live: {
          include: {
            artist: true,
          },
        },
      },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    return document;
  }

  async findBySlug(slug: string) {
    const document = await this.prisma.document.findUnique({
      where: { slug },
      include: {
        live: {
          include: {
            artist: true,
          },
        },
      },
    });

    if (!document) {
      throw new NotFoundException(`Document with slug ${slug} not found`);
    }

    return document;
  }

  async update(id: string, updateDocumentDto: UpdateDocumentDto) {
    try {
      return await this.prisma.document.update({
        where: { id },
        data: updateDocumentDto,
        include: {
          live: {
            include: {
              artist: true,
            },
          },
        },
      });
    } catch (error) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.document.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }
  }
}
