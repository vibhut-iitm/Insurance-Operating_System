import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  ClaimDto, CommunicationDto, FamilyMemberDto, GrievanceDto, LeadDto,
  OmbudsmanCaseDto, PageQueryDto, PolicyDto, PolicyMemberDto, ProductDto,
  QuoteDto, RenewalDto, TaskDto, UpdateClaimDto, UpdateCommunicationDto,
  UpdateFamilyMemberDto, UpdateGrievanceDto, UpdateLeadDto,
  UpdateOmbudsmanCaseDto, UpdatePolicyDto, UpdatePolicyMemberDto,
  UpdateProductDto, UpdateQuoteDto, UpdateRenewalDto, UpdateTaskDto, PublicLeadDto,
} from './dto';

type Page = Pick<PageQueryDto, 'page' | 'limit' | 'search'>;
type Audited = { id: string; customerId?: string };

@Injectable()
export class BusinessService {
  constructor(private readonly prisma: PrismaService) {}

  private async page<T>(items: Prisma.PrismaPromise<T[]>, count: Prisma.PrismaPromise<number>, query: Page) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 100);
    const [rows, total] = await this.prisma.$transaction([items, count]);
    return { items: rows, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  private async track(userId: string, entity: string, action: string, row: Audited, description: string) {
    const writes: Prisma.PrismaPromise<unknown>[] = [
      this.prisma.auditLog.create({ data: { userId, action, entity, entityId: row.id } }),
    ];
    if (row.customerId) {
      writes.push(this.prisma.activity.create({
        data: { userId, customerId: row.customerId, type: action, description },
      }));
    }
    await this.prisma.$transaction(writes);
  }

  async listProducts(query: Page) {
    const where: Prisma.InsuranceProductWhereInput = query.search
      ? { OR: [{ name: { contains: query.search, mode: 'insensitive' } }, { insurer: { contains: query.search, mode: 'insensitive' } }, { category: { contains: query.search, mode: 'insensitive' } }] }
      : {};
    return this.page(this.prisma.insuranceProduct.findMany({ where, skip: ((query.page ?? 1) - 1) * Math.min(query.limit ?? 20, 100), take: Math.min(query.limit ?? 20, 100), orderBy: { name: 'asc' } }), this.prisma.insuranceProduct.count({ where }), query);
  }

  async getProduct(id: string) {
    const row = await this.prisma.insuranceProduct.findUnique({ where: { id }, include: { quotes: { take: 10, orderBy: { createdAt: 'desc' } }, policies: { take: 10, orderBy: { createdAt: 'desc' } } } });
    if (!row) throw new NotFoundException('Product not found');
    return row;
  }

  async createProduct(dto: ProductDto, userId: string) {
    const row = await this.prisma.insuranceProduct.create({ data: dto });
    await this.track(userId, 'product', 'PRODUCT_CREATED', row, 'Insurance product created');
    return row;
  }

  async updateProduct(id: string, dto: UpdateProductDto, userId: string) {
    await this.getProduct(id);
    const row = await this.prisma.insuranceProduct.update({ where: { id }, data: dto });
    await this.track(userId, 'product', 'PRODUCT_UPDATED', row, 'Insurance product updated');
    return row;
  }

  async listLeads(query: Page) {
    const where: Prisma.LeadWhereInput = query.search
      ? { OR: [{ source: { contains: query.search, mode: 'insensitive' } }, { requirement: { contains: query.search, mode: 'insensitive' } }, { customer: { fullName: { contains: query.search, mode: 'insensitive' } } }] }
      : {};
    const take = Math.min(query.limit ?? 20, 100);
    return this.page(this.prisma.lead.findMany({ where, skip: ((query.page ?? 1) - 1) * take, take, orderBy: { createdAt: 'desc' }, include: { customer: true, assignedUser: { select: { id: true, name: true } }, quotes: true } }), this.prisma.lead.count({ where }), query);
  }

  async getLead(id: string) {
    const row = await this.prisma.lead.findUnique({ where: { id }, include: { customer: true, assignedUser: { select: { id: true, name: true } }, quotes: { include: { product: true } }, tasks: { orderBy: { dueDate: 'asc' } } } });
    if (!row) throw new NotFoundException('Lead not found');
    return row;
  }

  async createLead(dto: LeadDto, userId: string) {
    const row = await this.prisma.lead.create({ data: { ...dto, followUpDate: dto.followUpDate ? new Date(dto.followUpDate) : undefined } });
    await this.track(userId, 'lead', 'LEAD_CREATED', row, 'Lead created');
    return row;
  }

  async createPublicLead(dto: PublicLeadDto) {
    const phone = dto.phone.replace(/[^\d+]/g, '');
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 1);
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.customer.findFirst({ where: { phone } });
      const customer = existing
        ? await tx.customer.update({ where: { id: existing.id }, data: { email: existing.email ?? dto.email } })
        : await tx.customer.create({ data: { fullName: dto.fullName, phone, email: dto.email } });
      const lead = await tx.lead.create({
        data: { customerId: customer.id, source: 'Website', category: dto.category, requirement: dto.requirement },
      });
      await tx.task.create({
        data: {
          title: `Follow up: ${customer.fullName}`,
          description: `Review new website enquiry for ${dto.category}`,
          customerId: customer.id,
          leadId: lead.id,
          relatedEntity: lead.id,
          dueDate,
        },
      });
      await tx.activity.create({
        data: { customerId: customer.id, type: 'WEBSITE_LEAD_CREATED', description: 'New website enquiry received' },
      });
      await tx.auditLog.create({
        data: { action: 'WEBSITE_LEAD_CREATED', entity: 'lead', entityId: lead.id },
      });
      return { lead, customer: { id: customer.id, fullName: customer.fullName, phone: customer.phone } };
    });
  }

  async updateLead(id: string, dto: UpdateLeadDto, userId: string) {
    const current = await this.getLead(id);
    const row = await this.prisma.lead.update({ where: { id }, data: { ...dto, followUpDate: dto.followUpDate === undefined ? undefined : dto.followUpDate ? new Date(dto.followUpDate) : null } });
    await this.track(userId, 'lead', 'LEAD_UPDATED', row, 'Lead updated');
    return { ...row, customerId: current.customerId };
  }

  async listQuotes(query: Page) {
    const where: Prisma.QuoteWhereInput = query.search
      ? { OR: [{ insurer: { contains: query.search, mode: 'insensitive' } }, { customer: { fullName: { contains: query.search, mode: 'insensitive' } } }] }
      : {};
    const take = Math.min(query.limit ?? 20, 100);
    return this.page(this.prisma.quote.findMany({ where, skip: ((query.page ?? 1) - 1) * take, take, orderBy: { createdAt: 'desc' }, include: { customer: true, product: true, lead: true, acceptedPolicy: true } }), this.prisma.quote.count({ where }), query);
  }

  async getQuote(id: string) {
    const row = await this.prisma.quote.findUnique({ where: { id }, include: { customer: true, product: true, lead: true, acceptedPolicy: true } });
    if (!row) throw new NotFoundException('Quote not found');
    return row;
  }

  async createQuote(dto: QuoteDto, userId: string) {
    if (dto.leadId) {
      const lead = await this.prisma.lead.findUnique({ where: { id: dto.leadId }, select: { customerId: true } });
      if (!lead) throw new NotFoundException('Lead not found');
      if (lead.customerId !== dto.customerId) throw new BadRequestException('The selected lead does not belong to the selected customer');
    }
    const row = await this.prisma.quote.create({ data: { ...dto, validityDate: dto.validityDate ? new Date(dto.validityDate) : undefined } });
    await this.track(userId, 'quote', 'QUOTE_CREATED', row, 'Quote created');
    return row;
  }

  async updateQuote(id: string, dto: UpdateQuoteDto, userId: string) {
    const current = await this.getQuote(id);
    const row = await this.prisma.quote.update({ where: { id }, data: { ...dto, validityDate: dto.validityDate === undefined ? undefined : dto.validityDate ? new Date(dto.validityDate) : null } });
    await this.track(userId, 'quote', 'QUOTE_UPDATED', { ...row, customerId: current.customerId }, 'Quote updated');
    return row;
  }

  async acceptQuote(id: string, policyNumber: string, userId: string) {
    const quote = await this.getQuote(id);
    if (quote.acceptedPolicy) return quote.acceptedPolicy;
    const today = new Date();
    const endDate = new Date(today);
    endDate.setFullYear(endDate.getFullYear() + 1);
    const policy = await this.prisma.$transaction(async (tx) => {
      const created = await tx.policy.create({ data: {
        customerId: quote.customerId,
        productId: quote.productId,
        quoteId: quote.id,
        policyNumber,
        policyType: quote.coverage ?? quote.product.category,
        startDate: today,
        endDate,
        premium: quote.premium,
        status: 'ACTIVE',
      } });
      await tx.quote.update({ where: { id }, data: { status: 'ACCEPTED' } });
      if (quote.leadId) await tx.lead.update({ where: { id: quote.leadId }, data: { status: 'WON' } });
      const reminderDate = new Date(endDate);
      reminderDate.setDate(reminderDate.getDate() - 30);
      await tx.renewal.create({ data: { policyId: created.id, customerId: created.customerId, renewalDate: endDate, reminderDate } });
      return created;
    });
    await this.track(userId, 'policy', 'POLICY_ISSUED', { ...policy, customerId: quote.customerId }, 'Quote accepted and policy issued');
    return policy;
  }

  async listPolicies(query: Page) {
    const where: Prisma.PolicyWhereInput = query.search
      ? { OR: [{ policyNumber: { contains: query.search, mode: 'insensitive' } }, { customer: { fullName: { contains: query.search, mode: 'insensitive' } } }] }
      : {};
    const take = Math.min(query.limit ?? 20, 100);
    return this.page(this.prisma.policy.findMany({ where, skip: ((query.page ?? 1) - 1) * take, take, orderBy: { endDate: 'asc' }, include: { customer: true, product: true, quote: true, members: true } }), this.prisma.policy.count({ where }), query);
  }

  async getPolicy(id: string) {
    const row = await this.prisma.policy.findUnique({ where: { id }, include: { customer: true, product: true, quote: true, members: true, renewals: true, claims: true, documents: true, tasks: true } });
    if (!row) throw new NotFoundException('Policy not found');
    return row;
  }

  async createPolicy(dto: PolicyDto, userId: string) {
    if (new Date(dto.endDate) <= new Date(dto.startDate)) throw new BadRequestException('Policy endDate must be after startDate');
    if (dto.quoteId) {
      const quote = await this.prisma.quote.findUnique({ where: { id: dto.quoteId }, select: { customerId: true } });
      if (!quote) throw new NotFoundException('Quote not found');
      if (quote.customerId !== dto.customerId) throw new BadRequestException('The selected quote does not belong to the selected customer');
    }
    const endDate = new Date(dto.endDate);
    const reminderDate = new Date(endDate);
    reminderDate.setDate(reminderDate.getDate() - 30);
    const row = await this.prisma.$transaction(async (tx) => {
      const policy = await tx.policy.create({ data: { ...dto, startDate: new Date(dto.startDate), endDate } });
      await tx.renewal.create({ data: { policyId: policy.id, customerId: policy.customerId, renewalDate: endDate, reminderDate } });
      return policy;
    });
    await this.track(userId, 'policy', 'POLICY_CREATED', row, 'Policy created');
    return row;
  }

  async updatePolicy(id: string, dto: UpdatePolicyDto, userId: string) {
    const current = await this.getPolicy(id);
    const startDate = dto.startDate ? new Date(dto.startDate) : current.startDate;
    const endDate = dto.endDate ? new Date(dto.endDate) : current.endDate;
    if (endDate <= startDate) throw new BadRequestException('Policy endDate must be after startDate');
    const row = await this.prisma.policy.update({ where: { id }, data: { ...dto, startDate: dto.startDate ? startDate : undefined, endDate: dto.endDate ? endDate : undefined } });
    if (dto.endDate) {
      const reminderDate = new Date(endDate);
      reminderDate.setDate(reminderDate.getDate() - 30);
      await this.prisma.renewal.updateMany({
        where: { policyId: id, status: { in: ['UPCOMING', 'DUE', 'OVERDUE'] }, renewalDate: current.endDate },
        data: { renewalDate: endDate, reminderDate },
      });
    }
    await this.track(userId, 'policy', 'POLICY_UPDATED', row, 'Policy updated');
    return row;
  }

  async listRenewals(query: Page) {
    const where: Prisma.RenewalWhereInput = query.search
      ? { OR: [{ policy: { policyNumber: { contains: query.search, mode: 'insensitive' } } }, { customer: { fullName: { contains: query.search, mode: 'insensitive' } } }] }
      : {};
    const take = Math.min(query.limit ?? 20, 100);
    return this.page(this.prisma.renewal.findMany({ where, skip: ((query.page ?? 1) - 1) * take, take, orderBy: { renewalDate: 'asc' }, include: { customer: true, policy: { include: { product: true } }, assignedUser: { select: { id: true, name: true } } } }), this.prisma.renewal.count({ where }), query);
  }

  async getRenewal(id: string) {
    const row = await this.prisma.renewal.findUnique({ where: { id }, include: { customer: true, policy: true, assignedUser: { select: { id: true, name: true } } } });
    if (!row) throw new NotFoundException('Renewal not found');
    return row;
  }

  async createRenewal(dto: RenewalDto, userId: string) {
    const policy = await this.prisma.policy.findUnique({ where: { id: dto.policyId }, select: { customerId: true } });
    if (!policy) throw new NotFoundException('Policy not found');
    if (policy.customerId !== dto.customerId) throw new BadRequestException('The selected policy does not belong to the selected customer');
    const row = await this.prisma.renewal.create({ data: { ...dto, renewalDate: new Date(dto.renewalDate), reminderDate: dto.reminderDate ? new Date(dto.reminderDate) : undefined } });
    await this.track(userId, 'renewal', 'RENEWAL_CREATED', row, 'Renewal created');
    return row;
  }

  async updateRenewal(id: string, dto: UpdateRenewalDto, userId: string) {
    await this.getRenewal(id);
    const row = await this.prisma.renewal.update({ where: { id }, data: { ...dto, renewalDate: dto.renewalDate ? new Date(dto.renewalDate) : undefined, reminderDate: dto.reminderDate === undefined ? undefined : dto.reminderDate ? new Date(dto.reminderDate) : null } });
    await this.track(userId, 'renewal', 'RENEWAL_UPDATED', row, 'Renewal updated');
    return row;
  }

  async listClaims(query: Page) {
    const where: Prisma.ClaimWhereInput = query.search
      ? { OR: [{ claimNumber: { contains: query.search, mode: 'insensitive' } }, { customer: { fullName: { contains: query.search, mode: 'insensitive' } } }] }
      : {};
    const take = Math.min(query.limit ?? 20, 100);
    return this.page(this.prisma.claim.findMany({ where, skip: ((query.page ?? 1) - 1) * take, take, orderBy: { createdAt: 'desc' }, include: { customer: true, policy: true, assignedUser: { select: { id: true, name: true } }, documents: true, tasks: true } }), this.prisma.claim.count({ where }), query);
  }

  async getClaim(id: string) {
    const row = await this.prisma.claim.findUnique({ where: { id }, include: { customer: true, policy: true, assignedUser: { select: { id: true, name: true } }, documents: true, tasks: true } });
    if (!row) throw new NotFoundException('Claim not found');
    return row;
  }

  async createClaim(dto: ClaimDto, userId: string) {
    const policy = await this.prisma.policy.findUnique({ where: { id: dto.policyId }, select: { customerId: true } });
    if (!policy) throw new NotFoundException('Policy not found');
    if (policy.customerId !== dto.customerId) throw new BadRequestException('The selected policy does not belong to the selected customer');
    const { incidentDate, claimDate, admissionDate, dischargeDate, ...fields } = dto;
    const row = await this.prisma.claim.create({ data: { ...fields, incidentDate: incidentDate ? new Date(incidentDate) : undefined, claimDate: claimDate ? new Date(claimDate) : undefined, admissionDate: admissionDate ? new Date(admissionDate) : undefined, dischargeDate: dischargeDate ? new Date(dischargeDate) : undefined } });
    await this.track(userId, 'claim', 'CLAIM_CREATED', row, 'Claim created');
    return row;
  }

  async updateClaim(id: string, dto: UpdateClaimDto, userId: string) {
    const current = await this.getClaim(id);
    const { incidentDate, claimDate, admissionDate, dischargeDate, ...fields } = dto;
    const row = await this.prisma.claim.update({ where: { id }, data: { ...fields, incidentDate: incidentDate === undefined ? undefined : incidentDate ? new Date(incidentDate) : null, claimDate: claimDate ? new Date(claimDate) : undefined, admissionDate: admissionDate === undefined ? undefined : admissionDate ? new Date(admissionDate) : null, dischargeDate: dischargeDate === undefined ? undefined : dischargeDate ? new Date(dischargeDate) : null } });
    await this.track(userId, 'claim', 'CLAIM_UPDATED', { ...row, customerId: current.customerId }, 'Claim updated');
    return row;
  }

  async listTasks(query: Page) {
    const where: Prisma.TaskWhereInput = query.search
      ? { OR: [{ title: { contains: query.search, mode: 'insensitive' } }, { customer: { fullName: { contains: query.search, mode: 'insensitive' } } }] }
      : {};
    const take = Math.min(query.limit ?? 20, 100);
    return this.page(this.prisma.task.findMany({ where, skip: ((query.page ?? 1) - 1) * take, take, orderBy: [{ status: 'asc' }, { dueDate: 'asc' }], include: { customer: true, policy: true, lead: true, claim: true, assignedUser: { select: { id: true, name: true } } } }), this.prisma.task.count({ where }), query);
  }

  async getTask(id: string) {
    const row = await this.prisma.task.findUnique({ where: { id }, include: { customer: true, policy: true, lead: true, claim: true, assignedUser: { select: { id: true, name: true } } } });
    if (!row) throw new NotFoundException('Task not found');
    return row;
  }

  async createTask(dto: TaskDto, userId: string) {
    const row = await this.prisma.task.create({ data: { ...dto, dueDate: new Date(dto.dueDate) } });
    await this.track(userId, 'task', 'TASK_CREATED', row, 'Task created');
    return row;
  }

  async updateTask(id: string, dto: UpdateTaskDto, userId: string) {
    const current = await this.getTask(id);
    const row = await this.prisma.task.update({ where: { id }, data: { ...dto, dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined } });
    await this.track(userId, 'task', 'TASK_UPDATED', { ...row, customerId: dto.customerId ?? current.customerId ?? undefined }, 'Task updated');
    return row;
  }

  async listFamilyMembers(query: Page) {
    const where: Prisma.FamilyMemberWhereInput = { isArchived: false, ...(query.search ? { fullName: { contains: query.search, mode: 'insensitive' as const } } : {}) };
    const take = Math.min(query.limit ?? 20, 100);
    return this.page(this.prisma.familyMember.findMany({ where, skip: ((query.page ?? 1) - 1) * take, take, orderBy: { fullName: 'asc' }, include: { customer: { select: { id: true, fullName: true } } } }), this.prisma.familyMember.count({ where }), query);
  }
  async createFamilyMember(dto: FamilyMemberDto, userId: string) {
    const { dateOfBirth, ...fields } = dto;
    const row = await this.prisma.familyMember.create({ data: { ...fields, dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined } });
    await this.track(userId, 'family-member', 'FAMILY_MEMBER_CREATED', { ...row, customerId: row.customerId }, 'Family member added');
    return row;
  }
  async updateFamilyMember(id: string, dto: UpdateFamilyMemberDto, userId: string) {
    const current = await this.prisma.familyMember.findUnique({ where: { id } });
    if (!current) throw new NotFoundException('Family member not found');
    const row = await this.prisma.familyMember.update({ where: { id }, data: { ...dto, dateOfBirth: dto.dateOfBirth === undefined ? undefined : dto.dateOfBirth ? new Date(dto.dateOfBirth) : null } });
    await this.track(userId, 'family-member', 'FAMILY_MEMBER_UPDATED', { ...row, customerId: row.customerId }, 'Family member updated');
    return row;
  }
  async removeFamilyMember(id: string, userId: string) {
    const current = await this.prisma.familyMember.findUnique({ where: { id } });
    if (!current) throw new NotFoundException('Family member not found');
    await this.prisma.$transaction([
      this.prisma.familyMember.update({ where: { id }, data: { isArchived: true } }),
      this.prisma.auditLog.create({ data: { userId, action: 'FAMILY_MEMBER_REMOVED', entity: 'family-member', entityId: id } }),
      this.prisma.activity.create({ data: { userId, customerId: current.customerId, type: 'FAMILY_MEMBER_REMOVED', description: `Family member ${current.fullName} removed` } }),
    ]);
    return { success: true };
  }

  async listPolicyMembers(query: Page) {
    const where: Prisma.PolicyMemberWhereInput = { isArchived: false, ...(query.search ? { fullName: { contains: query.search, mode: 'insensitive' as const } } : {}) };
    const take = Math.min(query.limit ?? 20, 100);
    return this.page(this.prisma.policyMember.findMany({ where, skip: ((query.page ?? 1) - 1) * take, take, orderBy: { fullName: 'asc' }, include: { policy: true, customer: true } }), this.prisma.policyMember.count({ where }), query);
  }
  async createPolicyMember(dto: PolicyMemberDto, userId: string) {
    const row = await this.prisma.policyMember.create({ data: { ...dto, dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined } });
    await this.track(userId, 'policy-member', 'POLICY_MEMBER_CREATED', row, 'Insured member added to policy');
    return row;
  }
  async updatePolicyMember(id: string, dto: UpdatePolicyMemberDto, userId: string) {
    const current = await this.prisma.policyMember.findUnique({ where: { id } });
    if (!current) throw new NotFoundException('Policy member not found');
    const row = await this.prisma.policyMember.update({ where: { id }, data: { ...dto, dateOfBirth: dto.dateOfBirth === undefined ? undefined : dto.dateOfBirth ? new Date(dto.dateOfBirth) : null } });
    await this.track(userId, 'policy-member', 'POLICY_MEMBER_UPDATED', row, 'Insured member updated');
    return row;
  }
  async removePolicyMember(id: string, userId: string) {
    const current = await this.prisma.policyMember.findUnique({ where: { id } });
    if (!current) throw new NotFoundException('Policy member not found');
    await this.prisma.$transaction([
      this.prisma.policyMember.update({ where: { id }, data: { isArchived: true } }),
      this.prisma.auditLog.create({ data: { userId, action: 'POLICY_MEMBER_REMOVED', entity: 'policy-member', entityId: id } }),
      this.prisma.activity.create({ data: { userId, customerId: current.customerId, type: 'POLICY_MEMBER_REMOVED', description: `Insured member ${current.fullName} removed` } }),
    ]);
    return { success: true };
  }

  async listGrievances(query: Page) {
    const where: Prisma.GrievanceWhereInput = query.search ? { OR: [{ referenceNumber: { contains: query.search, mode: 'insensitive' } }, { customer: { fullName: { contains: query.search, mode: 'insensitive' } } }] } : {};
    const take = Math.min(query.limit ?? 20, 100);
    return this.page(this.prisma.grievance.findMany({ where, skip: ((query.page ?? 1) - 1) * take, take, orderBy: { followUpDeadline: 'asc' }, include: { customer: true, ombudsmanCases: true, communications: true } }), this.prisma.grievance.count({ where }), query);
  }
  async getGrievance(id: string) {
    const row = await this.prisma.grievance.findUnique({ where: { id }, include: { customer: true, ombudsmanCases: true, communications: true } });
    if (!row) throw new NotFoundException('Grievance not found');
    return row;
  }
  async createGrievance(dto: GrievanceDto, userId: string) {
    const { complaintDate, escalationDate, followUpDeadline, resolvedAt, ...fields } = dto;
    const row = await this.prisma.grievance.create({ data: { ...fields, complaintDate: complaintDate ? new Date(complaintDate) : undefined, escalationDate: escalationDate ? new Date(escalationDate) : undefined, followUpDeadline: followUpDeadline ? new Date(followUpDeadline) : undefined, resolvedAt: resolvedAt ? new Date(resolvedAt) : undefined } });
    await this.track(userId, 'grievance', 'GRIEVANCE_CREATED', row, 'Grievance recorded');
    return row;
  }
  async updateGrievance(id: string, dto: UpdateGrievanceDto, userId: string) {
    const current = await this.getGrievance(id);
    const { complaintDate, escalationDate, followUpDeadline, resolvedAt, ...fields } = dto;
    const row = await this.prisma.grievance.update({ where: { id }, data: { ...fields, complaintDate: complaintDate ? new Date(complaintDate) : undefined, escalationDate: escalationDate === undefined ? undefined : escalationDate ? new Date(escalationDate) : null, followUpDeadline: followUpDeadline === undefined ? undefined : followUpDeadline ? new Date(followUpDeadline) : null, resolvedAt: resolvedAt === undefined ? undefined : resolvedAt ? new Date(resolvedAt) : null } });
    await this.track(userId, 'grievance', 'GRIEVANCE_UPDATED', { ...row, customerId: current.customerId }, 'Grievance updated');
    return row;
  }

  async listOmbudsmanCases(query: Page) {
    const where: Prisma.OmbudsmanCaseWhereInput = query.search ? { OR: [{ caseNumber: { contains: query.search, mode: 'insensitive' } }, { customer: { fullName: { contains: query.search, mode: 'insensitive' } } }] } : {};
    const take = Math.min(query.limit ?? 20, 100);
    return this.page(this.prisma.ombudsmanCase.findMany({ where, skip: ((query.page ?? 1) - 1) * take, take, orderBy: { deadline: 'asc' }, include: { customer: true, grievance: true, communications: true } }), this.prisma.ombudsmanCase.count({ where }), query);
  }
  async getOmbudsmanCase(id: string) {
    const row = await this.prisma.ombudsmanCase.findUnique({ where: { id }, include: { customer: true, grievance: true, communications: true } });
    if (!row) throw new NotFoundException('Ombudsman case not found');
    return row;
  }
  async createOmbudsmanCase(dto: OmbudsmanCaseDto, userId: string) {
    const { submissionDate, hearingDate, deadline, ...fields } = dto;
    const row = await this.prisma.ombudsmanCase.create({ data: { ...fields, submissionDate: submissionDate ? new Date(submissionDate) : undefined, hearingDate: hearingDate ? new Date(hearingDate) : undefined, deadline: deadline ? new Date(deadline) : undefined } });
    await this.track(userId, 'ombudsman-case', 'OMBUDSMAN_CASE_CREATED', row, 'Ombudsman case recorded');
    return row;
  }
  async updateOmbudsmanCase(id: string, dto: UpdateOmbudsmanCaseDto, userId: string) {
    const current = await this.getOmbudsmanCase(id);
    const { submissionDate, hearingDate, deadline, ...fields } = dto;
    const row = await this.prisma.ombudsmanCase.update({ where: { id }, data: { ...fields, submissionDate: submissionDate === undefined ? undefined : submissionDate ? new Date(submissionDate) : null, hearingDate: hearingDate === undefined ? undefined : hearingDate ? new Date(hearingDate) : null, deadline: deadline === undefined ? undefined : deadline ? new Date(deadline) : null } });
    await this.track(userId, 'ombudsman-case', 'OMBUDSMAN_CASE_UPDATED', { ...row, customerId: current.customerId }, 'Ombudsman case updated');
    return row;
  }

  async listCommunications(query: Page) {
    const where: Prisma.CommunicationWhereInput = query.search ? { OR: [{ subject: { contains: query.search, mode: 'insensitive' } }, { body: { contains: query.search, mode: 'insensitive' } }, { customer: { fullName: { contains: query.search, mode: 'insensitive' } } }] } : {};
    const take = Math.min(query.limit ?? 20, 100);
    return this.page(this.prisma.communication.findMany({ where, skip: ((query.page ?? 1) - 1) * take, take, orderBy: { occurredAt: 'desc' }, include: { customer: true, grievance: true, ombudsmanCase: true } }), this.prisma.communication.count({ where }), query);
  }
  async createCommunication(dto: CommunicationDto, userId: string) {
    const { occurredAt, ...fields } = dto;
    const row = await this.prisma.communication.create({ data: { ...fields, occurredAt: occurredAt ? new Date(occurredAt) : undefined } });
    await this.track(userId, 'communication', 'COMMUNICATION_RECORDED', row, `Communication recorded via ${row.channel}`);
    return row;
  }
  async updateCommunication(id: string, dto: UpdateCommunicationDto, userId: string) {
    const current = await this.prisma.communication.findUnique({ where: { id } });
    if (!current) throw new NotFoundException('Communication not found');
    const { occurredAt, ...fields } = dto;
    const row = await this.prisma.communication.update({ where: { id }, data: { ...fields, occurredAt: occurredAt ? new Date(occurredAt) : undefined } });
    await this.track(userId, 'communication', 'COMMUNICATION_UPDATED', row, `Communication updated via ${row.channel}`);
    return row;
  }

  async globalSearch(search: string) {
    const term = search.trim();
    if (term.length < 2) return { customers: [], policies: [], claims: [], leads: [], grievances: [], ombudsmanCases: [] };
    const contains = { contains: term, mode: 'insensitive' as const };
    const [customers, policies, claims, leads, grievances, ombudsmanCases] = await Promise.all([
      this.prisma.customer.findMany({ where: { OR: [{ fullName: contains }, { phone: { contains: term } }, { email: contains }] }, take: 10, orderBy: { updatedAt: 'desc' }, select: { id: true, fullName: true, phone: true, email: true } }),
      this.prisma.policy.findMany({ where: { OR: [{ policyNumber: contains }, { customer: { fullName: contains } }] }, take: 10, include: { customer: { select: { id: true, fullName: true } } } }),
      this.prisma.claim.findMany({ where: { OR: [{ claimNumber: contains }, { customer: { fullName: contains } }] }, take: 10, include: { customer: { select: { id: true, fullName: true } } } }),
      this.prisma.lead.findMany({ where: { OR: [{ source: contains }, { customer: { fullName: contains } }] }, take: 10, include: { customer: { select: { id: true, fullName: true } } } }),
      this.prisma.grievance.findMany({ where: { OR: [{ referenceNumber: contains }, { customer: { fullName: contains } }] }, take: 10, include: { customer: { select: { id: true, fullName: true } } } }),
      this.prisma.ombudsmanCase.findMany({ where: { OR: [{ caseNumber: contains }, { customer: { fullName: contains } }] }, take: 10, include: { customer: { select: { id: true, fullName: true } } } }),
    ]);
    return { customers, policies, claims, leads, grievances, ombudsmanCases };
  }

  async reports() {
    const [customers, leads, quotes, policies, renewals, claims, grievances, ombudsmanCases, tasks] = await Promise.all([
      this.prisma.customer.count({ where: { status: 'ACTIVE' } }),
      this.prisma.lead.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.quote.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.policy.groupBy({ by: ['status'], _count: { _all: true }, _sum: { premium: true } }),
      this.prisma.renewal.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.claim.groupBy({ by: ['status'], _count: { _all: true }, _sum: { amount: true } }),
      this.prisma.grievance.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.ombudsmanCase.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.task.groupBy({ by: ['status'], _count: { _all: true } }),
    ]);
    return { customers, leads, quotes, policies, renewals, claims, grievances, ombudsmanCases, tasks, generatedAt: new Date().toISOString() };
  }

  async dashboardSummary() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const [
      totalCustomers, newLeads, pendingQuotes, activePolicies, renewalsDue,
      overdueRenewals, openClaims, overdueTasks, tasks, renewals, leads, claims,
      recentActivity, openGrievances, upcomingOmbudsmanDeadlines,
    ] = await this.prisma.$transaction([
      this.prisma.customer.count(),
      this.prisma.lead.count({ where: { createdAt: { gte: weekStart, lt: weekEnd }, status: 'NEW' } }),
      this.prisma.quote.count({ where: { status: { in: ['DRAFT', 'SENT'] } } }),
      this.prisma.policy.count({ where: { status: 'ACTIVE' } }),
      this.prisma.renewal.count({ where: { renewalDate: { gte: today, lt: tomorrow }, status: { in: ['UPCOMING', 'DUE'] } } }),
      this.prisma.renewal.count({ where: { renewalDate: { lt: today }, status: { in: ['UPCOMING', 'DUE', 'OVERDUE'] } } }),
      this.prisma.claim.count({ where: { status: { notIn: ['CLOSED', 'REJECTED', 'SETTLED'] } } }),
      this.prisma.task.count({ where: { dueDate: { lt: now }, status: { in: ['PENDING', 'IN_PROGRESS'] } } }),
      this.prisma.task.findMany({ where: { status: { in: ['PENDING', 'IN_PROGRESS'] } }, orderBy: { dueDate: 'asc' }, take: 8, select: { id: true, title: true, dueDate: true, priority: true, status: true, customer: { select: { id: true, fullName: true } } } }),
      this.prisma.renewal.findMany({ where: { status: { in: ['UPCOMING', 'DUE', 'OVERDUE'] } }, orderBy: { renewalDate: 'asc' }, take: 8, select: { id: true, renewalDate: true, status: true, policy: { select: { policyNumber: true } }, customer: { select: { id: true, fullName: true } } } }),
      this.prisma.lead.findMany({ orderBy: { createdAt: 'desc' }, take: 8, select: { id: true, source: true, status: true, priority: true, createdAt: true, customer: { select: { id: true, fullName: true } } } }),
      this.prisma.claim.findMany({ where: { status: { notIn: ['CLOSED', 'REJECTED', 'SETTLED'] } }, orderBy: { createdAt: 'desc' }, take: 8, select: { id: true, claimNumber: true, status: true, amount: true, customer: { select: { id: true, fullName: true } } } }),
      this.prisma.activity.findMany({ orderBy: { createdAt: 'desc' }, take: 10, select: { id: true, type: true, description: true, createdAt: true, customer: { select: { id: true, fullName: true } } } }),
      this.prisma.grievance.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS', 'ESCALATED'] } } }),
      this.prisma.ombudsmanCase.count({ where: { status: { in: ['SUBMITTED', 'PENDING', 'HEARING'] }, deadline: { gte: today, lte: new Date(today.getTime() + 7 * 86400000) } } }),
    ]);
    return {
      metrics: { totalCustomers, newLeads, pendingQuotes, activePolicies, renewalsDue, overdueRenewals, openClaims, overdueTasks, openGrievances, upcomingOmbudsmanDeadlines },
      actionable: { tasks, renewals, leads, claims, recentActivity },
    };
  }
}
