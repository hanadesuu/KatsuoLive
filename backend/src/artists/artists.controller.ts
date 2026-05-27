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
import { ArtistsService } from './artists.service';
import { CreateArtistDto, UpdateArtistDto } from './dto/artist.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuditService } from '../audit/audit.service';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('artists')
@Controller('artists')
export class ArtistsController {
  constructor(
    private artistsService: ArtistsService,
    private auditService: AuditService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create artist' })
  async create(@Body() createArtistDto: CreateArtistDto, @Request() req) {
    const artist = await this.artistsService.create(createArtistDto);
    await this.auditService.log({
      userId: req.user.userId,
      action: 'create',
      resource: 'artist',
      resourceId: artist.id,
      changes: { after: artist },
    });
    return artist;
  }

  @Get()
  @ApiOperation({ summary: 'Get all artists' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('search') search?: string,
  ) {
    if (search) {
      return this.artistsService.search(search);
    }
    const skipNum = skip ? parseInt(skip, 10) : undefined;
    const takeNum = take ? parseInt(take, 10) : undefined;
    return this.artistsService.findAll(skipNum, takeNum);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get artist by ID' })
  findOne(@Param('id') id: string) {
    return this.artistsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update artist' })
  async update(
    @Param('id') id: string,
    @Body() updateArtistDto: UpdateArtistDto,
    @Request() req,
  ) {
    const before = await this.artistsService.findOne(id);
    const artist = await this.artistsService.update(id, updateArtistDto);
    await this.auditService.log({
      userId: req.user.userId,
      action: 'update',
      resource: 'artist',
      resourceId: artist.id,
      changes: { before, after: artist },
    });
    return artist;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete artist' })
  async remove(@Param('id') id: string, @Request() req) {
    const artist = await this.artistsService.findOne(id);
    await this.artistsService.remove(id);
    await this.auditService.log({
      userId: req.user.userId,
      action: 'delete',
      resource: 'artist',
      resourceId: id,
      changes: { before: artist },
    });
    return { message: 'Artist deleted successfully' };
  }
}
