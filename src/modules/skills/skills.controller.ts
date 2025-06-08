import { Controller, Get, UseGuards } from '@nestjs/common';
import { SkillsService } from './skills.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
} from '@nestjs/swagger';
import { GroupedSkillsDto } from './dto/create-skill.dto';
import { SkillCategory } from './interfaces/skill.interface';
import { ApiKeyGuard } from 'src/auth/api-key.guard';

@ApiTags('Skills')
@ApiSecurity('api-key')
@Controller('skills')
@UseGuards(ApiKeyGuard)
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener todas las habilidades agrupadas por categorías',
    description:
      'Retorna un objeto con las habilidades organizadas por categorías',
  })
  @ApiResponse({
    status: 200,
    description: 'Estructura completa de habilidades obtenida exitosamente',
    type: GroupedSkillsDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor',
  })
  async getGroupedSkills(): Promise<SkillCategory> {
    return this.skillsService.findAll();
  }
}
