import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

import { GlobalExceptionFilter } from './common/http-exception.filter.utils';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new GlobalExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('Auth API')
    .setDescription('Logout and Password Recovery (OTP) endpoints')
    .setVersion('1.0')
    .addTag('security')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  try {
    const port = configService.get<number>('PORT') ?? 3000;
    await app.listen(port);
    console.log(`Server running on port ${port}`);
  } catch (error) {
    console.error('Error starting application:', error.message);
  }
}
bootstrap();
