import { IsString, IsDateString, IsOptional, IsEnum, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

enum LiveStatus {
  UPCOMING = 'UPCOMING',
  ONGOING = 'ONGOING',
  FINISHED = 'FINISHED',
  CANCELLED = 'CANCELLED',
}

export class CreateLiveDto {
  @ApiProperty({ example: 'artist-uuid' })
  @IsString()
  artistId: string;

  @ApiProperty({ example: 'Tour 2024 - Tokyo' })
  @IsString()
  title: string;

  @ApiProperty({ example: '2024-12-01T18:00:00Z' })
  @IsDateString()
  dateStart: string;

  @ApiPropertyOptional({ example: '2024-12-02T21:00:00Z' })
  @IsDateString()
  @IsOptional()
  dateEnd?: string;

  @ApiProperty({ example: 'Tokyo Dome' })
  @IsString()
  venue: string;

  @ApiProperty({ example: 'Tokyo' })
  @IsString()
  city: string;

  @ApiPropertyOptional({ example: 'https://example.com/live' })
  @IsString()
  @IsOptional()
  officialPageUrl?: string;

  @ApiPropertyOptional({ enum: LiveStatus, default: 'UPCOMING' })
  @IsEnum(LiveStatus)
  @IsOptional()
  status?: LiveStatus;

  @ApiPropertyOptional({ example: 'https://example.com/cover.jpg' })
  @IsString()
  @IsOptional()
  coverImage?: string;
}

export class UpdateLiveDto extends PartialType(CreateLiveDto) {
  @ApiPropertyOptional({ 
    example: ['lottery-uuid-1', 'lottery-uuid-2'],
    description: 'Array of lottery IDs to associate with this live event'
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  lotteryIds?: string[];
}
