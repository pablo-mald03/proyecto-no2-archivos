import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { HttpStatus, ValidationError, ValidationPipe, VersioningType } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppException } from './common/exceptions/app.exception';
import { flattenErrors } from './common/utils/flatten-errors';
import { setupSwagger } from './config/swagger.config';
import { API_DEFAULT_VERSION, API_PREFIX } from './common/constants/api/api.constants';
import type { NextFunction, Request, Response } from 'express';

//Principal application configurations

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const cfg = app.get(ConfigService);

  // Temporary API request logger for debugging
  let currentMinute = Math.floor(Date.now() / 60_000);
  let requestsThisMinute = 0;

  app.use((req: Request, res: Response, next: NextFunction) => {
    const requestMinute = Math.floor(Date.now() / 60_000);

    if (requestMinute !== currentMinute) {
      currentMinute = requestMinute;
      requestsThisMinute = 0;
    }

    requestsThisMinute++;

    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;

      console.log(
        `[API REQUEST] ${req.method} ${req.path} | ` +
        `Status: ${res.statusCode} | ` +
        `Duration: ${duration}ms | ` +
        `Requests this minute: ${requestsThisMinute}`,
      );
    });

    next();
  });

  app.use(helmet());
  app.use(cookieParser());

  app.enableCors({
    origin: cfg.getOrThrow<string>('CORS_ORIGIN'),
    credentials: true,
  });

  app.setGlobalPrefix(API_PREFIX);

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: API_DEFAULT_VERSION,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const map = flattenErrors(errors);
        const message =
          Object.values(map).join(', ') || 'Campos invalidos';

        return new AppException(
          'VALIDATION_ERROR',
          message,
          HttpStatus.BAD_REQUEST,
          map,
        );
      },
    }),
  );

  setupSwagger(app);

  await app.listen(cfg.getOrThrow<number>('PORT'));
}

bootstrap();
