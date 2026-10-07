import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { BigIntSerializationInterceptor } from './common/bigint-serialization.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();
  app.setGlobalPrefix('api');
  app.use(helmet());
  app.enableCors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:3000', credentials: true });
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalInterceptors(new BigIntSerializationInterceptor());
  const openApi = new DocumentBuilder()
    .setTitle('Insurance OS API')
    .setDescription('REST API for customer, insurance lifecycle, case, document, and reporting operations.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  if (process.env.NODE_ENV !== 'production') {
    SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, openApi), { useGlobalPrefix: true });
  }
  await app.listen(process.env.API_PORT ?? 4000);
}

void bootstrap();