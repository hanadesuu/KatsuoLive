import { IsString, IsOptional, IsDateString, IsUrl } from 'class-validator';

export class CreateTourDto {
  @IsString()
  artistId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsUrl()
  officialPageUrl?: string;
}

export class UpdateTourDto {
  @IsOptional()
  @IsString()
  artistId?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsUrl()
  officialPageUrl?: string;
}
