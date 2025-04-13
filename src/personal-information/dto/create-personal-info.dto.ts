import { IsString, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePersonalInfoDto {
    @ApiProperty({
        example: 'Como profesional de TI con más de 6 años de experiencia...',
        description: 'Descripción profesional detallada',
        required: true
    })
    @IsString()
    description: string;

    @ApiProperty({
        example: 'Desarrollador Web & Arquitecto de Soluciones Digitales',
        description: 'Título o posición profesional',
        required: true
    })
    @IsString()
    descriptionPosition: string;

    @ApiProperty({
        example: 'Max Poblete',
        description: 'Nombre completo',
        required: true
    })
    @IsString()
    name: string;

    @ApiProperty({
        example: 'Analista de Sistemas',
        description: 'Título universitario o certificación principal',
        required: true
    })
    @IsString()
    university_title: string;

    @ApiProperty({
        example: '2025-03-22T00:00:00-03:00',
        description: 'Fecha de última actualización en formato ISO 8601',
        type: 'string',
        format: 'date-time',
        required: true
    })
    @IsDate()
    update: Date;
}