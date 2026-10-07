import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { IsString, Length } from 'class-validator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { RoleName } from '../common/domain.enums';
import { UserRequest } from './request.types';
import { BusinessService } from './business.service';
import {
  ClaimDto, CommunicationDto, FamilyMemberDto, GrievanceDto, LeadDto,
  OmbudsmanCaseDto, PageQueryDto, PolicyDto, PolicyMemberDto, ProductDto,
  QuoteDto, RenewalDto, TaskDto, UpdateClaimDto, UpdateCommunicationDto,
  UpdateFamilyMemberDto, UpdateGrievanceDto, UpdateLeadDto,
  UpdateOmbudsmanCaseDto, UpdatePolicyDto, UpdatePolicyMemberDto,
  UpdateProductDto, UpdateQuoteDto, UpdateRenewalDto, UpdateTaskDto,
} from './dto';

class AcceptQuoteDto {
  @IsString() @Length(1, 100) policyNumber!: string;
}

@Controller()
@ApiTags('Insurance operations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class BusinessController {
  constructor(private readonly business: BusinessService) {}

  @Get('products')
  products(@Query() query: PageQueryDto) { return this.business.listProducts(query); }
  @Get('products/:id')
  product(@Param('id') id: string) { return this.business.getProduct(id); }
  @Post('products')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN)
  createProduct(@Body() dto: ProductDto, @Req() req: UserRequest) { return this.business.createProduct(dto, req.user.sub); }
  @Patch('products/:id')
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN)
  updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto, @Req() req: UserRequest) { return this.business.updateProduct(id, dto, req.user.sub); }

  @Get('leads')
  leads(@Query() query: PageQueryDto) { return this.business.listLeads(query); }
  @Get('leads/:id')
  lead(@Param('id') id: string) { return this.business.getLead(id); }
  @Post('leads')
  createLead(@Body() dto: LeadDto, @Req() req: UserRequest) { return this.business.createLead(dto, req.user.sub); }
  @Patch('leads/:id')
  updateLead(@Param('id') id: string, @Body() dto: UpdateLeadDto, @Req() req: UserRequest) { return this.business.updateLead(id, dto, req.user.sub); }

  @Get('quotes')
  quotes(@Query() query: PageQueryDto) { return this.business.listQuotes(query); }
  @Get('quotes/:id')
  quote(@Param('id') id: string) { return this.business.getQuote(id); }
  @Post('quotes')
  createQuote(@Body() dto: QuoteDto, @Req() req: UserRequest) { return this.business.createQuote(dto, req.user.sub); }
  @Patch('quotes/:id')
  updateQuote(@Param('id') id: string, @Body() dto: UpdateQuoteDto, @Req() req: UserRequest) { return this.business.updateQuote(id, dto, req.user.sub); }
  @Post('quotes/:id/accept')
  acceptQuote(@Param('id') id: string, @Body() dto: AcceptQuoteDto, @Req() req: UserRequest) { return this.business.acceptQuote(id, dto.policyNumber, req.user.sub); }

  @Get('policies')
  policies(@Query() query: PageQueryDto) { return this.business.listPolicies(query); }
  @Get('policies/:id')
  policy(@Param('id') id: string) { return this.business.getPolicy(id); }
  @Post('policies')
  createPolicy(@Body() dto: PolicyDto, @Req() req: UserRequest) { return this.business.createPolicy(dto, req.user.sub); }
  @Patch('policies/:id')
  updatePolicy(@Param('id') id: string, @Body() dto: UpdatePolicyDto, @Req() req: UserRequest) { return this.business.updatePolicy(id, dto, req.user.sub); }

  @Get('renewals')
  renewals(@Query() query: PageQueryDto) { return this.business.listRenewals(query); }
  @Get('renewals/:id')
  renewal(@Param('id') id: string) { return this.business.getRenewal(id); }
  @Post('renewals')
  createRenewal(@Body() dto: RenewalDto, @Req() req: UserRequest) { return this.business.createRenewal(dto, req.user.sub); }
  @Patch('renewals/:id')
  updateRenewal(@Param('id') id: string, @Body() dto: UpdateRenewalDto, @Req() req: UserRequest) { return this.business.updateRenewal(id, dto, req.user.sub); }

  @Get('claims')
  claims(@Query() query: PageQueryDto) { return this.business.listClaims(query); }
  @Get('claims/:id')
  claim(@Param('id') id: string) { return this.business.getClaim(id); }
  @Post('claims')
  createClaim(@Body() dto: ClaimDto, @Req() req: UserRequest) { return this.business.createClaim(dto, req.user.sub); }
  @Patch('claims/:id')
  updateClaim(@Param('id') id: string, @Body() dto: UpdateClaimDto, @Req() req: UserRequest) { return this.business.updateClaim(id, dto, req.user.sub); }

  @Get('tasks')
  tasks(@Query() query: PageQueryDto) { return this.business.listTasks(query); }
  @Get('tasks/:id')
  task(@Param('id') id: string) { return this.business.getTask(id); }
  @Post('tasks')
  createTask(@Body() dto: TaskDto, @Req() req: UserRequest) { return this.business.createTask(dto, req.user.sub); }
  @Patch('tasks/:id')
  updateTask(@Param('id') id: string, @Body() dto: UpdateTaskDto, @Req() req: UserRequest) { return this.business.updateTask(id, dto, req.user.sub); }

  @Get('family-members')
  familyMembers(@Query() query: PageQueryDto) { return this.business.listFamilyMembers(query); }
  @Post('family-members')
  createFamilyMember(@Body() dto: FamilyMemberDto, @Req() req: UserRequest) { return this.business.createFamilyMember(dto, req.user.sub); }
  @Patch('family-members/:id')
  updateFamilyMember(@Param('id') id: string, @Body() dto: UpdateFamilyMemberDto, @Req() req: UserRequest) { return this.business.updateFamilyMember(id, dto, req.user.sub); }
  @Post('family-members/:id/archive')
  removeFamilyMember(@Param('id') id: string, @Req() req: UserRequest) { return this.business.removeFamilyMember(id, req.user.sub); }

  @Get('policy-members')
  policyMembers(@Query() query: PageQueryDto) { return this.business.listPolicyMembers(query); }
  @Post('policy-members')
  createPolicyMember(@Body() dto: PolicyMemberDto, @Req() req: UserRequest) { return this.business.createPolicyMember(dto, req.user.sub); }
  @Patch('policy-members/:id')
  updatePolicyMember(@Param('id') id: string, @Body() dto: UpdatePolicyMemberDto, @Req() req: UserRequest) { return this.business.updatePolicyMember(id, dto, req.user.sub); }
  @Post('policy-members/:id/archive')
  removePolicyMember(@Param('id') id: string, @Req() req: UserRequest) { return this.business.removePolicyMember(id, req.user.sub); }

  @Get('grievances')
  grievances(@Query() query: PageQueryDto) { return this.business.listGrievances(query); }
  @Get('grievances/:id')
  grievance(@Param('id') id: string) { return this.business.getGrievance(id); }
  @Post('grievances')
  createGrievance(@Body() dto: GrievanceDto, @Req() req: UserRequest) { return this.business.createGrievance(dto, req.user.sub); }
  @Patch('grievances/:id')
  updateGrievance(@Param('id') id: string, @Body() dto: UpdateGrievanceDto, @Req() req: UserRequest) { return this.business.updateGrievance(id, dto, req.user.sub); }

  @Get('ombudsman-cases')
  ombudsmanCases(@Query() query: PageQueryDto) { return this.business.listOmbudsmanCases(query); }
  @Get('ombudsman-cases/:id')
  ombudsmanCase(@Param('id') id: string) { return this.business.getOmbudsmanCase(id); }
  @Post('ombudsman-cases')
  createOmbudsmanCase(@Body() dto: OmbudsmanCaseDto, @Req() req: UserRequest) { return this.business.createOmbudsmanCase(dto, req.user.sub); }
  @Patch('ombudsman-cases/:id')
  updateOmbudsmanCase(@Param('id') id: string, @Body() dto: UpdateOmbudsmanCaseDto, @Req() req: UserRequest) { return this.business.updateOmbudsmanCase(id, dto, req.user.sub); }

  @Get('communications')
  communications(@Query() query: PageQueryDto) { return this.business.listCommunications(query); }
  @Post('communications')
  createCommunication(@Body() dto: CommunicationDto, @Req() req: UserRequest) { return this.business.createCommunication(dto, req.user.sub); }
  @Patch('communications/:id')
  updateCommunication(@Param('id') id: string, @Body() dto: UpdateCommunicationDto, @Req() req: UserRequest) { return this.business.updateCommunication(id, dto, req.user.sub); }

  @Get('search')
  search(@Query('q') search = '') { return this.business.globalSearch(search); }
  @Get('reports/summary')
  reports() { return this.business.reports(); }
}
