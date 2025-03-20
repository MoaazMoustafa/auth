import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import * as morgan from 'morgan';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
export default async function bootstrap(logger?) {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, logger);
  const configService = app.get(ConfigService);
  const config = new DocumentBuilder()
    .setTitle('My API')
    .setDescription('Automatically generated Swagger docs')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
  app.use(helmet());
  app.useLogger(new Logger());
  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());
  app.enableCors();
  app.use(morgan('combined'));
  
  if (process.env.NODE_ENV !== 'test') {
    const port = configService.get<number>('PORT') || 3000; 
    await app.listen(port);
  }
  return app;
}
bootstrap();
