export enum RoleName {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  AGENT = 'AGENT',
  STAFF = 'STAFF',
}

export enum LeadStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  QUALIFIED = 'QUALIFIED',
  PROPOSAL = 'PROPOSAL',
  WON = 'WON',
  LOST = 'LOST',
}

export enum QuoteStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

export enum PolicyStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
  LAPSED = 'LAPSED',
  PENDING = 'PENDING',
}

export enum RenewalStatus {
  UPCOMING = 'UPCOMING',
  DUE = 'DUE',
  OVERDUE = 'OVERDUE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum ClaimStatus {
  NEW = 'NEW',
  DOCUMENTS_PENDING = 'DOCUMENTS_PENDING',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SETTLED = 'SETTLED',
  CLOSED = 'CLOSED',
}

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum Priority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum GrievanceStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  ESCALATED = 'ESCALATED',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum OmbudsmanCaseStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  PENDING = 'PENDING',
  HEARING = 'HEARING',
  AWARD = 'AWARD',
  CLOSED = 'CLOSED',
}

export enum CommunicationChannel {
  PHONE = 'PHONE',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  WHATSAPP = 'WHATSAPP',
  IN_PERSON = 'IN_PERSON',
  OTHER = 'OTHER',
}

export enum CommunicationDirection {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND',
}
