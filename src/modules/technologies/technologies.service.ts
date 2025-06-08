import { Inject, Injectable, Logger } from '@nestjs/common';
import { FirestoreService } from 'src/firebase/firestore.service';
import { Technology } from './interfaces/technology.interface';
import { CreateTechnologyDto } from './dto/create-technology.dto';
import { UpdateTechnologyDto } from './dto/update-technology.dto';
import { StandardResponse } from 'src/interface/standard-response.interface';

@Injectable()
export class TechnologiesService {
  private readonly collectionName = 'icon';
  private readonly logger = new Logger(TechnologiesService.name);

  constructor(private readonly firestoreService: FirestoreService) {
    this.logger.log('TechnologiesService initialized');
  }

  private parseDate(date: any): Date {
    if (date?.toDate) return date.toDate();
    if (date?.toISOString) return new Date(date);
    return new Date();
  }

  private formatTechnology(doc: any): Technology {
    try {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        url: data.url,
        createdAt: this.parseDate(data.createdAt),
        updatedAt: this.parseDate(data.updatedAt),
      };
    } catch (error) {
      this.logger.error(
        `Error formatting technology: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async create(
    createDto: CreateTechnologyDto,
  ): Promise<StandardResponse<Technology>> {
    this.logger.log('Creating new technology');
    try {
      const createResult =
        await this.firestoreService.createDoc<CreateTechnologyDto>(
          this.collectionName,
          createDto,
        );

      if (!createResult.success || !createResult.data) {
        const errorMessage =
          createResult.message || 'Failed to create technology';
        this.logger.error(`Failed to create technology: ${errorMessage}`);
        return {
          success: false,
          message: errorMessage,
          error: createResult.error,
          statusCode: createResult.statusCode || 500,
        };
      }

      const doc = await createResult.data.get();
      const technology = this.formatTechnology(doc);

      this.logger.log(`Technology created successfully with ID: ${doc.id}`);
      return {
        success: true,
        message: 'Technology created successfully',
        data: technology,
        statusCode: 201,
      };
    } catch (error) {
      this.logger.error(
        `Failed to create technology: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        message: 'Failed to create technology',
        error: error.message,
        statusCode: 500,
      };
    }
  }

  async findAll(): Promise<StandardResponse<Technology[]>> {
    this.logger.log('Fetching all technologies');
    try {
      const getResult = await this.firestoreService.getDocs<Technology>(
        this.collectionName,
      );

      if (!getResult.success || !getResult.data) {
        const errorMessage =
          getResult.message || 'Failed to fetch technologies';
        this.logger.error(`Failed to fetch technologies: ${errorMessage}`);
        return {
          success: false,
          message: errorMessage,
          error: getResult.error,
          statusCode: getResult.statusCode || 500,
        };
      }

      const technologies = getResult.data.docs.map((doc) =>
        this.formatTechnology(doc),
      );
      this.logger.debug(`Found ${technologies.length} technologies`);

      return {
        success: true,
        message:
          technologies.length > 0
            ? 'Technologies retrieved successfully'
            : 'No technologies found',
        data: technologies,
        statusCode: technologies.length > 0 ? 200 : 204,
      };
    } catch (error) {
      this.logger.error(
        `Failed to fetch technologies: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        message: 'Failed to fetch technologies',
        error: error.message,
        statusCode: 500,
      };
    }
  }

  async findOne(id: string): Promise<StandardResponse<Technology>> {
    this.logger.log(`Fetching technology with ID: ${id}`);
    try {
      const getResult = await this.firestoreService.getDoc<Technology>(
        this.collectionName,
        id,
      );

      if (!getResult.success || !getResult.data) {
        const errorMessage = getResult.message || 'Technology not found';
        this.logger.warn(`Technology not found with ID: ${id}`);
        return {
          success: false,
          message: errorMessage,
          statusCode: getResult.statusCode || 404,
        };
      }

      const technology = this.formatTechnology(getResult.data);
      this.logger.debug(`Found technology with ID: ${id}`);

      return {
        success: true,
        message: 'Technology retrieved successfully',
        data: technology,
        statusCode: 200,
      };
    } catch (error) {
      this.logger.error(
        `Failed to fetch technology ${id}: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        message: 'Failed to fetch technology',
        error: error.message,
        statusCode: 500,
      };
    }
  }

  async update(
    id: string,
    updateDto: UpdateTechnologyDto,
  ): Promise<StandardResponse<Technology>> {
    this.logger.log(`Updating technology with ID: ${id}`);
    try {
      const findResult = await this.findOne(id);
      if (!findResult.success) {
        return findResult;
      }

      const updateResult =
        await this.firestoreService.updateDoc<UpdateTechnologyDto>(
          this.collectionName,
          id,
          updateDto,
        );

      if (!updateResult.success) {
        this.logger.error(
          `Failed to update technology ${id}: ${updateResult.message}`,
        );
        return {
          success: false,
          message: updateResult.message,
          error: updateResult.error,
          statusCode: updateResult.statusCode || 500,
        };
      }

      const updatedTech = await this.findOne(id);
      this.logger.log(`Technology ${id} updated successfully`);

      return updatedTech;
    } catch (error) {
      this.logger.error(
        `Failed to update technology ${id}: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        message: 'Failed to update technology',
        error: error.message,
        statusCode: 500,
      };
    }
  }

  async remove(id: string): Promise<StandardResponse<void>> {
    this.logger.log(`Attempting to delete technology with ID: ${id}`);
    try {
      const findResult = await this.findOne(id);
      if (!findResult.success) {
        this.logger.warn(`Delete failed: Technology ${id} does not exist`);
        return findResult as StandardResponse;
      }

      const deleteResult = await this.firestoreService.deleteDoc(
        this.collectionName,
        id,
      );

      if (!deleteResult.success) {
        this.logger.error(
          `Failed to delete technology ${id}: ${deleteResult.message}`,
        );
        return {
          success: false,
          message: deleteResult.message,
          error: deleteResult.error,
          statusCode: deleteResult.statusCode || 500,
        };
      }

      this.logger.log(`Technology ${id} deleted successfully`);
      return {
        success: true,
        message: 'Technology deleted successfully',
        statusCode: 200,
      };
    } catch (error) {
      this.logger.error(
        `Failed to delete technology ${id}: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        message: 'Failed to delete technology',
        error: error.message,
        statusCode: 500,
      };
    }
  }
}
