import { IsDateString, IsEmail, IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { CustomerStatus } from '@prisma/client';

export class CreateCustomerDto {
  @IsString() @Length(2, 160) fullName!: string;
  @IsString() @Length(7, 30) phone!: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsDateString() dateOfBirth?: string;
  @IsOptional() @IsString() gender?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() state?: string;
  @IsOptional() @IsString() pincode?: string;
  @IsOptional() @IsString() occupation?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsEnum(CustomerStatus) status?: CustomerStatus;
}