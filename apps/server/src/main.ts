/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';
import { json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  const port = process.env.SERVER_PORT || 5800;
  app.enableCors({
    credentials: true,
    allowedHeaders: `X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Observe`,
    methods: 'GET,PUT,POST,DELETE,UPDATE,OPTIONS',
    origin: process.env.NEXT_PUBLIC_CLIENT_URL,
  });
  app.use((req: any, res: any, next: any) => {
    // do not parse json bodies if we are hitting file uploading controller
    if (req.path.indexOf('/markup-domain') === 0) {
      json()(req, res, next);
    } else {
      next();
    }
  });
  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}`);
}

bootstrap();
