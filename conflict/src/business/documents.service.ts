import { BadRequestException, Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { createReadStream, createWriteStream } from 'node:fs';
import { mkdir, rm } from 'node:fs/promises';
import { basename, extname, join, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { Readable, Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { DocumentUploadQueryDto, PageQueryDto, UpdateDocumentDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';

const MAX_FILE_SIZE = 15 * 1024 * 1024;
const MIME_EXTENSIONS: Record<string, string> = {
  'application/pdf': '.pdf',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

@Injectable()
export class DocumentsService {
  private readonly storagePath = resolve(process.env.DOCUMENT_STORAGE_PATH ?? join(process.cwd(), 'private-documents'));

  constructor(private readonly prisma: PrismaService) {}

  async list(query: PageQueryDto) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 100);
    const where: Prisma.DocumentWhereInput = {
      isArchived: false,
      ...(query.search ? { OR: [{ fileName: { contains: query.search, mode: 'insensitive' as const } }, { category: { contains: query.search, mode: 'insensitive' as const } }] } : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.document.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' }, select: { id: true, fileName: true, fileType: true, fileSize: true, category: true, tags: true, expiryDate: true, reminderDate: true, customerId: true, policyId: true, claimId: true, uploadedById: true, createdAt: true, updatedAt: true } }),
      this.prisma.document.count({ where }),
    ]);
    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async upload(stream: Readable, contentType: string | undefined, contentLength: string | undefined, dto: DocumentUploadQueryDto, userId: string) {
    if (!dto.customerId && !dto.policyId && !dto.claimId) throw new BadRequestException('A customer, policy, or claim must be linked to the document');
    const mime = (contentType ?? '').split(';', 1)[0].trim().toLowerCase();
    const extension = MIME_EXTENSIONS[mime];
    if (!extension) throw new BadRequestException('Only PDF, JPEG, PNG, and WebP documents are supported');
    if (extname(dto.fileName).toLowerCase() !== extension) throw new BadRequestException('File extension does not match the content type');
    const declaredSize = contentLength === undefined ? undefined : Number(contentLength);
    if (declaredSize !== undefined && (!Number.isSafeInteger(declaredSize) || declaredSize < 0 || declaredSize > MAX_FILE_SIZE)) {
      throw new BadRequestException('Document exceeds the 15 MB size limit');
    }

    let customerId = dto.customerId;
    if (dto.policyId) {
      const policy = await this.prisma.policy.findUnique({ where: { id: dto.policyId }, select: { customerId: true } });
      if (!policy) throw new NotFoundException('Policy not found');
      if (customerId && customerId !== policy.customerId) throw new BadRequestException('The selected policy does not belong to the selected customer');
      customerId = policy.customerId;
    }
    if (dto.claimId) {
      const claim = await this.prisma.claim.findUnique({ where: { id: dto.claimId }, select: { customerId: true, policyId: true } });
      if (!claim) throw new NotFoundException('Claim not found');
      if (customerId && customerId !== claim.customerId) throw new BadRequestException('The selected claim does not belong to the selected customer');
      if (dto.policyId && dto.policyId !== claim.policyId) throw new BadRequestException('The selected claim does not belong to the selected policy');
      customerId = claim.customerId;
    }
    if (customerId && !(await this.prisma.customer.findUnique({ where: { id: customerId }, select: { id: true } }))) {
      throw new NotFoundException('Customer not found');
    }

    const storageKey = `${randomUUID()}${extension}`;
    const path = join(this.storagePath, storageKey);
    let fileSize = 0;
    const sizeLimit = new Transform({
      transform(chunk: Buffer, _encoding, callback) {
        fileSize += chunk.length;
        if (fileSize > MAX_FILE_SIZE) {
          callback(new BadRequestException('Document exceeds the 15 MB size limit'));
          return;
        }
        callback(null, chunk);
      },
    });

    await mkdir(this.storagePath, { recursive: true });
    try {
      await pipeline(stream, sizeLimit, createWriteStream(path, { flags: 'wx', mode: 0o600 }));
      const originalName = basename(dto.fileName).replace(/[\r\n"]/g, '_');
      return await this.prisma.$transaction(async (tx) => {
        const row = await tx.document.create({
          data: {
            fileName: originalName,
            fileType: mime,
            fileSize,
            storageKey,
            category: dto.category ?? 'OTHER',
            customerId,
            policyId: dto.policyId,
            claimId: dto.claimId,
            uploadedById: userId,
            expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
            reminderDate: dto.reminderDate ? new Date(dto.reminderDate) : undefined,
          },
          select: { id: true, fileName: true, fileType: true, fileSize: true, category: true, customerId: true, policyId: true, claimId: true, createdAt: true },
        });
        await tx.auditLog.create({ data: { userId, action: 'DOCUMENT_UPLOADED', entity: 'document', entityId: row.id } });
        if (customerId) await tx.activity.create({ data: { userId, customerId, type: 'DOCUMENT_UPLOADED', description: `Uploaded ${originalName}` } });
        return row;
      });
    } catch (error) {
      await rm(path, { force: true });
      throw error;
    }
  }

  async update(id: string, dto: UpdateDocumentDto, userId: string) {
    const current = await this.prisma.document.findUnique({ where: { id, isArchived: false } });
    if (!current) throw new NotFoundException('Document not found');
    const { expiryDate, reminderDate, ...fields } = dto;
    const row = await this.prisma.document.update({
      where: { id },
      data: {
        ...fields,
        expiryDate: expiryDate === undefined ? undefined : expiryDate ? new Date(expiryDate) : null,
        reminderDate: reminderDate === undefined ? undefined : reminderDate ? new Date(reminderDate) : null,
      },
      select: { id: true, fileName: true, fileType: true, fileSize: true, category: true, tags: true, customerId: true, policyId: true, claimId: true, expiryDate: true, reminderDate: true, updatedAt: true },
    });
    const writes: Prisma.PrismaPromise<unknown>[] = [
      this.prisma.auditLog.create({ data: { userId, action: 'DOCUMENT_UPDATED', entity: 'document', entityId: id } }),
    ];
    if (row.customerId) writes.push(this.prisma.activity.create({ data: { userId, customerId: row.customerId, type: 'DOCUMENT_UPDATED', description: `Updated document ${row.fileName}` } }));
    await this.prisma.$transaction(writes);
    return row;
  }

  async archive(id: string, userId: string) {
    const current = await this.prisma.document.findUnique({ where: { id, isArchived: false } });
    if (!current) throw new NotFoundException('Document not found');
    await this.prisma.document.update({ where: { id }, data: { isArchived: true } });
    const writes: Prisma.PrismaPromise<unknown>[] = [
      this.prisma.auditLog.create({ data: { userId, action: 'DOCUMENT_ARCHIVED', entity: 'document', entityId: id } }),
    ];
    if (current.customerId) writes.push(this.prisma.activity.create({ data: { userId, customerId: current.customerId, type: 'DOCUMENT_ARCHIVED', description: `Archived document ${current.fileName}` } }));
    await this.prisma.$transaction(writes);
    return { success: true };
  }

  async download(id: string) {
    const document = await this.prisma.document.findUnique({ where: { id, isArchived: false }, select: { fileName: true, fileType: true, storageKey: true } });
    if (!document) throw new NotFoundException('Document not found');
    const path = join(this.storagePath, document.storageKey);
    try {
      const file = createReadStream(path);
      await new Promise<void>((resolveRead, rejectRead) => {
        file.once('open', () => resolveRead());
        file.once('error', rejectRead);
      });
      return { file: new StreamableFile(file), fileName: document.fileName, fileType: document.fileType };
    } catch (error) {
      throw new NotFoundException('Document content is missing from private storage', { cause: error });
    }
  }
}
