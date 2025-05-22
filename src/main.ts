import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    logger.log('Starting application initialization...');

    // Create NestJS application
    logger.debug('Creating NestJS application instance...');
    const app = await NestFactory.create(AppModule, {
      logger: ['log', 'error', 'warn', 'debug', 'verbose'],
    });
    logger.log('NestJS application instance created successfully');

    // Enable CORS
    logger.debug('Enabling CORS...');
    app.enableCors();
    logger.log('CORS enabled successfully');

    // Swagger configuration
    logger.debug('Configuring Swagger documentation...');
    const config = new DocumentBuilder()
      .setTitle('API Documentation')
      .setDescription('The API description')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
    logger.log('Swagger documentation configured successfully');

    // Start application
    const port = process.env.PORT ?? 8080;
    logger.debug(`Attempting to start server on port ${port}...`);
    await app.listen(port);

    logger.log(`Application is running on: ${await app.getUrl()}`);
    logger.debug(`Swagger documentation available at: ${await app.getUrl()}/api`);
    logger.log('Application startup completed successfully');
  } catch (error) {
    logger.error('Error during application startup', error.stack);
    process.exit(1);
  }
}

bootstrap();