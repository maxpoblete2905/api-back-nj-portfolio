// src/contacts/dto/create-contact.dto.ts
import { IsString, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContactDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Nombre completo del contacto',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'john@example.com',
    description: 'Email de contacto válido',
    required: true
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'Me gustaría obtener más información sobre sus servicios',
    description: 'Mensaje del contacto',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    example: '192.168.1.1',
    description: 'Dirección IP del remitente',
    required: false
  })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiProperty({
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    description: 'User agent del navegador',
    required: false
  })
  @IsOptional()
  @IsString()
  userAgent?: string;
}