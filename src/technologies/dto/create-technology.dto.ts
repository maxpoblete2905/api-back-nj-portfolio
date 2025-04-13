import { IsString, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTechnologyDto {
    @ApiProperty({
        example: 'my_sql.png',
        description: 'Nombre del archivo de la tecnología',
        required: true
    })
    @IsString()
    name: string;

    @ApiProperty({
        example: 'https://firebasestorage.googleapis.com/...',
        description: 'URL pública de la imagen de la tecnología',
        required: true
    })
    @IsUrl()
    url: string;
}