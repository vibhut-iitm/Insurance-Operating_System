import { Body, Controller, Get, Param, Patch, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserRequest } from './request.types';
import { DocumentsService } from './documents.service';
import { DocumentUploadQueryDto, PageQueryDto, UpdateDocumentDto } from './dto';

@Controller('documents')
@ApiTags('Documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly documents: DocumentsService) {}

  @Get()
  list(@Query() query: PageQueryDto) {
    return this.documents.list(query);
  }

  @Post('upload')
  upload(@Req() request: UserRequest, @Query() query: DocumentUploadQueryDto) {
    return this.documents.upload(
      request,
      request.headers['content-type'],
      request.headers['content-length'],
      query,
      request.user.sub,
    );
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDocumentDto, @Req() request: UserRequest) {
    return this.documents.update(id, dto, request.user.sub);
  }

  @Post(':id/archive')
  archive(@Param('id') id: string, @Req() request: UserRequest) {
    return this.documents.archive(id, request.user.sub);
  }

  @Get(':id/content')
  async download(@Param('id') id: string, @Res({ passthrough: true }) response: Response) {
    const result = await this.documents.download(id);
    response.setHeader('Content-Type', result.fileType);
    response.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(result.fileName)}`);
    return result.file;
  }
}