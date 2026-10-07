import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { BusinessController } from './business.controller';
import { DocumentsController } from './documents.controller';
import { PublicLeadsController } from './public-leads.controller';
import { BusinessService } from './business.service';
import { DocumentsService } from './documents.service';
import { PublicLeadRateLimitGuard } from './public-lead-rate-limit.guard';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [BusinessController, DocumentsController, PublicLeadsController],
  providers: [BusinessService, DocumentsService, PublicLeadRateLimitGuard],
  exports: [BusinessService],
})
export class BusinessModule {}
