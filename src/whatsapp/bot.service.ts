import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Client, LocalAuth, MessageMedia } from 'whatsapp-web.js';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class BotService implements OnModuleInit {
  private qrCode: string | null = null;
  private client: Client = new Client({
    authStrategy: new LocalAuth(), // Usa el volumen de Docker
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
  });
  constructor(private readonly eventEmitter: EventEmitter2) {
    if (!(eventEmitter instanceof EventEmitter2)) {
      throw new Error('eventEmitter must be an instance of EventEmitter2');
    }
  }

  onModuleInit() {
    this.client.on('qr', (qr) => {
      Logger.log('QR Code generated:', qr);
      this.eventEmitter.emit('qrcode.created', qr);
    });

    this.client.on('message', (msg) => {
      this.eventEmitter.emit('messageReceived', msg);
      if (msg.body.toLowerCase() === 'vacan') {
        msg.reply('Muy vacan!').catch((error) => {
          Logger.error('Error sending message:', error);
        });
      }
    });

    this.client.on('authenticated', () => {
      Logger.log('🔑 Sesión de WhatsApp autenticada');
      console.log(this.client.info.pushname);
    });

    this.client.on('ready', () => {
      this.eventEmitter.emit('clientReady');
      Logger.log('WhatsApp client is ready');
    });

    this.client.on('auth_failure', () => {
      console.log(
        '❌ Error en la autenticación, la sesión puede haberse perdido.',
      );
    });

    this.client.initialize().catch((error) => {
      Logger.error('Error during WhatsApp client initialization:', error);
    });
  }

  async sendMessage(phone: string, message: string): Promise<void> {
    await this.client.sendMessage(phone, message);
  }

  async sendImage(
    phone: string,
    image: string,
    caption: string | undefined = undefined,
  ): Promise<void> {
    const media = await MessageMedia.fromUrl(image);
    await this.client.sendMessage(phone, media, { caption });
  }

  getQrCode(): string | null {
    return this.qrCode ? this.qrCode : null;
  }
}
