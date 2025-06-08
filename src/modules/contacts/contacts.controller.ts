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
  Query,
  UseGuards,
} from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
  ApiSecurity,
} from '@nestjs/swagger';
import { Contact } from './interfaces/contact.interface';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ApiKeyGuard } from 'src/auth/api-key.guard';

@ApiTags('contacts')
@Controller('contacts')
@ApiSecurity('api-key')
@UseGuards(ApiKeyGuard)
export class ContactsController {
  constructor(
    private readonly contactsService: ContactsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new contact' })
  @ApiBody({ type: CreateContactDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Contact created successfully',
    type: CreateContactDto,
  })
  async create(@Body() createDto: CreateContactDto) {
    const result = await this.contactsService.create(createDto);
    if (!result.success) {
      throw new HttpException(
        result.message,
        result.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    await this.cacheManager.del('all_contacts');
    return result.data;
  }

  @Get()
  @ApiOperation({ summary: 'Get all contacts' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['pending', 'read', 'replied', 'archived'],
    description: 'Filter contacts by status',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of all contacts',
    type: [CreateContactDto],
  })
  async findAll(@Query('status') status?: string) {
    if (status) {
      return this.findByStatus(status);
    }

    const cacheKey = 'all_contacts';
    const cached = await this.cacheManager.get<Contact[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const result = await this.contactsService.findAll();
    if (!result.success) {
      throw new HttpException(
        result.message,
        result.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const data = result.data || [];
    await this.cacheManager.set(cacheKey, data, 1800000); // Cache for 30 minutes
    return data;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a contact by ID' })
  @ApiParam({ name: 'id', description: 'Contact ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Contact found',
    type: CreateContactDto,
  })
  async findOne(@Param('id') id: string) {
    const cacheKey = `contact_${id}`;
    const cached = await this.cacheManager.get<Contact>(cacheKey);

    if (cached) {
      return cached;
    }

    const result = await this.contactsService.findOne(id);
    if (!result.success) {
      throw new HttpException(
        result.message,
        result.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    await this.cacheManager.set(cacheKey, result.data, 1800000); // Cache for 30 minutes
    return result.data;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a contact' })
  @ApiParam({ name: 'id', description: 'Contact ID' })
  @ApiBody({ type: UpdateContactDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Contact updated successfully',
    type: UpdateContactDto,
  })
  async update(@Param('id') id: string, @Body() updateDto: UpdateContactDto) {
    const result = await this.contactsService.update(id, updateDto);
    if (!result.success) {
      throw new HttpException(
        result.message,
        result.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    await Promise.all([
      this.cacheManager.del(`contact_${id}`),
      this.cacheManager.del('all_contacts'),
    ]);

    return result.data;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a contact' })
  @ApiParam({ name: 'id', description: 'Contact ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Contact deleted successfully',
  })
  async remove(@Param('id') id: string) {
    const result = await this.contactsService.remove(id);
    if (!result.success) {
      throw new HttpException(
        result.message,
        result.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    await Promise.all([
      this.cacheManager.del(`contact_${id}`),
      this.cacheManager.del('all_contacts'),
    ]);

    return { message: result.message };
  }

  private async findByStatus(status: string) {
    const cacheKey = `contacts_status_${status}`;
    const cached = await this.cacheManager.get<Contact[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const result = await this.contactsService.findByStatus(status);
    if (!result.success) {
      throw new HttpException(
        result.message,
        result.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const data = result.data || [];
    await this.cacheManager.set(cacheKey, data, 900000); // Cache for 15 minutes
    return data;
  }
}
