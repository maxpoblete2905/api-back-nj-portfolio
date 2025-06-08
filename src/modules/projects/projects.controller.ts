import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  HttpStatus,
  HttpException,
  Inject,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiSecurity,
} from '@nestjs/swagger';
import { Project } from './entities/project.entity';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Cache } from 'cache-manager';
import { ApiKeyGuard } from 'src/auth/api-key.guard';

@ApiTags('projects')
@Controller('projects')
@ApiSecurity('api-key')
@UseGuards(ApiKeyGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiBody({ type: CreateProjectDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Project created successfully',
    type: CreateProjectDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request data',
  })
  async create(@Body() createProjectDto: CreateProjectDto) {
    const result = await this.projectsService.create(createProjectDto);
    if (!result.success) {
      throw new HttpException(
        result.message,
        result.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return result.data;
  }

  @Get()
  @ApiOperation({ summary: 'Get all projects' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of all projects',
    type: [Project],
  })
  async findAll() {
    console.log('Ejecutando consulta real (no caché)');
    const result = await this.projectsService.findAll();

    if (!result.success) {
      throw new HttpException(
        result.message,
        result.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const data = result.data || [];
    return data;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a project by ID' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Project found',
    type: Project,
  })
  async findOne(@Param('id') id: string) {
    console.log('Ejecutando consulta real (no caché)');
    const result = await this.projectsService.findOne(id);

    if (!result.success) {
      throw new HttpException(
        result.message,
        result.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return result.data;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a project' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiBody({ type: UpdateProjectDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Project updated successfully',
    type: UpdateProjectDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    const result = await this.projectsService.update(id, updateProjectDto);

    if (!result.success) {
      throw new HttpException(
        result.message,
        result.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return result.data;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a project' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Project deleted successfully',
  })
  async remove(@Param('id') id: string) {
    const result = await this.projectsService.remove(id);

    if (!result.success) {
      throw new HttpException(
        result.message,
        result.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return { message: result.message };
  }
}
