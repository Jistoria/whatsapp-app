import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BotService } from './whatsapp/bot.service';
import { BotModule } from './whatsapp/bot.module';

@Module({
  imports: [
    BotModule,
    EventEmitterModule.forRoot(), // Asegúrate de importar bien este módulo
  ],
  providers: [BotService],
})
export class AppModule {}
