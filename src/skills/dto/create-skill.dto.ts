// src/skills/dto/create-skill.dto.ts
import { IsString, IsArray, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSkillDto {
    @ApiProperty({
        example: 'NestJS Development',
        description: 'The title of the skill',
        required: true,
    })
    @IsString()
    title: string;

    @ApiProperty({
        example: 'Building scalable server-side applications with NestJS framework',
        description: 'Detailed description of the skill',
        required: true,
    })
    @IsString()
    description: string;

    @ApiProperty({
        example: 'https://example.com/icons/nestjs.png',
        description: 'URL to an icon representing the skill',
        required: true,
    })
    @IsUrl()
    icon: string;

    @ApiProperty({
        example: ['NestJS', 'TypeScript', 'Node.js'],
        description: 'Array of technologies related to this skill',
        type: [String],
        required: true,
    })
    @IsArray()
    @IsString({ each: true })
    technologies: string[];
}