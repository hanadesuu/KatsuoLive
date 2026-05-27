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
import { LotteriesService } from './lotteries.service';
import { CreateLotteryDto, UpdateLotteryDto } from './dto/lottery.dto';
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

@ApiTags('lotteries')
@Controller('lotteries')
export class LotteriesController {
  constructor(
    private lotteriesService: LotteriesService,
    private auditService: AuditService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create lottery round' })
  async create(@Body() createLotteryDto: CreateLotteryDto, @Request() req) {
    const lottery = await this.lotteriesService.create(createLotteryDto);
    await this.auditService.log({
      userId: req.user.userId,
      action: 'create',
      resource: 'lottery',
      resourceId: lottery.id,
      changes: { after: lottery },
    });
    return lottery;
  }

  @Get()
  @ApiOperation({ summary: 'Get all lotteries' })
  @ApiQuery({ name: 'liveId', required: false })
  findAll(@Query('liveId') liveId?: string) {
    return this.lotteriesService.findAll(liveId);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get currently active lotteries' })
  getActive() {
    return this.lotteriesService.getActive();
  }

  @Get('timeline')
  @ApiOperation({ summary: 'Get lottery timeline' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  getTimeline(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.lotteriesService.getTimeline(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lottery by ID' })
  findOne(@Param('id') id: string) {
    return this.lotteriesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update lottery' })
  async update(
    @Param('id') id: string,
    @Body() updateLotteryDto: UpdateLotteryDto,
    @Request() req,
  ) {
    const before = await this.lotteriesService.findOne(id);
    const lottery = await this.lotteriesService.update(id, updateLotteryDto);
    await this.auditService.log({
      userId: req.user.userId,
      action: 'update',
      resource: 'lottery',
      resourceId: lottery.id,
      changes: { before, after: lottery },
    });
    return lottery;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete lottery' })
  async remove(@Param('id') id: string, @Request() req) {
    const lottery = await this.lotteriesService.findOne(id);
    await this.lotteriesService.remove(id);
    await this.auditService.log({
      userId: req.user.userId,
      action: 'delete',
      resource: 'lottery',
      resourceId: id,
      changes: { before: lottery },
    });
    return { message: 'Lottery deleted successfully' };
  }
}
