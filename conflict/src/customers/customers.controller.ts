import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { UserRequest } from '../business/request.types';
import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { ListCustomersDto } from './dto/list-customers.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('customers')
@ApiTags('Customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  findAll(@Query() query: ListCustomersDto) {
    return this.customersService.findAll(query);
  }

  @Post()
  create(@Body() dto: CreateCustomerDto, @Req() request: UserRequest) {
    return this.customersService.create(dto, request.user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCustomerDto, @Req() request: UserRequest) {
    return this.customersService.update(id, dto, request.user.sub);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() request: UserRequest) {
    return this.customersService.remove(id, request.user.sub);
  }
}