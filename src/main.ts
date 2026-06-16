import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

import { NotFoundExceptionFilter } from './core/infra/prisma/filters/not-found.filter';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  // [Q4 - Robustness] Security headers, CORS, body size limit, input
  // validation/whitelisting and a global exception filter harden every endpoint.
  app.use(helmet());

  const corsOrigin = config.get<string[]>('CORS_ORIGIN');
  app.enableCors({
    origin: corsOrigin ?? true,
    credentials: true,
  });

  app.useBodyParser('json', { limit: '10mb' });
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.useGlobalFilters(new NotFoundExceptionFilter());

  const docConfig = new DocumentBuilder()
    .setTitle('Skivori - Backend')
    .setDescription('Skivori - Backend API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, docConfig);
  SwaggerModule.setup('docs', app, document);

  const host = config.get<string>('HOST') ?? 'localhost';
  const port = config.get<number>('PORT') ?? 3333;
  await app.listen(port, host);

  const url = await app.getUrl();

  console.log(`\n🚀 Application is running on: ${url}\n`);
  console.log('Press CTRL+C to stop\n');
}
void bootstrap();
