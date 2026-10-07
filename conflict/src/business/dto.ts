import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { Prisma } from '@prisma/client';
import {
  ClaimStatus, CommunicationChannel, CommunicationDirection, GrievanceStatus,
  LeadStatus, OmbudsmanCaseStatus, PolicyStatus, Priority, QuoteStatus, RenewalStatus,
  TaskStatus,
} from '../common/domain.enums';
import {
  IsBoolean, IsDateString, IsEnum, IsInt, IsNumber, IsObject, IsOptional,
  IsEmail, IsString, IsUUID, Length, Matches, Min,
} from 'class-validator';

export class PageQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) limit = 20;
  @IsOptional() @IsString() search?: string;
}

export class ProductDto {
  @IsString() @Length(2, 160) name!: string;
  @IsString() @Length(2, 160) insurer!: string;
  @IsString() @Length(2, 80) category!: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
export class UpdateProductDto extends PartialType(ProductDto) {}

export class LeadDto {
  @IsUUID() customerId!: string;
  @IsString() @Length(2, 80) source!: string;
  @IsOptional() @IsEnum(LeadStatus) status?: LeadStatus;
  @IsOptional() @IsEnum(Priority) priority?: Priority;
  @IsOptional() @IsUUID() assignedUserId?: string;
  @IsOptional() @IsNumber() @Min(0) @Type(() => Number) expectedValue?: number;
  @IsOptional() @IsDateString() followUpDate?: string;
  @IsOptional() @IsString() requirement?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() notes?: string;
}
export class UpdateLeadDto extends PartialType(LeadDto) {}

export class QuoteDto {
  @IsUUID() customerId!: string;
  @IsOptional() @IsUUID() leadId?: string;
  @IsUUID() productId!: string;
  @IsString() @Length(2, 160) insurer!: string;
  @IsOptional() @IsString() coverage?: string;
  @IsNumber() @Min(0) @Type(() => Number) premium!: number;
  @IsOptional() @IsDateString() validityDate?: string;
  @IsOptional() @IsEnum(QuoteStatus) status?: QuoteStatus;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsObject() benefits?: Prisma.InputJsonObject;
  @IsOptional() @IsObject() exclusions?: Prisma.InputJsonObject;
  @IsOptional() @IsString() deductibles?: string;
  @IsOptional() @IsObject() riders?: Prisma.InputJsonObject;
}
export class UpdateQuoteDto extends PartialType(QuoteDto) {}

export class PolicyDto {
  @IsUUID() customerId!: string;
  @IsUUID() productId!: string;
  @IsOptional() @IsUUID() quoteId?: string;
  @IsOptional() @IsUUID() assignedUserId?: string;
  @IsString() @Length(1, 100) policyNumber!: string;
  @IsString() @Length(2, 100) policyType!: string;
  @IsDateString() startDate!: string;
  @IsDateString() endDate!: string;
  @IsNumber() @Min(0) @Type(() => Number) premium!: number;
  @IsOptional() @IsNumber() @Min(0) @Type(() => Number) sumInsured?: number;
  @IsOptional() @IsString() paymentFrequency?: string;
  @IsOptional() @IsEnum(PolicyStatus) status?: PolicyStatus;
  @IsOptional() @IsString() notes?: string;
}
export class UpdatePolicyDto extends PartialType(PolicyDto) {}

export class RenewalDto {
  @IsUUID() policyId!: string;
  @IsUUID() customerId!: string;
  @IsDateString() renewalDate!: string;
  @IsOptional() @IsDateString() reminderDate?: string;
  @IsOptional() @IsEnum(RenewalStatus) status?: RenewalStatus;
  @IsOptional() @IsUUID() assignedUserId?: string;
  @IsOptional() @IsString() notes?: string;
}
export class UpdateRenewalDto extends PartialType(RenewalDto) {}

export class ClaimDto {
  @IsUUID() customerId!: string;
  @IsUUID() policyId!: string;
  @IsOptional() @IsUUID() assignedUserId?: string;
  @IsString() @Length(1, 100) claimNumber!: string;
  @IsString() @Length(2, 100) claimType!: string;
  @IsOptional() @IsDateString() incidentDate?: string;
  @IsOptional() @IsDateString() claimDate?: string;
  @IsOptional() @IsNumber() @Min(0) @Type(() => Number) amount?: number;
  @IsOptional() @IsEnum(ClaimStatus) status?: ClaimStatus;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() insuredPerson?: string;
  @IsOptional() @IsString() hospital?: string;
  @IsOptional() @IsDateString() admissionDate?: string;
  @IsOptional() @IsDateString() dischargeDate?: string;
  @IsOptional() @IsNumber() @Min(0) @Type(() => Number) settlementAmount?: number;
  @IsOptional() @IsString() decision?: string;
  @IsOptional() @IsString() closureReason?: string;
}
export class UpdateClaimDto extends PartialType(ClaimDto) {}

export class TaskDto {
  @IsString() @Length(2, 200) title!: string;
  @IsOptional() @IsString() description?: string;
  @IsUUID() assignedUserId!: string;
  @IsOptional() @IsUUID() customerId?: string;
  @IsOptional() @IsUUID() policyId?: string;
  @IsOptional() @IsUUID() leadId?: string;
  @IsOptional() @IsUUID() claimId?: string;
  @IsOptional() @IsEnum(Priority) priority?: Priority;
  @IsDateString() dueDate!: string;
  @IsOptional() @IsEnum(TaskStatus) status?: TaskStatus;
}
export class UpdateTaskDto extends PartialType(TaskDto) {}

export class GrievanceDto {
  @IsUUID() customerId!: string;
  @IsString() @Length(1, 100) referenceNumber!: string;
  @IsString() @Length(2, 100) category!: string;
  @IsString() @Length(2, 5000) description!: string;
  @IsOptional() @IsEnum(GrievanceStatus) status?: GrievanceStatus;
  @IsDateString() complaintDate!: string;
  @IsOptional() @IsDateString() escalationDate?: string;
  @IsOptional() @IsDateString() followUpDeadline?: string;
  @IsOptional() @IsString() companyResponse?: string;
  @IsOptional() @IsDateString() resolvedAt?: string;
}
export class UpdateGrievanceDto extends PartialType(GrievanceDto) {}

export class OmbudsmanCaseDto {
  @IsUUID() customerId!: string;
  @IsOptional() @IsUUID() grievanceId?: string;
  @IsString() @Length(1, 100) caseNumber!: string;
  @IsOptional() @IsEnum(OmbudsmanCaseStatus) status?: OmbudsmanCaseStatus;
  @IsOptional() @IsDateString() submissionDate?: string;
  @IsOptional() @IsDateString() hearingDate?: string;
  @IsOptional() @IsDateString() deadline?: string;
  @IsOptional() @IsString() award?: string;
  @IsOptional() @IsString() notes?: string;
}
export class UpdateOmbudsmanCaseDto extends PartialType(OmbudsmanCaseDto) {}

export class CommunicationDto {
  @IsUUID() customerId!: string;
  @IsEnum(CommunicationChannel) channel!: CommunicationChannel;
  @IsEnum(CommunicationDirection) direction!: CommunicationDirection;
  @IsOptional() @IsString() subject?: string;
  @IsString() @Length(1, 10000) body!: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsDateString() occurredAt?: string;
}
export class UpdateCommunicationDto extends PartialType(CommunicationDto) {}

export class FamilyMemberDto {
  @IsUUID() customerId!: string;
  @IsString() @Length(2, 160) fullName!: string;
  @IsString() @Length(2, 80) relationship!: string;
  @IsOptional() @IsDateString() dateOfBirth?: string;
  @IsOptional() @IsString() gender?: string;
  @IsOptional() @IsString() phone?: string;
}
export class UpdateFamilyMemberDto extends PartialType(FamilyMemberDto) {}

export class PolicyMemberDto {
  @IsUUID() policyId!: string;
  @IsUUID() customerId!: string;
  @IsString() @Length(2, 160) fullName!: string;
  @IsOptional() @IsString() relationship?: string;
  @IsOptional() @IsDateString() dateOfBirth?: string;
}
export class UpdatePolicyMemberDto extends PartialType(PolicyMemberDto) {}

export class DocumentUploadQueryDto {
  @IsString() @Length(1, 255) fileName!: string;
  @IsOptional() @IsString() @Length(1, 80) category?: string;
  @IsOptional() @IsUUID() customerId?: string;
  @IsOptional() @IsUUID() policyId?: string;
  @IsOptional() @IsUUID() claimId?: string;
  @IsOptional() @IsDateString() expiryDate?: string;
  @IsOptional() @IsDateString() reminderDate?: string;
}

export class UpdateDocumentDto {
  @IsOptional() @IsString() @Length(1, 255) fileName?: string;
  @IsOptional() @IsString() @Length(1, 80) category?: string;
  @IsOptional() @IsDateString() expiryDate?: string;
  @IsOptional() @IsDateString() reminderDate?: string;
}

export class PublicLeadDto {
  @IsString() @Length(2, 160) fullName!: string;
  @IsString() @Matches(/^[+()\d\s.-]{7,30}$/) phone!: string;
  @IsOptional() @IsEmail() @Length(2, 254) email?: string;
  @IsString() @Length(2, 80) category!: string;
  @IsString() @Length(5, 3000) requirement!: string;
}
