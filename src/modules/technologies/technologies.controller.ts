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
  } from '@nestjs/swagger';
  import { Technology } from './interfaces/technology.interface';
  import { Cache } from 'cache-manager';
  import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ApiKeyGuard } from 'src/auth/api-key.guard';
  
  @ApiTags('technologies')
  @Controller('technologies')
  @UseGuards(ApiKeyGuard)
  export class TechnologiesController {
    constructor(
      private readonly technologiesService: TechnologiesService,
      @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) {}
  
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
          result.statusCode || HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
  
      await this.cacheManager.del('all_technologies');
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
      const cacheKey = 'all_technologies';
      const cached = await this.cacheManager.get<Technology[]>(cacheKey);
  
      if (cached) {
        return cached;
      }
  
      const result = await this.technologiesService.findAll();
      if (!result.success) {
        throw new HttpException(
          result.message,
          result.statusCode || HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
  
      const data = result.data || [];
      await this.cacheManager.set(cacheKey, data, 3600000); // Cache for 1 hour
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
      const cacheKey = `technology_${id}`;
      const cached = await this.cacheManager.get<Technology>(cacheKey);
  
      if (cached) {
        return cached;
      }
  
      const result = await this.technologiesService.findOne(id);
      if (!result.success) {
        throw new HttpException(
          result.message,
          result.statusCode || HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
  
      await this.cacheManager.set(cacheKey, result.data, 3600000); // Cache for 1 hour
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
      @Body() updateDto: UpdateTechnologyDto
    ) {
      const result = await this.technologiesService.update(id, updateDto);
      if (!result.success) {
        throw new HttpException(
          result.message,
          result.statusCode || HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
  
      await Promise.all([
        this.cacheManager.del(`technology_${id}`),
        this.cacheManager.del('all_technologies'),
      ]);
  
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
          result.statusCode || HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
  
      await Promise.all([
        this.cacheManager.del(`technology_${id}`),
        this.cacheManager.del('all_technologies'),
      ]);
  
      return { message: result.message };
    }
  }