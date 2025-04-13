import { IsString, IsDate, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCertificationDto {
    @ApiProperty({
        example: 'AWS Certified Solutions Architect',
        description: 'Título de la certificación',
        required: true
    })
    @IsString()
    title: string;

    @ApiProperty({
        example: 'Amazon Web Services',
        description: 'Institución que emite la certificación',
        required: true
    })
    @IsString()
    institution: string;

    @ApiProperty({
        example: '2023-05-15',
        description: 'Fecha de emisión de la certificación',
        type: 'string',
        format: 'date'
    })
    @IsDate()
    issueDate: Date;

    @ApiProperty({
        example: '2025-05-15',
        description: 'Fecha de expiración de la certificación (opcional)',
        type: 'string',
        format: 'date',
        required: false
    })
    @IsOptional()
    @IsDate()
    expirationDate?: Date;

    @ApiProperty({
        example: 'AWS-123456789',
        description: 'ID de la credencial (opcional)',
        required: false
    })
    @IsOptional()
    @IsString()
    credentialId?: string;

    @ApiProperty({
        example: 'https://www.credly.com/badges/123456789',
        description: 'URL de verificación de la credencial (opcional)',
        required: false
    })
    @IsOptional()
    @IsUrl()
    credentialUrl?: string;

    @ApiProperty({
        example: 'https://example.com/certification-image.png',
        description: 'URL de la imagen de la certificación',
        required: true
    })
    @IsUrl()
    imageUrl: string;
}