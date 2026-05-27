import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.role.findMany({
      include: {
        permissions: true,
        _count: {
          select: { users: true },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: true,
        users: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
      },
    });
  }
}
