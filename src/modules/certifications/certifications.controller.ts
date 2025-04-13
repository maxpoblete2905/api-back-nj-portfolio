// src/certifications/certifications.controller.ts
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
import { CertificationsService } from './certifications.service';
import { CreateCertificationDto } from './dto/create-certification.dto';
import { UpdateCertificationDto } from './dto/update-certification.dto';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiBody,
} from '@nestjs/swagger';
import { Certification } from './interfaces/certification.interface';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ApiKeyGuard } from 'src/auth/api-key.guard';

@ApiTags('certifications')
@Controller('certifications')
@UseGuards(ApiKeyGuard)
export class CertificationsController {
    constructor(
        private readonly certificationsService: CertificationsService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) { }

    @Post()
    @ApiOperation({ summary: 'Create a new certification' })
    @ApiBody({ type: CreateCertificationDto })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Certification created successfully',
        type: CreateCertificationDto,
    })
    async create(@Body() createDto: CreateCertificationDto) {
        const result = await this.certificationsService.create(createDto);
        if (!result.success) {
            throw new HttpException(
                result.message,
                result.statusCode || HttpStatus.INTERNAL_SERVER_ERROR
            );
        }

        await this.cacheManager.del('all_certifications');
        return result.data;
    }

    @Get()
    @ApiOperation({ summary: 'Get all certifications' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'List of all certifications',
        type: [CreateCertificationDto],
    })
    async findAll() {
        const cacheKey = 'all_certifications';
        const cached = await this.cacheManager.get<Certification[]>(cacheKey);

        if (cached) {
            return cached;
        }

        const result = await this.certificationsService.findAll();
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
    @ApiOperation({ summary: 'Get a certification by ID' })
    @ApiParam({ name: 'id', description: 'Certification ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Certification found',
        type: CreateCertificationDto,
    })
    async findOne(@Param('id') id: string) {
        const cacheKey = `certification_${id}`;
        const cached = await this.cacheManager.get<Certification>(cacheKey);

        if (cached) {
            return cached;
        }

        const result = await this.certificationsService.findOne(id);
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
    @ApiOperation({ summary: 'Update a certification' })
    @ApiParam({ name: 'id', description: 'Certification ID' })
    @ApiBody({ type: UpdateCertificationDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Certification updated successfully',
        type: CreateCertificationDto,
    })
    async update(
        @Param('id') id: string,
        @Body() updateDto: UpdateCertificationDto
    ) {
        const result = await this.certificationsService.update(id, updateDto);
        if (!result.success) {
            throw new HttpException(
                result.message,
                result.statusCode || HttpStatus.INTERNAL_SERVER_ERROR
            );
        }

        await Promise.all([
            this.cacheManager.del(`certification_${id}`),
            this.cacheManager.del('all_certifications'),
        ]);

        return result.data;
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a certification' })
    @ApiParam({ name: 'id', description: 'Certification ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Certification deleted successfully',
    })
    async remove(@Param('id') id: string) {
        const result = await this.certificationsService.remove(id);
        if (!result.success) {
            throw new HttpException(
                result.message,
                result.statusCode || HttpStatus.INTERNAL_SERVER_ERROR
            );
        }

        await Promise.all([
            this.cacheManager.del(`certification_${id}`),
            this.cacheManager.del('all_certifications'),
        ]);

        return { message: result.message };
    }

    // Agregar este endpoint al CertificationsController
    @Post('seed')
    @ApiOperation({ summary: 'Seed initial certifications data' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Certifications seeded successfully',
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Failed to seed certifications',
    })
    async seed() {
        const result = await this.certificationsService.seedCertifications();
        if (!result.success) {
            throw new HttpException(
                result.message,
                result.statusCode || HttpStatus.INTERNAL_SERVER_ERROR
            );
        }

        await this.cacheManager.del('all_certifications');
        return { message: result.message };
    }
}