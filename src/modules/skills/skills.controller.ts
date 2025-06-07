import { Controller, Get } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StandardResponse } from 'src/interface/standard-response.interface';
import { GroupedSkillsDto } from './dto/create-skill.dto';

@ApiTags('Skills')
@Controller('skills')
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
  async getGroupedSkills(): Promise<StandardResponse<any>> {
    return this.skillsService.findAll();
  }
}
