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
} from '@nestjs/common';
import { CreatePersonalInfoDto } from './dto/create-personal-info.dto';
import { UpdatePersonalInfoDto } from './dto/update-personal-info.dto';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiBody,
} from '@nestjs/swagger';
import { PersonalInformation } from './interfaces/personal-info.interface';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { PersonalInfoService } from './personal-information.service';

@ApiTags('personal-information')
@Controller('personal-information')
export class PersonalInfoController {
    constructor(
        private readonly personalInfoService: PersonalInfoService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) { }

    @Post()
    @ApiOperation({ summary: 'Create personal information' })
    @ApiBody({ type: CreatePersonalInfoDto })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Personal information created successfully',
        type: CreatePersonalInfoDto,
    })
    async create(@Body() createDto: CreatePersonalInfoDto) {
        const result = await this.personalInfoService.create(createDto);
        if (!result.success) {
            throw new HttpException(
                result.message,
                result.statusCode || HttpStatus.INTERNAL_SERVER_ERROR
            );
        }

        await this.cacheManager.del('personal_info');
        return result.data;
    }

    @Get()
    @ApiOperation({ summary: 'Get all personal information records' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'List of all personal information records',
        type: [CreatePersonalInfoDto],
    })
    async findAll() {
        const cacheKey = 'personal_info_all';
        const cached = await this.cacheManager.get<PersonalInformation[]>(cacheKey);

        if (cached) {
            return cached;
        }

        const result = await this.personalInfoService.findAll();
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
    @ApiOperation({ summary: 'Get personal information by ID' })
    @ApiParam({ name: 'id', description: 'Personal information ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Personal information found',
        type: CreatePersonalInfoDto,
    })
    async findOne(@Param('id') id: string) {
        const cacheKey = `personal_info_${id}`;
        const cached = await this.cacheManager.get<PersonalInformation>(cacheKey);

        if (cached) {
            return cached;
        }

        const result = await this.personalInfoService.findOne(id);
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
    @ApiOperation({ summary: 'Update personal information' })
    @ApiParam({ name: 'id', description: 'Personal information ID' })
    @ApiBody({ type: UpdatePersonalInfoDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Personal information updated successfully',
        type: CreatePersonalInfoDto,
    })
    async update(
        @Param('id') id: string,
        @Body() updateDto: UpdatePersonalInfoDto
    ) {
        const result = await this.personalInfoService.update(id, updateDto);
        if (!result.success) {
            throw new HttpException(
                result.message,
                result.statusCode || HttpStatus.INTERNAL_SERVER_ERROR
            );
        }

        await Promise.all([
            this.cacheManager.del(`personal_info_${id}`),
            this.cacheManager.del('personal_info_all'),
        ]);

        return result.data;
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete personal information' })
    @ApiParam({ name: 'id', description: 'Personal information ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Personal information deleted successfully',
    })
    async remove(@Param('id') id: string) {
        const result = await this.personalInfoService.remove(id);
        if (!result.success) {
            throw new HttpException(
                result.message,
                result.statusCode || HttpStatus.INTERNAL_SERVER_ERROR
            );
        }

        await Promise.all([
            this.cacheManager.del(`personal_info_${id}`),
            this.cacheManager.del('personal_info_all'),
        ]);

        return { message: result.message };
    }
}