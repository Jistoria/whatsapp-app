/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Controller, Res, Get, Body, Post } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { Response } from 'express';
import { OnEvent } from '@nestjs/event-emitter';
import { BotService } from './bot.service';

@Controller('whatsapp')
export class WhatsappController {
  private qrCode: string | null = null;

  constructor(private botService: BotService) {}

  @OnEvent('clientReady')
  handleClientReady() {
    console.log('🟢 WhatsApp client is ready');
  }
  @OnEvent('qrcode.created')
  handleQrcodeCreatedEvent(qrCode: string) {
    this.qrCode = qrCode;
  }

  /**
   * 📌 Endpoint: Obtener QR en formato PNG
   */
  @Get('qr')
  async getQrCode(@Res() response: Response) {
    if (!this.qrCode) {
      return response.status(404).send('QR code not available');
    }
    response.setHeader('Content-Type', 'image/png');

    try {
      await QRCode.toFileStream(response, this.qrCode);
    } catch (error) {
      console.error('❌ Error al generar QR:', error);
      return response.status(500).send('Error generating QR code');
    }
  }

  /**
   * 📩 Endpoint: Enviar Mensaje de Texto
   */
  @Post('send')
  sendMessage(@Body() body: { phone: string; message: string }) {
    const { phone, message } = body;
    if (!phone || !message) {
      return { status: 'error', message: 'Número y mensaje son requeridos.' };
    }
    try {
      const formattedPhone = `${phone}@c.us`; // Formato correcto para WhatsApp Web
      this.botService.sendMessage(formattedPhone, message).catch((error) => {
        console.error('❌ Error al enviar mensaje:', error);
        return { status: 'error', message: 'No se pudo enviar el mensaje.' };
      });
      return { status: 'success', message: `Mensaje enviado a ${phone}` };
    } catch (error) {
      console.error('❌ Error al enviar mensaje:', error);
      return { status: 'error', message: 'No se pudo enviar el mensaje.' };
    }
  }

  /**
   * 📸 Endpoint: Enviar Imagen
   */
  @Post('send-image')
  sendImage(
    @Body() body: { phone: string; imageUrl: string; caption?: string },
  ) {
    const { phone, imageUrl, caption } = body;

    if (!phone || !imageUrl) {
      return {
        status: 'error',
        message: 'Número de teléfono e imagen son requeridos.',
      };
    }

    try {
      const formattedPhone = `${phone}@c.us`;
      this.botService
        .sendImage(formattedPhone, imageUrl, caption)
        .catch((error) => {
          console.error('❌ Error al enviar la imagen:', error);
          return { status: 'error', message: 'No se pudo enviar la imagen.' };
        });
      return { status: 'success', message: `Imagen enviada a ${phone}` };
    } catch (error) {
      console.error('❌ Error al enviar la imagen:', error);
      return { status: 'error', message: 'No se pudo enviar la imagen.' };
    }
  }
}
