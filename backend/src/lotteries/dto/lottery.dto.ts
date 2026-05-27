import { IsString, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateLotteryDto {
  @ApiProperty({ example: 'live-uuid' })
  @IsString()
  liveId: string;

  @ApiProperty({ example: '最速先行' })
  @IsString()
  roundType: string;

  @ApiPropertyOptional({ example: 'CD購入者対象' })
  @IsString()
  @IsOptional()
  requirement?: string;

  @ApiProperty({ example: '2024-11-01T00:00:00Z' })
  @IsDateString()
  startTime: string;

  @ApiProperty({ example: '2024-11-07T23:59:59Z' })
  @IsDateString()
  endTime: string;

  @ApiPropertyOptional({ example: 'https://example.com/lottery' })
  @IsString()
  @IsOptional()
  sourceUrl?: string;

  @ApiPropertyOptional({ example: 'Additional notes about this lottery' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateLotteryDto extends PartialType(CreateLotteryDto) {}
