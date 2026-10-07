import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BusinessService } from './business.service';
import { PublicLeadRateLimitGuard } from './public-lead-rate-limit.guard';
import { PublicLeadDto } from './dto';

@ApiTags('Public website')
@Controller('public/leads')
@UseGuards(PublicLeadRateLimitGuard)
export class PublicLeadsController {
  constructor(private readonly business: BusinessService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a website enquiry and create a follow-up task' })
  create(@Body() dto: PublicLeadDto) {
    return this.business.createPublicLead(dto);
  }
}
