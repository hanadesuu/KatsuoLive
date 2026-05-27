import { IsString, IsOptional, IsObject, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateArtistDto {
  @ApiProperty({ example: 'あいみょん' })
  @IsString()
  nameJp: string;

  @ApiPropertyOptional({ example: 'Aimyon' })
  @IsString()
  @IsOptional()
  nameEn?: string;

  @ApiPropertyOptional({ example: '爱缪' })
  @IsString()
  @IsOptional()
  nameCn?: string;

  @ApiPropertyOptional({ 
    example: ['ztmy', '真夜中', 'zutomayo'],
    description: 'Search keywords for the artist'
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  searchKeywords?: string[];

  @ApiPropertyOptional({
    example: {
      website: 'https://example.com',
      twitter: 'https://twitter.com/example',
      instagram: 'https://instagram.com/example',
    },
  })
  @IsObject()
  @IsOptional()
  officialLinks?: any;

  @ApiPropertyOptional({ example: 'Popular Japanese singer-songwriter' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  @IsString()
  @IsOptional()
  coverImage?: string;
}

export class UpdateArtistDto extends PartialType(CreateArtistDto) {}
