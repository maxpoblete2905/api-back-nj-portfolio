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
import { TechnologiesService } from './technologies.service';
import { CreateTechnologyDto } from './dto/create-technology.dto';
import { UpdateTechnologyDto } from './dto/update-technology.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiSecurity,
} from '@nestjs/swagger';
import { Technology } from './interfaces/technology.interface';
import { Cache } from 'cache-manager';
import { ApiKeyGuard } from 'src/auth/api-key.guard';

@ApiTags('technologies')
@ApiSecurity('api-key')
@Controller('technologies')
@UseGuards(ApiKeyGuard)
export class TechnologiesController {
  constructor(private readonly technologiesService: TechnologiesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new technology' })
  @ApiBody({ type: CreateTechnologyDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Technology created successfully',
    type: CreateTechnologyDto,
  })
  async create(@Body() createDto: CreateTechnologyDto) {
    const result = await this.technologiesService.create(createDto);
    if (!result.success) {
      throw new HttpException(
        result.message,
        result.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return result.data;
  }

  @Get()
  @ApiOperation({ summary: 'Get all technologies' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of all technologies',
    type: [CreateTechnologyDto],
  })
  async findAll() {
    const result = await this.technologiesService.findAll();
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
  @ApiOperation({ summary: 'Get a technology by ID' })
  @ApiParam({ name: 'id', description: 'Technology ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Technology found',
    type: CreateTechnologyDto,
  })
  async findOne(@Param('id') id: string) {
    const result = await this.technologiesService.findOne(id);
    if (!result.success) {
      throw new HttpException(
        result.message,
        result.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return result.data;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a technology' })
  @ApiParam({ name: 'id', description: 'Technology ID' })
  @ApiBody({ type: UpdateTechnologyDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Technology updated successfully',
    type: CreateTechnologyDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateTechnologyDto,
  ) {
    const result = await this.technologiesService.update(id, updateDto);
    if (!result.success) {
      throw new HttpException(
        result.message,
        result.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return result.data;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a technology' })
  @ApiParam({ name: 'id', description: 'Technology ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Technology deleted successfully',
  })
  async remove(@Param('id') id: string) {
    const result = await this.technologiesService.remove(id);
    if (!result.success) {
      throw new HttpException(
        result.message,
        result.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return { message: result.message };
  }
}
