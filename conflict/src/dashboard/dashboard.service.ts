import { Injectable } from '@nestjs/common';
import { ClaimStatus, LeadStatus, PolicyStatus, RenewalStatus, TaskStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const [totalCustomers, newLeads, pendingQuotes, activePolicies, renewalsDue, overdueRenewals, openClaims, overdueTasks, tasks, renewals, leads, claims, recentActivity] = await this.prisma.$transaction([
      this.prisma.customer.count(),
      this.prisma.lead.count({ where: { createdAt: { gte: weekStart, lt: weekEnd }, status: LeadStatus.NEW } }),
      this.prisma.quote.count({ where: { status: { in: ['DRAFT', 'SENT'] } } }),
      this.prisma.policy.count({ where: { status: PolicyStatus.ACTIVE } }),
      this.prisma.renewal.count({ where: { renewalDate: { gte: today, lt: tomorrow }, status: { in: [RenewalStatus.UPCOMING, RenewalStatus.DUE] } } }),
      this.prisma.renewal.count({ where: { renewalDate: { lt: today }, status: { in: [RenewalStatus.UPCOMING, RenewalStatus.DUE, RenewalStatus.OVERDUE] } } }),
      this.prisma.claim.count({ where: { status: { notIn: [ClaimStatus.CLOSED, ClaimStatus.REJECTED, ClaimStatus.SETTLED] } } }),
      this.prisma.task.count({ where: { dueDate: { lt: now }, status: { in: [TaskStatus.PENDING, TaskStatus.IN_PROGRESS] } } }),
      this.prisma.task.findMany({ where: { status: { in: [TaskStatus.PENDING, TaskStatus.IN_PROGRESS] } }, orderBy: { dueDate: 'asc' }, take: 8, select: { id: true, title: true, dueDate: true, priority: true, status: true, customer: { select: { id: true, fullName: true } } } }),
      this.prisma.renewal.findMany({ where: { status: { in: [RenewalStatus.UPCOMING, RenewalStatus.DUE, RenewalStatus.OVERDUE] } }, orderBy: { renewalDate: 'asc' }, take: 8, select: { id: true, renewalDate: true, status: true, policy: { select: { policyNumber: true } }, customer: { select: { id: true, fullName: true } } } }),
      this.prisma.lead.findMany({ orderBy: { createdAt: 'desc' }, take: 8, select: { id: true, source: true, status: true, priority: true, createdAt: true, customer: { select: { id: true, fullName: true } } } }),
      this.prisma.claim.findMany({ where: { status: { notIn: [ClaimStatus.CLOSED, ClaimStatus.REJECTED, ClaimStatus.SETTLED] } }, orderBy: { createdAt: 'desc' }, take: 8, select: { id: true, claimNumber: true, status: true, amount: true, customer: { select: { id: true, fullName: true } } } }),
      this.prisma.activity.findMany({ orderBy: { createdAt: 'desc' }, take: 10, select: { id: true, type: true, description: true, createdAt: true, customer: { select: { id: true, fullName: true } } } }),
    ]);

    return { metrics: { totalCustomers, newLeads, pendingQuotes, activePolicies, renewalsDue, overdueRenewals, openClaims, overdueTasks }, actionable: { tasks, renewals, leads, claims, recentActivity } };
  }
}