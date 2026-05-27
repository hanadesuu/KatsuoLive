import {
  IsString,
  IsOptional,
  IsObject,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

enum DocumentStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export class CreateDocumentDto {
  @ApiPropertyOptional({ example: 'live-uuid' })
  @IsString()
  @IsOptional()
  liveId?: string;

  @ApiProperty({ example: 'Important Information' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'important-information' })
  @IsString()
  slug: string;

  @ApiProperty({
    example: {
      time: 1234567890,
      blocks: [
        {
          type: 'paragraph',
          data: { text: 'This is sample content' },
        },
      ],
      version: '2.28.0',
    },
  })
  @IsObject()
  blocks: any;

  @ApiPropertyOptional({ enum: DocumentStatus, default: 'DRAFT' })
  @IsEnum(DocumentStatus)
  @IsOptional()
  status?: DocumentStatus;
}

export class UpdateDocumentDto extends PartialType(CreateDocumentDto) {}
