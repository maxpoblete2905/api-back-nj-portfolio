import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { Project } from './entities/project.entity';
import { UpdateProjectDto } from './dto/update-project.dto';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiBody({ type: CreateProjectDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Project created successfully',
    type: Project,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request data',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async create(@Body() createProjectDto: CreateProjectDto) {
    const result = await this.projectsService.create(createProjectDto);
    if (!result.success) {
      throw new HttpException(result.message, result.statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return result.data;
  }

  @Get()
  @ApiOperation({ summary: 'Get all projects' })
  @ApiQuery({ name: 'client', required: false, description: 'Filter by client' })
  @ApiQuery({ name: 'technology', required: false, description: 'Filter by technology' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of all projects',
    type: [Project],
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'No projects found',
  })
  async findAll() {
    const result = await this.projectsService.findAll();
    if (!result.success) {
      throw new HttpException(result.message, result.statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return result.data || [];
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a project by ID' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Project found',
    type: Project,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Project not found',
  })
  async findOne(@Param('id') id: string) {
    const result = await this.projectsService.findOne(id);
    if (!result.success) {
      throw new HttpException(result.message, result.statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
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
    type: Project,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Project not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request data',
  })
  async update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    const result = await this.projectsService.update(id, updateProjectDto);
    if (!result.success) {
      throw new HttpException(result.message, result.statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
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
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Project not found',
  })
  async remove(@Param('id') id: string) {
    const result = await this.projectsService.remove(id);
    if (!result.success) {
      throw new HttpException(result.message, result.statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return { message: result.message };
  }
}