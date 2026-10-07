import { PrismaClient, RoleName, CustomerStatus, LeadStatus, PolicyStatus, RenewalStatus, ClaimStatus, TaskStatus, Priority, QuoteStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('ChangeMe123!', 12);
  const roles = await Promise.all(Object.values(RoleName).map((name) => prisma.role.upsert({ where: { name }, update: {}, create: { name } })));
  const role = Object.fromEntries(roles.map((item) => [item.name, item]));
  const [admin, manager, agent] = await Promise.all([
    prisma.user.upsert({ where: { email: 'admin@example.test' }, update: {}, create: { name: 'Demo Admin', email: 'admin@example.test', passwordHash, roleId: role.ADMIN.id } }),
    prisma.user.upsert({ where: { email: 'manager@example.test' }, update: {}, create: { name: 'Demo Manager', email: 'manager@example.test', passwordHash, roleId: role.MANAGER.id } }),
    prisma.user.upsert({ where: { email: 'agent@example.test' }, update: {}, create: { name: 'Demo Agent', email: 'agent@example.test', passwordHash, roleId: role.AGENT.id } }),
  ]);
  const product = await prisma.insuranceProduct.create({ data: { name: 'Health Shield Plus', insurer: 'Demo Secure Insurance', category: 'Health', description: 'Development-only sample product' } });
  const customer = await prisma.customer.create({ data: { fullName: 'Aarav Mehta', phone: '+91 90000 00001', email: 'aarav@example.test', city: 'Pune', status: CustomerStatus.ACTIVE, familyMembers: { create: [{ fullName: 'Mira Mehta', relationship: 'Spouse' }, { fullName: 'Dev Mehta', relationship: 'Child' }] } } });
  const policy = await prisma.policy.create({ data: { customerId: customer.id, productId: product.id, assignedUserId: agent.id, policyNumber: 'DEMO-POL-001', policyType: 'Family Floater', startDate: new Date('2026-01-01'), endDate: new Date('2026-12-31'), premium: 24000, sumInsured: 1000000, status: PolicyStatus.ACTIVE } });
  const lead = await prisma.lead.create({ data: { customerId: customer.id, assignedUserId: manager.id, source: 'Website', status: LeadStatus.NEW, priority: Priority.HIGH, expectedValue: 35000, followUpDate: new Date('2026-09-16'), notes: 'Seeded development lead' } });
  await prisma.quote.create({ data: { customerId: customer.id, leadId: lead.id, productId: product.id, insurer: product.insurer, premium: 24000, status: QuoteStatus.SENT, validityDate: new Date('2026-09-30') } });
  await prisma.renewal.create({ data: { policyId: policy.id, customerId: customer.id, assignedUserId: agent.id, renewalDate: new Date('2026-12-31'), reminderDate: new Date('2026-12-01'), status: RenewalStatus.UPCOMING } });
  const claim = await prisma.claim.create({ data: { customerId: customer.id, policyId: policy.id, assignedUserId: agent.id, claimNumber: 'DEMO-CLM-001', claimType: 'Hospitalisation', amount: 65000, status: ClaimStatus.DOCUMENTS_PENDING, description: 'Seeded development claim' } });
  await prisma.task.create({ data: { title: 'Collect claim documents', assignedUserId: agent.id, customerId: customer.id, policyId: policy.id, priority: Priority.HIGH, dueDate: new Date('2026-09-15'), status: TaskStatus.PENDING, relatedEntity: claim.id } });
  await prisma.activity.create({ data: { customerId: customer.id, userId: admin.id, type: 'SEED_CREATED', description: 'Development customer file created' } });
}

main().finally(() => prisma.$disconnect());