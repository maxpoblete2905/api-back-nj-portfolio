import { ApiProperty } from '@nestjs/swagger';

export class TechnologyDto {
  @ApiProperty({ example: 'NestJS', description: 'Nombre de la tecnología' })
  name: string;
}

export class SkillItemDto {
  @ApiProperty({
    example: 'Backend Development',
    description: 'Título de la skill',
  })
  title: string;

  @ApiProperty({
    example: 'Desarrollo de APIs robustas',
    description: 'Descripción de la skill',
  })
  description: string;

  @ApiProperty({ example: 'server', description: 'Icono representativo' })
  icon: string;

  @ApiProperty({
    type: [TechnologyDto],
    description: 'Tecnologías relacionadas',
  })
  technologies: TechnologyDto[];
}

export class CreateSkillDto {
  @ApiProperty({ example: 'Backend', description: 'Nombre de la categoría' })
  name: string;

  @ApiProperty({ example: 'database', description: 'Icono de la categoría' })
  icon: string;

  @ApiProperty({ type: [SkillItemDto], description: 'Skills a agregar' })
  skills: SkillItemDto[];
}

export class GroupedSkillsDto extends CreateSkillDto {}
