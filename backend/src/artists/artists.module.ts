import { Module } from '@nestjs/common';
import { ArtistsService } from './artists.service';
import { ArtistsController } from './artists.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  providers: [ArtistsService],
  controllers: [ArtistsController],
  exports: [ArtistsService],
})
export class ArtistsModule {}
