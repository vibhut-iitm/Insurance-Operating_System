import { Request } from 'express';
import { RoleName } from '@prisma/client';

export type UserRequest = Request & { user: { sub: string; role: RoleName } };
