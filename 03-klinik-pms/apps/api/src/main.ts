import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Web paneli, resepsiyon ve mobil uygulamanın erişebilmesi için
  app.enableCors();

  const port = process.env.PORT || 3103;
  await app.listen(port);
  console.log('Klinik API çalışıyor: http://localhost:' + port);
}
bootstrap();
