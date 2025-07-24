import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Allow CORS from any origin (no CORS errors for any request)
  app.enableCors({
    origin: true, // or use "*" but `true` handles credentials properly
    credentials: true,
  });

  // ✅ Global validation
  app.useGlobalPipes(new ValidationPipe());

  // ✅ API route prefix
  app.setGlobalPrefix("api");

  await app.listen(3001);
  console.log("✅ Backend server running on http://localhost:3001");
}
bootstrap();
