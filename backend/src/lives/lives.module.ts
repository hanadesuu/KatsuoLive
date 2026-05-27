import { Module } from '@nestjs/common';
import { LivesService } from './lives.service';
import { LivesController } from './lives.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  providers: [LivesService],
  controllers: [LivesController],
  exports: [LivesService],
})
export class LivesModule {}
