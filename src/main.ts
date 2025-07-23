import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Enable CORS for any origin
  app.enableCors({
    origin: ['http://localhost:3000', 'http://192.168.1.16:3000'], // replace with your actual frontend IP(s)
    credentials: true,
  });


  // Enable validation pipes
  app.useGlobalPipes(new ValidationPipe());

  // Set global prefix
  app.setGlobalPrefix('api');

  await app.listen(3001);
  console.log('Backend server running on http://localhost:3001');
}
bootstrap();
