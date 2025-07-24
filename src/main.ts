import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Enable CORS for any origin
  app.enableCors({
    origin: [
      "https://fearlessfamily.vercel.app",
      "https://fearlessfamily-git-master-iftekhar1405s-projects.vercel.app/",
      "https://fearlessfamily-dhs4bjp38-iftekhar1405s-projects.vercel.app/",
      "http://localhost:3000",
      "http://localhost:3002",
    ],
    credentials: true,
  });

  // Enable validation pipes
  app.useGlobalPipes(new ValidationPipe());

  // Set global prefix
  app.setGlobalPrefix("api");

  await app.listen(3001);
  console.log("Backend server running on http://localhost:3001");
}
bootstrap();
