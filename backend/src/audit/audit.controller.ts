import { Controller, Get, Query, UseGuards, Param } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin', 'admin')
@Controller('audit')
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'Get audit logs' })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'resource', required: false })
  @ApiQuery({ name: 'resourceId', required: false })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  findAll(
    @Query('userId') userId?: string,
    @Query('resource') resource?: string,
    @Query('resourceId') resourceId?: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return this.auditService.findAll({
      userId,
      resource,
      resourceId,
      skip,
      take,
    });
  }

  @Get(':resource/:resourceId')
  @ApiOperation({ summary: 'Get audit logs for specific resource' })
  findByResource(
    @Param('resource') resource: string,
    @Param('resourceId') resourceId: string,
  ) {
    return this.auditService.findByResource(resource, resourceId);
  }
}
