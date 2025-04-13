// src/skills/skills.controller.ts
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
    Inject,
} from '@nestjs/common';
import { SkillsService } from './skills.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { Skill } from './interfaces/skill.interface';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiBody,
    ApiQuery,
} from '@nestjs/swagger';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@ApiTags('skills')
@Controller('skills')
export class SkillsController {
    constructor(
        private readonly skillsService: SkillsService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) { }

    @Post()
    @ApiOperation({ summary: 'Create a new skill' })
    @ApiBody({ type: CreateSkillDto })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Skill created successfully',
        type: CreateSkillDto,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid request data',
    })
    async create(@Body() createSkillDto: CreateSkillDto) {
        const result = await this.skillsService.create(createSkillDto);
        if (!result.success) {
            throw new HttpException(result.message, result.statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
        }

        // Invalidar caché de lista de skills
        await this.cacheManager.del('all_skills');
        return result.data;
    }

    @Post(':id')
    @ApiOperation({ summary: 'Create a new skill with specific ID' })
    @ApiParam({ name: 'id', description: 'Skill ID' })
    @ApiBody({ type: CreateSkillDto })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Skill created successfully with specified ID',
        type: CreateSkillDto,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid request data or ID already exists',
    })
    async createWithId(
        @Param('id') id: string,
        @Body() createSkillDto: CreateSkillDto,
    ) {
        const result = await this.skillsService.create(createSkillDto, id);
        if (!result.success) {
            throw new HttpException(result.message, result.statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
        }

        // Invalidar caché de lista de skills
        await this.cacheManager.del('all_skills');
        return result.data;
    }

    @Get()
    @ApiOperation({ summary: 'Get all skills' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'List of all skills',
        type: [CreateSkillDto],
    })
    async findAll() {
        const cacheKey = 'all_skills';
        const cached = await this.cacheManager.get(cacheKey);

        if (cached) {
            console.log("Retornando skills desde caché");
            return cached;
        }

        console.log("Ejecutando consulta real (no caché)");
        const result = await this.skillsService.findAll();

        if (!result.success) {
            throw new HttpException(result.message, result.statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
        }

        const data = result.data || [];
        await this.cacheManager.set(cacheKey, data, 0); // TTL 0 = sin expiración
        return data;
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a skill by ID' })
    @ApiParam({ name: 'id', description: 'Skill ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Skill found',
        type: CreateSkillDto,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Skill not found',
    })
    async findOne(@Param('id') id: string) {
        const cacheKey = `skill_${id}`;
        const cached = await this.cacheManager.get(cacheKey);

        if (cached) {
            console.log("Retornando skill desde caché");
            return cached;
        }

        console.log("Ejecutando consulta real (no caché)");
        const result = await this.skillsService.findOne(id);

        if (!result.success) {
            await this.cacheManager.del(cacheKey);
            throw new HttpException(result.message, result.statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
        }

        await this.cacheManager.set(cacheKey, result.data, 0);
        return result.data;
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update a skill' })
    @ApiParam({ name: 'id', description: 'Skill ID' })
    @ApiBody({ type: CreateSkillDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Skill updated successfully',
        type: CreateSkillDto,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Skill not found',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid request data',
    })
    async update(
        @Param('id') id: string,
        @Body() updateSkillDto: CreateSkillDto,
    ) {
        const result = await this.skillsService.update(id, updateSkillDto);

        if (!result.success) {
            throw new HttpException(result.message, result.statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
        }

        // Actualizar cachés afectadas
        await Promise.all([
            this.cacheManager.del(`skill_${id}`),
            this.cacheManager.del('all_skills')
        ]);

        return result.data;
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a skill' })
    @ApiParam({ name: 'id', description: 'Skill ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Skill deleted successfully',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Skill not found',
    })
    async remove(@Param('id') id: string) {
        const result = await this.skillsService.remove(id);

        if (!result.success) {
            throw new HttpException(result.message, result.statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
        }

        // Invalidar cachés afectadas
        await Promise.all([
            this.cacheManager.del(`skill_${id}`),
            this.cacheManager.del('all_skills')
        ]);

        return { message: result.message };
    }
}