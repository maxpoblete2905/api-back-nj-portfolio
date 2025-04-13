import { Inject, Injectable, Logger } from '@nestjs/common';
import { FirestoreService } from 'src/firebase/firestore.service';
import { PersonalInformation } from './interfaces/personal-info.interface';
import { CreatePersonalInfoDto } from './dto/create-personal-info.dto';
import { UpdatePersonalInfoDto } from './dto/update-personal-info.dto';
import { StandardResponse } from 'src/interface/standard-response.interface';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Injectable()
export class PersonalInfoService {
    private readonly collectionName = 'personal-information';
    private readonly logger = new Logger(PersonalInfoService.name);

    constructor(
        private readonly firestoreService: FirestoreService,
        @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
    ) {
        this.logger.log('PersonalInfoService initialized');
    }

    private parseDate(date: any): Date {
        if (date?.toDate) return date.toDate();
        if (date?.toISOString) return new Date(date);
        return new Date();
    }

    private formatPersonalInfo(doc: any): PersonalInformation {
        try {
            const data = doc.data();
            return {
                id: doc.id,
                description: data.description,
                descriptionPosition: data.descriptionPosition,
                name: data.name,
                university_title: data.university_title,
                update: this.parseDate(data.update),
                createdAt: this.parseDate(data.createdAt),
                updatedAt: this.parseDate(data.updatedAt),
            };
        } catch (error) {
            this.logger.error(`Error formatting personal info: ${error.message}`, error.stack);
            throw error;
        }
    }

    async create(createDto: CreatePersonalInfoDto): Promise<StandardResponse<PersonalInformation>> {
        this.logger.log('Creating new personal information');
        try {
            const createResult = await this.firestoreService.createDoc<CreatePersonalInfoDto>(
                this.collectionName,
                createDto
            );

            if (!createResult.success || !createResult.data) {
                const errorMessage = createResult.message || 'Failed to create personal info';
                this.logger.error(`Failed to create personal info: ${errorMessage}`);
                return {
                    success: false,
                    message: errorMessage,
                    error: createResult.error,
                    statusCode: createResult.statusCode || 500
                };
            }

            this.cacheService.del('personal_info');
            const doc = await createResult.data.get();
            const personalInfo = this.formatPersonalInfo(doc);

            this.logger.log(`Personal info created successfully with ID: ${doc.id}`);
            return {
                success: true,
                message: 'Personal information created successfully',
                data: personalInfo,
                statusCode: 201
            };
        } catch (error) {
            this.logger.error(`Failed to create personal info: ${error.message}`, error.stack);
            return {
                success: false,
                message: 'Failed to create personal information',
                error: error.message,
                statusCode: 500
            };
        }
    }

    async findAll(): Promise<StandardResponse<PersonalInformation[]>> {
        this.logger.log('Fetching all personal information');
        try {
            const getResult = await this.firestoreService.getDocs<PersonalInformation>(this.collectionName);

            if (!getResult.success || !getResult.data) {
                const errorMessage = getResult.message || 'Failed to fetch personal info';
                this.logger.error(`Failed to fetch personal info: ${errorMessage}`);
                return {
                    success: false,
                    message: errorMessage,
                    error: getResult.error,
                    statusCode: getResult.statusCode || 500
                };
            }

            const personalInfoList = getResult.data.docs.map(doc => this.formatPersonalInfo(doc));
            this.logger.debug(`Found ${personalInfoList.length} personal info records`);

            return {
                success: true,
                message: personalInfoList.length > 0
                    ? 'Personal information retrieved successfully'
                    : 'No personal information found',
                data: personalInfoList,
                statusCode: personalInfoList.length > 0 ? 200 : 204
            };
        } catch (error) {
            this.logger.error(`Failed to fetch personal info: ${error.message}`, error.stack);
            return {
                success: false,
                message: 'Failed to fetch personal information',
                error: error.message,
                statusCode: 500
            };
        }
    }

    async findOne(id: string): Promise<StandardResponse<PersonalInformation>> {
        this.logger.log(`Fetching personal info with ID: ${id}`);
        try {
            const getResult = await this.firestoreService.getDoc<PersonalInformation>(this.collectionName, id);

            if (!getResult.success || !getResult.data) {
                const errorMessage = getResult.message || 'Personal info not found';
                this.logger.warn(`Personal info not found with ID: ${id}`);
                return {
                    success: false,
                    message: errorMessage,
                    statusCode: getResult.statusCode || 404
                };
            }

            const personalInfo = this.formatPersonalInfo(getResult.data);
            this.logger.debug(`Found personal info with ID: ${id}`);

            return {
                success: true,
                message: 'Personal information retrieved successfully',
                data: personalInfo,
                statusCode: 200
            };
        } catch (error) {
            this.logger.error(`Failed to fetch personal info ${id}: ${error.message}`, error.stack);
            return {
                success: false,
                message: 'Failed to fetch personal information',
                error: error.message,
                statusCode: 500
            };
        }
    }

    async update(id: string, updateDto: UpdatePersonalInfoDto): Promise<StandardResponse<PersonalInformation>> {
        this.logger.log(`Updating personal info with ID: ${id}`);
        try {
            const findResult = await this.findOne(id);
            if (!findResult.success) {
                return findResult;
            }

            const updateResult = await this.firestoreService.updateDoc<UpdatePersonalInfoDto>(
                this.collectionName,
                id,
                updateDto
            );

            if (!updateResult.success) {
                this.logger.error(`Failed to update personal info ${id}: ${updateResult.message}`);
                return {
                    success: false,
                    message: updateResult.message,
                    error: updateResult.error,
                    statusCode: updateResult.statusCode || 500
                };
            }

            this.cacheService.del(`personal_info_${id}`);
            this.cacheService.del('personal_info');

            const updatedInfo = await this.findOne(id);
            this.logger.log(`Personal info ${id} updated successfully`);

            return updatedInfo;
        } catch (error) {
            this.logger.error(`Failed to update personal info ${id}: ${error.message}`, error.stack);
            return {
                success: false,
                message: 'Failed to update personal information',
                error: error.message,
                statusCode: 500
            };
        }
    }

    async remove(id: string): Promise<StandardResponse<void>> {
        this.logger.log(`Attempting to delete personal info with ID: ${id}`);
        try {
            const findResult = await this.findOne(id);
            if (!findResult.success) {
                this.logger.warn(`Delete failed: Personal info ${id} does not exist`);
                return findResult as StandardResponse;
            }

            const deleteResult = await this.firestoreService.deleteDoc(this.collectionName, id);

            if (!deleteResult.success) {
                this.logger.error(`Failed to delete personal info ${id}: ${deleteResult.message}`);
                return {
                    success: false,
                    message: deleteResult.message,
                    error: deleteResult.error,
                    statusCode: deleteResult.statusCode || 500
                };
            }

            this.cacheService.del(`personal_info_${id}`);
            this.cacheService.del('personal_info');

            this.logger.log(`Personal info ${id} deleted successfully`);
            return {
                success: true,
                message: 'Personal information deleted successfully',
                statusCode: 200
            };
        } catch (error) {
            this.logger.error(`Failed to delete personal info ${id}: ${error.message}`, error.stack);
            return {
                success: false,
                message: 'Failed to delete personal information',
                error: error.message,
                statusCode: 500
            };
        }
    }
}