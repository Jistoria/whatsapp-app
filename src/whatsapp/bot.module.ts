import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { WhatsappController } from './whatsapp.controller';

@Module({
  providers: [BotService],
  controllers: [WhatsappController],
})
export class BotModule {}
