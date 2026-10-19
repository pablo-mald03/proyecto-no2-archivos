import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

//Principal configuration for swagger
export function setupSwagger(app: INestApplication): void {
    const cfg = app.get(ConfigService);
    const cookieName = cfg.getOrThrow<string>('COOKIE_NAME');
    const port = cfg.getOrThrow<number>('PORT');

    const config = new DocumentBuilder()
        .setTitle('Document Management API')
        .setDescription('REST API for the document management system')
        .setVersion('1.0.0')
        .setContact('Soporte', 'https://tu-sitio.com', 'documentalsupport@gmail.com')
        .setLicense('Apache 2.0', 'https://www.apache.org/licenses/LICENSE-2.0')
        .addServer(`http://localhost:${port}`, 'Local development')
        .addCookieAuth(cookieName, {
            type: 'apiKey',
            in: 'cookie',
            description: 'Authentication with httpOnly using JWT',
        })
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, {
        jsonDocumentUrl: 'docs-json',
    });
}