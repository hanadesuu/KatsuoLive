import { Controller, Get, Post, Put, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ToursService } from './tours.service';
import { CreateTourDto, UpdateTourDto } from './dto/tour.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('tours')
@Controller('tours')
export class ToursController {
  constructor(private toursService: ToursService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new tour' })
  create(@Body() createTourDto: CreateTourDto) {
    return this.toursService.create(createTourDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tours' })
  @ApiQuery({ name: 'artistId', required: false })
  findAll(@Query('artistId') artistId?: string) {
    return this.toursService.findAll(artistId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tour by ID' })
  findOne(@Param('id') id: string) {
    return this.toursService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a tour' })
  update(@Param('id') id: string, @Body() updateTourDto: UpdateTourDto) {
    return this.toursService.update(id, updateTourDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a tour' })
  remove(@Param('id') id: string) {
    return this.toursService.remove(id);
  }
}
