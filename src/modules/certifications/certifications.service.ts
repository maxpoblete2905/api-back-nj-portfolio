import { Injectable, Logger } from '@nestjs/common';
import { FirestoreService } from 'src/firebase/firestore.service';
import { Certification } from './interfaces/certification.interface';
import { CreateCertificationDto } from './dto/create-certification.dto';
import { UpdateCertificationDto } from './dto/update-certification.dto';
import { StandardResponse } from 'src/interface/standard-response.interface';

@Injectable()
export class CertificationsService {
  private readonly collectionName = 'certifications';
  private readonly logger = new Logger(CertificationsService.name);

  constructor(private readonly firestoreService: FirestoreService) {
    this.logger.log('CertificationsService initialized');
  }

  private parseDate(date: any): Date {
    if (date?.toDate) return date.toDate();
    if (date?.toISOString) return new Date(date);
    return new Date();
  }

  private formatCertification(doc: any): Certification {
    try {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        institution: data.institution,
        issueDate: this.parseDate(data.issueDate),
        expirationDate: data.expirationDate
          ? this.parseDate(data.expirationDate)
          : undefined,
        credentialId: data.credentialId,
        credentialUrl: data.credentialUrl,
        imageUrl: data.imageUrl,
        createdAt: this.parseDate(data.createdAt),
        updatedAt: this.parseDate(data.updatedAt),
      };
    } catch (error) {
      this.logger.error(
        `Error formatting certification: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async create(
    createDto: CreateCertificationDto,
  ): Promise<StandardResponse<Certification>> {
    this.logger.log('Creating new certification');
    try {
      const createResult =
        await this.firestoreService.createDoc<CreateCertificationDto>(
          this.collectionName,
          createDto,
        );

      if (!createResult.success || !createResult.data) {
        const errorMessage =
          createResult.message || 'Failed to create certification';
        this.logger.error(`Failed to create certification: ${errorMessage}`);
        return {
          success: false,
          message: errorMessage,
          error: createResult.error,
          statusCode: createResult.statusCode || 500,
        };
      }

      const doc = await createResult.data.get();
      const certification = this.formatCertification(doc);

      this.logger.log(`Certification created successfully with ID: ${doc.id}`);
      return {
        success: true,
        message: 'Certification created successfully',
        data: certification,
        statusCode: 201,
      };
    } catch (error) {
      this.logger.error(
        `Failed to create certification: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        message: 'Failed to create certification',
        error: error.message,
        statusCode: 500,
      };
    }
  }

  async findAll(): Promise<StandardResponse<Certification[]>> {
    this.logger.log('Fetching all certifications');
    try {
      const getResult = await this.firestoreService.getDocs<Certification>(
        this.collectionName,
      );

      if (!getResult.success || !getResult.data) {
        const errorMessage =
          getResult.message || 'Failed to fetch certifications';
        this.logger.error(`Failed to fetch certifications: ${errorMessage}`);
        return {
          success: false,
          message: errorMessage,
          error: getResult.error,
          statusCode: getResult.statusCode || 500,
        };
      }

      const certifications = getResult.data.docs.map((doc) =>
        this.formatCertification(doc),
      );
      this.logger.debug(`Found ${certifications.length} certifications`);

      return {
        success: true,
        message:
          certifications.length > 0
            ? 'Certifications retrieved successfully'
            : 'No certifications found',
        data: certifications,
        statusCode: certifications.length > 0 ? 200 : 204,
      };
    } catch (error) {
      this.logger.error(
        `Failed to fetch certifications: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        message: 'Failed to fetch certifications',
        error: error.message,
        statusCode: 500,
      };
    }
  }

  async findOne(id: string): Promise<StandardResponse<Certification>> {
    this.logger.log(`Fetching certification with ID: ${id}`);
    try {
      const getResult = await this.firestoreService.getDoc<Certification>(
        this.collectionName,
        id,
      );

      if (!getResult.success || !getResult.data) {
        const errorMessage = getResult.message || 'Certification not found';
        this.logger.warn(`Certification not found with ID: ${id}`);
        return {
          success: false,
          message: errorMessage,
          statusCode: getResult.statusCode || 404,
        };
      }

      const certification = this.formatCertification(getResult.data);
      this.logger.debug(`Found certification with ID: ${id}`);

      return {
        success: true,
        message: 'Certification retrieved successfully',
        data: certification,
        statusCode: 200,
      };
    } catch (error) {
      this.logger.error(
        `Failed to fetch certification ${id}: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        message: 'Failed to fetch certification',
        error: error.message,
        statusCode: 500,
      };
    }
  }

  async update(
    id: string,
    updateDto: UpdateCertificationDto,
  ): Promise<StandardResponse<Certification>> {
    this.logger.log(`Updating certification with ID: ${id}`);
    try {
      const findResult = await this.findOne(id);
      if (!findResult.success) {
        return findResult;
      }

      const updateResult =
        await this.firestoreService.updateDoc<UpdateCertificationDto>(
          this.collectionName,
          id,
          updateDto,
        );

      if (!updateResult.success) {
        this.logger.error(
          `Failed to update certification ${id}: ${updateResult.message}`,
        );
        return {
          success: false,
          message: updateResult.message,
          error: updateResult.error,
          statusCode: updateResult.statusCode || 500,
        };
      }

      const updatedCertification = await this.findOne(id);
      this.logger.log(`Certification ${id} updated successfully`);

      return updatedCertification;
    } catch (error) {
      this.logger.error(
        `Failed to update certification ${id}: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        message: 'Failed to update certification',
        error: error.message,
        statusCode: 500,
      };
    }
  }

  async remove(id: string): Promise<StandardResponse<void>> {
    this.logger.log(`Attempting to delete certification with ID: ${id}`);
    try {
      const findResult = await this.findOne(id);
      if (!findResult.success) {
        this.logger.warn(`Delete failed: Certification ${id} does not exist`);
        return findResult as StandardResponse;
      }

      const deleteResult = await this.firestoreService.deleteDoc(
        this.collectionName,
        id,
      );

      if (!deleteResult.success) {
        this.logger.error(
          `Failed to delete certification ${id}: ${deleteResult.message}`,
        );
        return {
          success: false,
          message: deleteResult.message,
          error: deleteResult.error,
          statusCode: deleteResult.statusCode || 500,
        };
      }

      this.logger.log(`Certification ${id} deleted successfully`);
      return {
        success: true,
        message: 'Certification deleted successfully',
        statusCode: 200,
      };
    } catch (error) {
      this.logger.error(
        `Failed to delete certification ${id}: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        message: 'Failed to delete certification',
        error: error.message,
        statusCode: 500,
      };
    }
  }

  async seedCertifications(): Promise<StandardResponse<void>> {
    this.logger.log('Seeding certifications data');
    try {
      const certifications: CreateCertificationDto[] = [
        {
          title: 'SCRUM FUNDAMENTAL CERTIFIED (SFC)',
          institution: 'SCRUMstudy',
          issueDate: new Date('2019-01-01'),
          credentialId: 'msdp-DThB',
          credentialUrl: 'https://verify.certiport.com',
          imageUrl: 'https://example.com/scrum-certificate.jpg',
        },
        {
          title: 'DATABASE ADMINISTRATION',
          institution: 'SCRUMstudy',
          issueDate: new Date('2019-01-01'),
          imageUrl: 'https://example.com/database-admin-certificate.jpg',
        },
      ];

      const operations = certifications.map((cert) => ({
        type: 'create' as const,
        collectionPath: this.collectionName,
        data: cert,
      }));

      const batchResult = await this.firestoreService.runBatch(operations);

      if (!batchResult.success) {
        this.logger.error('Batch certification creation failed');
        return batchResult;
      }

      this.logger.log('Certifications seeded successfully');
      return {
        success: true,
        message: 'Certifications seeded successfully',
        statusCode: 201,
      };
    } catch (error) {
      this.logger.error(
        `Failed to seed certifications: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        message: 'Failed to seed certifications',
        error: error.message,
        statusCode: 500,
      };
    }
  }
}
