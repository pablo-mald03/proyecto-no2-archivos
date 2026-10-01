import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { HttpStatus, ValidationError, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppException } from './common/exceptions/app.exception';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const cfg = app.get(ConfigService);

  app.use(helmet());
  app.use(cookieParser());
  app.enableCors({
    origin: cfg.getOrThrow<string>('CORS_ORIGIN'),
    credentials: true,
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const map: Record<string, string> = {};
        for (const err of errors) {
          const first = Object.values(err.constraints ?? {})[0];
          if (first) map[err.property] = first;
        }
        const message = Object.values(map).join(', ') || 'Campos invalidos';
        return new AppException('VALIDATION_ERROR', message, HttpStatus.BAD_REQUEST, map);
      },
    }),
  );

  const swagger = new DocumentBuilder()
    .setTitle('Gestión Documental API')
    .setVersion('1.0')
    .addCookieAuth(cfg.getOrThrow<string>('COOKIE_NAME'))
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, swagger));

  await app.listen(cfg.get<number>('PORT') ?? 3000);
}
bootstrap();
