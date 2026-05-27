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
import { DocumentsService } from './documents.service';
import { CreateDocumentDto, UpdateDocumentDto } from './dto/document.dto';
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

@ApiTags('documents')
@Controller('documents')
export class DocumentsController {
  constructor(
    private documentsService: DocumentsService,
    private auditService: AuditService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create document' })
  async create(@Body() createDocumentDto: CreateDocumentDto, @Request() req) {
    const document = await this.documentsService.create(createDocumentDto);
    await this.auditService.log({
      userId: req.user.userId,
      action: 'create',
      resource: 'document',
      resourceId: document.id,
      changes: { after: document },
    });
    return document;
  }

  @Get()
  @ApiOperation({ summary: 'Get all documents' })
  @ApiQuery({ name: 'liveId', required: false })
  findAll(@Query('liveId') liveId?: string) {
    return this.documentsService.findAll(liveId);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get document by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.documentsService.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document by ID' })
  findOne(@Param('id') id: string) {
    return this.documentsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'editor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update document' })
  async update(
    @Param('id') id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
    @Request() req,
  ) {
    const before = await this.documentsService.findOne(id);
    const document = await this.documentsService.update(id, updateDocumentDto);
    await this.auditService.log({
      userId: req.user.userId,
      action: 'update',
      resource: 'document',
      resourceId: document.id,
      changes: { before, after: document },
    });
    return document;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete document' })
  async remove(@Param('id') id: string, @Request() req) {
    const document = await this.documentsService.findOne(id);
    await this.documentsService.remove(id);
    await this.auditService.log({
      userId: req.user.userId,
      action: 'delete',
      resource: 'document',
      resourceId: id,
      changes: { before: document },
    });
    return { message: 'Document deleted successfully' };
  }
}
