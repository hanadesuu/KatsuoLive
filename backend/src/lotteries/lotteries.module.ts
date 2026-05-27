import { Module } from '@nestjs/common';
import { LotteriesService } from './lotteries.service';
import { LotteriesController } from './lotteries.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  providers: [LotteriesService],
  controllers: [LotteriesController],
  exports: [LotteriesService],
})
export class LotteriesModule {}
