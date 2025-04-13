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
} from '@nestjs/common';
import { AcademicService } from './academic.service';
import { CreateAcademicDto } from './dto/create-academic.dto';
import { UpdateAcademicDto } from './dto/update-academic.dto';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiBody,
} from '@nestjs/swagger';

@ApiTags('Academic')
@Controller('academic')
export class AcademicController {
    constructor(private readonly academicService: AcademicService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new academic record' })
    @ApiBody({ type: CreateAcademicDto })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Academic record created successfully',
    })
    async create(@Body() createDto: CreateAcademicDto) {
        const result = await this.academicService.create(createDto);
        if (!result.success) {
            throw new HttpException(result.message, result.statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return result.data;
    }

    @Get()
    @ApiOperation({ summary: 'Get all academic records' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'List of all academic records',
    })
    async findAll() {
        const result = await this.academicService.findAll();
        if (!result.success) {
            throw new HttpException(result.message, result.statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return result.data;
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get an academic record by ID' })
    @ApiParam({ name: 'id', description: 'Academic record ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Academic record found',
    })
    async findOne(@Param('id') id: string) {
        const result = await this.academicService.findOne(id);
        if (!result.success) {
            throw new HttpException(result.message, result.statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return result.data;
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update an academic record' })
    @ApiParam({ name: 'id', description: 'Academic record ID' })
    @ApiBody({ type: UpdateAcademicDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Academic record updated successfully',
    })
    async update(
        @Param('id') id: string,
        @Body() updateDto: UpdateAcademicDto,
    ) {
        const result = await this.academicService.update(id, updateDto);
        if (!result.success) {
            throw new HttpException(result.message, result.statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return result.data;
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete an academic record' })
    @ApiParam({ name: 'id', description: 'Academic record ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Academic record deleted successfully',
    })
    async remove(@Param('id') id: string) {
        const result = await this.academicService.remove(id);
        if (!result.success) {
            throw new HttpException(result.message, result.statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return { message: result.message };
    }

    @Post('seed')
    @ApiOperation({ summary: 'Seed initial academic data' })
    async seedData() {
        return this.academicService.seedInitialData();
    }
}