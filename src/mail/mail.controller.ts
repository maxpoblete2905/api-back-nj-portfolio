import { Controller, Post, Body } from '@nestjs/common';
import { MailService } from './mail.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiSecurity } from '@nestjs/swagger';

@ApiTags('Mail')
@ApiSecurity('api-key')
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('contact-confirmation')
  @ApiOperation({ summary: 'Enviar confirmación de contacto' })
  @ApiResponse({
    status: 200,
    description: 'Confirmación de contacto enviada exitosamente',
    schema: {
      example: { message: 'Contact confirmation email sent successfully' },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Error al enviar el email',
    schema: {
      example: {
        message: 'Failed to send contact confirmation',
        error: 'Error details',
      },
    },
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          example: 'user@example.com',
          description: 'Dirección de correo electrónico del destinatario',
        },
        name: {
          type: 'string',
          example: 'Juan Pérez',
          description: 'Nombre del remitente',
        },
        subject: {
          type: 'string',
          example: 'Consulta sobre tu trabajo',
          description: 'Asunto del mensaje',
        },
        message: {
          type: 'string',
          example: 'Me interesa colaborar contigo...',
          description: 'Contenido del mensaje',
        },
      },
      required: ['email', 'name', 'subject', 'message'],
    },
  })
  async sendContactConfirmation(
    @Body()
    body: {
      email: string;
      name: string;
      subject: string;
      message: string;
    },
  ) {
    console.log(body);
    await this.mailService.sendContactConfirmation(
      body.email,
      body.name,
      body.subject,
      body.message,
    );
    return { message: 'Contact confirmation email sent successfully' };
  }
}
