// src/contacts/contacts.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { FirestoreService } from 'src/firebase/firestore.service';
import { Contact } from './interfaces/contact.interface';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { StandardResponse } from 'src/interface/standard-response.interface';

@Injectable()
export class ContactsService {
  private readonly collectionName = 'contacts';
  private readonly logger = new Logger(ContactsService.name);

  constructor(private readonly firestoreService: FirestoreService) {
    this.logger.log('ContactsService initialized');
  }

  private parseDate(date: any): Date {
    if (date?.toDate) return date.toDate();
    if (date?.toISOString) return new Date(date);
    return new Date();
  }

  private formatContact(doc: any): Contact {
    try {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        email: data.email,
        message: data.message,
        status: data.status || 'pending',
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        createdAt: this.parseDate(data.createdAt),
        updatedAt: this.parseDate(data.updatedAt),
      };
    } catch (error) {
      this.logger.error(
        `Error formatting contact: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async create(
    createDto: CreateContactDto,
  ): Promise<StandardResponse<Contact>> {
    this.logger.log('Creating new contact');
    try {
      const contactData = {
        ...createDto,
        status: 'pending',
      };

      const createResult = await this.firestoreService.createDoc<
        typeof contactData
      >(this.collectionName, contactData);

      if (!createResult.success || !createResult.data) {
        const errorMessage = createResult.message || 'Failed to create contact';
        this.logger.error(`Failed to create contact: ${errorMessage}`);
        return {
          success: false,
          message: errorMessage,
          error: createResult.error,
          statusCode: createResult.statusCode || 500,
        };
      }

      const doc = await createResult.data.get();
      const contact = this.formatContact(doc);

      this.logger.log(`Contact created successfully with ID: ${doc.id}`);
      return {
        success: true,
        message: 'Contact created successfully',
        data: contact,
        statusCode: 201,
      };
    } catch (error) {
      this.logger.error(
        `Failed to create contact: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        message: 'Failed to create contact',
        error: error.message,
        statusCode: 500,
      };
    }
  }

  async findAll(): Promise<StandardResponse<Contact[]>> {
    this.logger.log('Fetching all contacts');
    try {
      const getResult = await this.firestoreService.getDocs<Contact>(
        this.collectionName,
      );

      if (!getResult.success || !getResult.data) {
        const errorMessage = getResult.message || 'Failed to fetch contacts';
        this.logger.error(`Failed to fetch contacts: ${errorMessage}`);
        return {
          success: false,
          message: errorMessage,
          error: getResult.error,
          statusCode: getResult.statusCode || 500,
        };
      }

      const contacts = getResult.data.docs.map((doc) =>
        this.formatContact(doc),
      );
      this.logger.debug(`Found ${contacts.length} contacts`);

      return {
        success: true,
        message:
          contacts.length > 0
            ? 'Contacts retrieved successfully'
            : 'No contacts found',
        data: contacts,
        statusCode: contacts.length > 0 ? 200 : 204,
      };
    } catch (error) {
      this.logger.error(
        `Failed to fetch contacts: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        message: 'Failed to fetch contacts',
        error: error.message,
        statusCode: 500,
      };
    }
  }

  async findOne(id: string): Promise<StandardResponse<Contact>> {
    this.logger.log(`Fetching contact with ID: ${id}`);
    try {
      const getResult = await this.firestoreService.getDoc<Contact>(
        this.collectionName,
        id,
      );

      if (!getResult.success || !getResult.data) {
        const errorMessage = getResult.message || 'Contact not found';
        this.logger.warn(`Contact not found with ID: ${id}`);
        return {
          success: false,
          message: errorMessage,
          statusCode: getResult.statusCode || 404,
        };
      }

      const contact = this.formatContact(getResult.data);
      this.logger.debug(`Found contact with ID: ${id}`);

      return {
        success: true,
        message: 'Contact retrieved successfully',
        data: contact,
        statusCode: 200,
      };
    } catch (error) {
      this.logger.error(
        `Failed to fetch contact ${id}: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        message: 'Failed to fetch contact',
        error: error.message,
        statusCode: 500,
      };
    }
  }

  async update(
    id: string,
    updateDto: UpdateContactDto,
  ): Promise<StandardResponse<Contact>> {
    this.logger.log(`Updating contact with ID: ${id}`);
    try {
      const findResult = await this.findOne(id);
      if (!findResult.success) {
        return findResult;
      }

      const updateResult =
        await this.firestoreService.updateDoc<UpdateContactDto>(
          this.collectionName,
          id,
          updateDto,
        );

      if (!updateResult.success) {
        this.logger.error(
          `Failed to update contact ${id}: ${updateResult.message}`,
        );
        return {
          success: false,
          message: updateResult.message,
          error: updateResult.error,
          statusCode: updateResult.statusCode || 500,
        };
      }

      const updatedContact = await this.findOne(id);
      this.logger.log(`Contact ${id} updated successfully`);

      return updatedContact;
    } catch (error) {
      this.logger.error(
        `Failed to update contact ${id}: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        message: 'Failed to update contact',
        error: error.message,
        statusCode: 500,
      };
    }
  }

  async remove(id: string): Promise<StandardResponse<void>> {
    this.logger.log(`Attempting to delete contact with ID: ${id}`);
    try {
      const findResult = await this.findOne(id);
      if (!findResult.success) {
        this.logger.warn(`Delete failed: Contact ${id} does not exist`);
        return findResult as StandardResponse;
      }

      const deleteResult = await this.firestoreService.deleteDoc(
        this.collectionName,
        id,
      );

      if (!deleteResult.success) {
        this.logger.error(
          `Failed to delete contact ${id}: ${deleteResult.message}`,
        );
        return {
          success: false,
          message: deleteResult.message,
          error: deleteResult.error,
          statusCode: deleteResult.statusCode || 500,
        };
      }

      this.logger.log(`Contact ${id} deleted successfully`);
      return {
        success: true,
        message: 'Contact deleted successfully',
        statusCode: 200,
      };
    } catch (error) {
      this.logger.error(
        `Failed to delete contact ${id}: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        message: 'Failed to delete contact',
        error: error.message,
        statusCode: 500,
      };
    }
  }

  async findByStatus(status: string): Promise<StandardResponse<Contact[]>> {
    this.logger.log(`Finding contacts with status: ${status}`);
    try {
      const queryResult = await this.firestoreService.queryDocs<Contact>(
        this.collectionName,
        'status',
        '==',
        status,
      );

      if (!queryResult.success || !queryResult.data) {
        const errorMessage =
          queryResult.message || 'Failed to query contacts by status';
        this.logger.error(`Failed to find contacts by status: ${errorMessage}`);
        return {
          success: false,
          message: errorMessage,
          error: queryResult.error,
          statusCode: queryResult.statusCode || 500,
        };
      }

      const contacts = queryResult.data.docs.map((doc) =>
        this.formatContact(doc),
      );
      this.logger.debug(
        `Found ${contacts.length} contacts with status ${status}`,
      );

      return {
        success: true,
        message:
          contacts.length > 0
            ? 'Contacts retrieved successfully'
            : 'No contacts found with this status',
        data: contacts,
        statusCode: contacts.length > 0 ? 200 : 204,
      };
    } catch (error) {
      this.logger.error(
        `Failed to find contacts by status: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        message: 'Failed to find contacts by status',
        error: error.message,
        statusCode: 500,
      };
    }
  }
}
