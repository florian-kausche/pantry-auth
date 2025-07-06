import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

import { GlobalExceptionFilter } from './common/http-exception.filter.utils';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe()); //Para uso Global validador
  app.useGlobalFilters(new GlobalExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('Users API')
    .setDescription('API para gestionar usuarios')
    .setVersion('1.0')
    .addTag('users')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  try {
    const port = configService.get<number>('PORT') ?? 3000;
    await app.listen(port);
    console.log(`Aplicación iniciada en el puerto ${port}`);
  } catch (error) {
    console.error('Error al iniciar la aplicación:', error.message);
  }
}
bootstrap();
