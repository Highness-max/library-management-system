import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  
  app.setGlobalPrefix('api');
  app.enableCors(); // <-- ADD THIS
  app.useGlobalPipes(new ValidationPipe({ 
    whitelist: true, 
    transform: true, // <-- ADD THIS
  }));

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  Logger.log(`🚀 API running on http://localhost:${port}/api`, 'Bootstrap');
}
bootstrap();