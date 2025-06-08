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
import { CreatePersonalInfoDto } from './dto/create-personal-info.dto';
import { UpdatePersonalInfoDto } from './dto/update-personal-info.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiSecurity,
} from '@nestjs/swagger';
import { PersonalInfoService } from './personal-information.service';
import { ApiKeyGuard } from 'src/auth/api-key.guard';

@ApiTags('personal-information')
@ApiSecurity('api-key')
@Controller('personal-information')
@UseGuards(ApiKeyGuard)
export class PersonalInfoController {
  constructor(private readonly personalInfoService: PersonalInfoService) {}

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
        result.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

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
    const result = await this.personalInfoService.findAll();
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
  @ApiOperation({ summary: 'Get personal information by ID' })
  @ApiParam({ name: 'id', description: 'Personal information ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Personal information found',
    type: CreatePersonalInfoDto,
  })
  async findOne(@Param('id') id: string) {
    const result = await this.personalInfoService.findOne(id);
    if (!result.success) {
      throw new HttpException(
        result.message,
        result.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

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
    @Body() updateDto: UpdatePersonalInfoDto,
  ) {
    const result = await this.personalInfoService.update(id, updateDto);
    if (!result.success) {
      throw new HttpException(
        result.message,
        result.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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
        result.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return { message: result.message };
  }
}
