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

//Principal application configurations
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const cfg = app.get(ConfigService);

  app.use(helmet());
  app.use(cookieParser());
  app.enableCors({
    origin: cfg.getOrThrow<string>('CORS_ORIGIN'),
    credentials: true,
  });

  app.setGlobalPrefix(API_PREFIX);
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: API_DEFAULT_VERSION });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const map = flattenErrors(errors);
        const message = Object.values(map).join(', ') || 'Campos invalidos';
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
