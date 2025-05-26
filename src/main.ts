import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import { config } from 'dotenv';
import * as fs from 'fs';

interface HttpsOptions {
  key: Buffer;
  cert: Buffer;
}

async function bootstrap() {
  config();
  let httpsOptions: HttpsOptions | undefined;
  const logger = new Logger('Bootstrap');

  if (process.env.NODE_ENV !== 'localhost') {
    httpsOptions = {
      key: fs.readFileSync('cert/key.pem'),
      cert: fs.readFileSync('cert/cert.pem'),
    };
  } else {
    logger.log('No Necisita Certificados ssl');
  }

  try {
    logger.log('Starting application initialization...');
    logger.debug('Environment variables:');
    logger.debug(`FIREBASE_CONFIG_PATH: ${process.env.FIREBASE_CONFIG_PATH}`);
    logger.debug(`PORT: ${process.env.PORT}`);
    logger.debug(`NODE_ENV: ${process.env.NODE_ENV}`);
    logger.debug(`SECRET: ${process.env.SECRET}`);
    logger.debug(`MAIL_HOST: ${process.env.MAIL_HOST}`);
    logger.debug(`MAIL_PORT: ${process.env.MAIL_PORT}`);
    logger.debug(`MAIL_USER: ${process.env.MAIL_USER}`);
    logger.debug(`MAIL_PASS: ${process.env.MAIL_PASS}`);


    // Validación silenciosa (solo muestra error si falla)
    const requiredEnvVars = ['FIREBASE_CONFIG_PATH', 'SECRET', 'MAIL_HOST', 'MAIL_PORT', 'MAIL_USER', 'MAIL_PASS'];
    const missingVars = requiredEnvVars.filter(v => !process.env[v]);
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    // Create NestJS application
    const app = await NestFactory.create(AppModule, {
      httpsOptions,
      logger: ['log', 'error', 'warn', 'debug', 'verbose'],
    });

    logger.log('NestJS application instance created successfully');

    // Enable CORS
    app.enableCors();
    logger.debug('CORS enabled');

    // Swagger configuration
    const config = new DocumentBuilder()
      .setTitle('API Documentation')
      .setDescription('The API description')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
    logger.debug('Swagger documentation configured');

    // Start application
    const port = process.env.PORT ?? 8080;
    await app.listen(port);

    logger.log(`Application is running on: ${await app.getUrl()}`);
    logger.debug(`Swagger docs: ${await app.getUrl()}/api`);
  } catch (error) {
    logger.error('Startup error', error.stack);
    process.exit(1);
  }
}

bootstrap();