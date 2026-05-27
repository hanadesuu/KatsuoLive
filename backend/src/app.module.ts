import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ArtistsModule } from './artists/artists.module';
import { ToursModule } from './tours/tours.module';
import { LivesModule } from './lives/lives.module';
import { LotteriesModule } from './lotteries/lotteries.module';
import { DocumentsModule } from './documents/documents.module';
import { RolesModule } from './roles/roles.module';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    RolesModule,
    ArtistsModule,
    ToursModule,
    LivesModule,
    LotteriesModule,
    DocumentsModule,
    AuditModule,
  ],
})
export class AppModule {}
