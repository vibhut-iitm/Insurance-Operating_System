import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { ListCustomersDto } from './dto/list-customers.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll({ page = 1, limit: requestedLimit = 20, search }: ListCustomersDto) {
    const limit = Math.min(requestedLimit, 100);
    const where: Prisma.CustomerWhereInput = search
      ? { OR: [{ fullName: { contains: search, mode: 'insensitive' } }, { phone: { contains: search } }, { email: { contains: search, mode: 'insensitive' } }] }
      : {};
    const [items, total] = await this.prisma.$transaction([
      this.prisma.customer.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' }, select: { id: true, fullName: true, phone: true, email: true, status: true, createdAt: true, _count: { select: { policies: true, claims: true, tasks: true } } } }),
      this.prisma.customer.count({ where }),
    ]);
    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async create(dto: CreateCustomerDto, userId: string) {
    const row = await this.prisma.customer.create({ data: { ...dto, dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined } });
    await this.track(userId, 'CUSTOMER_CREATED', row, 'Customer record created');
    return row;
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({ where: { id }, select: {
      id: true, fullName: true, dateOfBirth: true, gender: true, phone: true, email: true,
      address: true, city: true, state: true, pincode: true, occupation: true, notes: true,
      status: true, createdAt: true, updatedAt: true,
      familyMembers: { where: { isArchived: false }, orderBy: { fullName: 'asc' } },
      leads: { orderBy: { createdAt: 'desc' }, take: 20, include: { quotes: true } },
      quotes: { orderBy: { createdAt: 'desc' }, take: 20, include: { product: true } },
      policies: { include: { product: true, renewals: true, members: { where: { isArchived: false } } }, orderBy: { createdAt: 'desc' }, take: 20 },
      claims: { orderBy: { createdAt: 'desc' }, take: 20 },
      grievances: { orderBy: { createdAt: 'desc' }, take: 20 },
      ombudsmanCases: { orderBy: { createdAt: 'desc' }, take: 20 },
      communications: { orderBy: { occurredAt: 'desc' }, take: 20 },
      documents: { where: { isArchived: false }, orderBy: { createdAt: 'desc' }, take: 20, select: { id: true, fileName: true, fileType: true, fileSize: true, category: true, tags: true, expiryDate: true, reminderDate: true, createdAt: true } },
      tasks: { orderBy: { dueDate: 'asc' }, take: 20 },
      activities: { orderBy: { createdAt: 'desc' }, take: 50 },
    } });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async update(id: string, dto: UpdateCustomerDto, userId: string) {
    await this.ensureExists(id);
    const row = await this.prisma.customer.update({ where: { id }, data: { ...dto, dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined } });
    await this.track(userId, 'CUSTOMER_UPDATED', row, 'Customer record updated');
    return row;
  }

  async remove(id: string, userId: string) {
    await this.ensureExists(id);
    const row = await this.prisma.customer.update({ where: { id }, data: { status: 'INACTIVE' } });
    await this.track(userId, 'CUSTOMER_ARCHIVED', row, 'Customer record archived');
    return { success: true };
  }

  private async track(userId: string, action: string, customer: { id: string }, description: string) {
    await this.prisma.$transaction([
      this.prisma.auditLog.create({ data: { userId, action, entity: 'customer', entityId: customer.id } }),
      this.prisma.activity.create({ data: { userId, customerId: customer.id, type: action, description } }),
    ]);
  }

  private async ensureExists(id: string) {
    if (!(await this.prisma.customer.count({ where: { id } }))) throw new NotFoundException('Customer not found');
  }
}