import { Request } from 'express';
import { RoleName } from '../common/domain.enums';

export type UserRequest = Request & { user: { sub: string; role: RoleName } };
