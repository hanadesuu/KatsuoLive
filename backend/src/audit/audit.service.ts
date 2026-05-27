import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(data: {
    userId: string;
    action: string;
    resource: string;
    resourceId: string;
    changes?: any;
  }) {
    return this.prisma.auditLog.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
      },
    });
  }

  async findAll(filters?: {
    userId?: string;
    resource?: string;
    resourceId?: string;
    skip?: number;
    take?: number;
  }) {
    const where: any = {};

    if (filters?.userId) where.userId = filters.userId;
    if (filters?.resource) where.resource = filters.resource;
    if (filters?.resourceId) where.resourceId = filters.resourceId;

    return this.prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: filters?.skip,
      take: filters?.take || 50,
    });
  }

  async findByResource(resource: string, resourceId: string) {
    return this.prisma.auditLog.findMany({
      where: {
        resource,
        resourceId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
