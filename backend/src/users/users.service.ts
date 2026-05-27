import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: { email: string; username: string; password: string }) {
    // 默认分配 viewer 角色
    const viewerRole = await this.prisma.role.findUnique({
      where: { name: 'viewer' },
    });

    if (!viewerRole) {
      throw new NotFoundException('Default role not found');
    }

    return this.prisma.user.create({
      data: {
        ...data,
        roleId: viewerRole.id,
      },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, ...result } = user;
    return result;
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      include: {
        role: true,
      },
    });
    return users.map(({ password, ...user }) => user);
  }

  async updateRole(id: string, roleId: string) {
    return this.prisma.user.update({
      where: { id },
      data: { roleId },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });
  }

  async deactivate(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
