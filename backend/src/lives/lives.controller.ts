import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { LivesService } from './lives.service';
import { CreateLiveDto, UpdateLiveDto } from './dto/live.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuditService } from '../audit/audit.service';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('lives')
@Controller('lives')
export class LivesController {
  constructor(
    private livesService: LivesService,
    private auditService: AuditService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create live event' })
  async create(@Body() createLiveDto: CreateLiveDto, @Request() req) {
    const live = await this.livesService.create(createLiveDto);
    await this.auditService.log({
      userId: req.user.userId,
      action: 'create',
      resource: 'live',
      resourceId: live.id,
      changes: { after: live },
    });
    return live;
  }

  @Get()
  @ApiOperation({ summary: 'Get all live events' })
  @ApiQuery({ name: 'artistId', required: false })
  @ApiQuery({ name: 'tourId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  findAll(
    @Query('artistId') artistId?: string,
    @Query('tourId') tourId?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.livesService.findAll({
      artistId,
      tourId,
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming live events' })
  getUpcoming() {
    return this.livesService.getUpcoming();
  }

  @Get('calendar/:year/:month')
  @ApiOperation({ summary: 'Get calendar view of lives' })
  getCalendar(@Param('year') year: string, @Param('month') month: string) {
    return this.livesService.getCalendar(parseInt(year), parseInt(month));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get live event by ID' })
  findOne(@Param('id') id: string) {
    return this.livesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update live event' })
  async update(
    @Param('id') id: string,
    @Body() updateLiveDto: UpdateLiveDto,
    @Request() req,
  ) {
    const before = await this.livesService.findOne(id);
    const live = await this.livesService.update(id, updateLiveDto);
    await this.auditService.log({
      userId: req.user.userId,
      action: 'update',
      resource: 'live',
      resourceId: live.id,
      changes: { before, after: live },
    });
    return live;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete live event' })
  async remove(@Param('id') id: string, @Request() req) {
    const live = await this.livesService.findOne(id);
    await this.livesService.remove(id);
    await this.auditService.log({
      userId: req.user.userId,
      action: 'delete',
      resource: 'live',
      resourceId: id,
      changes: { before: live },
    });
    return { message: 'Live deleted successfully' };
  }
}
