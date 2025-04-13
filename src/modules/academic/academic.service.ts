import { Inject, Injectable, Logger } from '@nestjs/common';
import { FirestoreService } from 'src/firebase/firestore.service';
import { Academic } from './interfaces/academic.interface';
import { CreateAcademicDto } from './dto/create-academic.dto';
import { UpdateAcademicDto } from './dto/update-academic.dto';
import { StandardResponse } from 'src/interface/standard-response.interface';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Injectable()
export class AcademicService {
    private readonly collectionName = 'academics';
    private readonly logger = new Logger(AcademicService.name);

    constructor(
        private readonly firestoreService: FirestoreService,
        @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
    ) {
        this.logger.log('AcademicService initialized');
    }

    private parseDate(date: any): Date {
        if (date?.toDate) return date.toDate();
        if (date?.toISOString) return new Date(date);
        return new Date();
    }

    private formatAcademic(doc: any): Academic {
        try {
            const data = doc.data();
            return {
                id: doc.id,
                degree: data.degree,
                institution: data.institution,
                period: {
                    start: this.parseDate(data.period.start),
                    end: this.parseDate(data.period.end),
                    current: data.period.current || false
                },
                description: data.description,
                createdAt: this.parseDate(data.createdAt),
                updatedAt: this.parseDate(data.updatedAt),
            };
        } catch (error) {
            this.logger.error(`Error formatting academic record: ${error.message}`, error.stack);
            throw error;
        }
    }

    private prepareAcademicData(dto: CreateAcademicDto | UpdateAcademicDto) {
        // Asegurarnos de que period tenga valores por defecto si es undefined
        const period = dto.period ? {
            start: new Date(dto.period.start),
            end: new Date(dto.period.end),
            current: dto.period.current ?? false
        } : {
            start: new Date(),
            end: new Date(),
            current: false
        };

        return {
            ...dto,
            period, // Usamos el period que acabamos de definir
            ...(dto instanceof CreateAcademicDto ? {
                createdAt: new Date(),
                updatedAt: new Date()
            } : {
                updatedAt: new Date()
            })
        };
    }

    async create(createDto: CreateAcademicDto): Promise<StandardResponse<Academic>> {
        this.logger.log('Creating new academic record');
        try {
            const academicData = this.prepareAcademicData(createDto);

            const createResult = await this.firestoreService.createDoc(
                this.collectionName,
                academicData
            );

            if (!createResult.success || !createResult.data) {
                const errorMessage = createResult.message || 'Failed to create academic record';
                this.logger.error(`Failed to create academic record: ${errorMessage}`);
                return {
                    success: false,
                    message: errorMessage,
                    error: createResult.error,
                    statusCode: createResult.statusCode || 500
                };
            }

            this.cacheService.del('all_academics');
            const doc = await createResult.data.get();
            const academic = this.formatAcademic(doc);

            this.logger.log(`Academic record created successfully with ID: ${doc.id}`);
            return {
                success: true,
                message: 'Academic record created successfully',
                data: academic,
                statusCode: 201
            };
        } catch (error) {
            this.logger.error(`Failed to create academic record: ${error.message}`, error.stack);
            return {
                success: false,
                message: 'Failed to create academic record',
                error: error.message,
                statusCode: 500
            };
        }
    }

    async findAll(): Promise<StandardResponse<Academic[]>> {
        this.logger.log('Fetching all academic records');
        try {
            const getResult = await this.firestoreService.getDocs<Academic>(this.collectionName);

            if (!getResult.success || !getResult.data) {
                const errorMessage = getResult.message || 'Failed to fetch academic records';
                this.logger.error(`Failed to fetch academic records: ${errorMessage}`);
                return {
                    success: false,
                    message: errorMessage,
                    error: getResult.error,
                    statusCode: getResult.statusCode || 500
                };
            }

            const academics = getResult.data.docs.map(doc => this.formatAcademic(doc));
            this.logger.debug(`Found ${academics.length} academic records`);

            return {
                success: true,
                message: academics.length > 0
                    ? 'Academic records retrieved successfully'
                    : 'No academic records found',
                data: academics,
                statusCode: academics.length > 0 ? 200 : 204
            };
        } catch (error) {
            this.logger.error(`Failed to fetch academic records: ${error.message}`, error.stack);
            return {
                success: false,
                message: 'Failed to fetch academic records',
                error: error.message,
                statusCode: 500
            };
        }
    }

    async findOne(id: string): Promise<StandardResponse<Academic>> {
        this.logger.log(`Fetching academic record with ID: ${id}`);
        try {
            const getResult = await this.firestoreService.getDoc<Academic>(this.collectionName, id);

            if (!getResult.success || !getResult.data) {
                const errorMessage = getResult.message || 'Academic record not found';
                this.logger.warn(`Academic record not found with ID: ${id}`);
                return {
                    success: false,
                    message: errorMessage,
                    statusCode: getResult.statusCode || 404
                };
            }

            const academic = this.formatAcademic(getResult.data);
            this.logger.debug(`Found academic record with ID: ${id}`);

            return {
                success: true,
                message: 'Academic record retrieved successfully',
                data: academic,
                statusCode: 200
            };
        } catch (error) {
            this.logger.error(`Failed to fetch academic record ${id}: ${error.message}`, error.stack);
            return {
                success: false,
                message: 'Failed to fetch academic record',
                error: error.message,
                statusCode: 500
            };
        }
    }

    async update(id: string, updateDto: UpdateAcademicDto): Promise<StandardResponse<Academic>> {
        this.logger.log(`Updating academic record with ID: ${id}`);
        try {
            const findResult = await this.findOne(id);
            if (!findResult.success) {
                return findResult;
            }

            const updateData = this.prepareAcademicData(updateDto);

            const updateResult = await this.firestoreService.updateDoc(
                this.collectionName,
                id,
                updateData
            );

            if (!updateResult.success) {
                this.logger.error(`Failed to update academic record ${id}: ${updateResult.message}`);
                return {
                    success: false,
                    message: updateResult.message,
                    error: updateResult.error,
                    statusCode: updateResult.statusCode || 500
                };
            }

            this.cacheService.del(`academic_${id}`);
            this.cacheService.del('all_academics');

            const updatedDoc = await this.firestoreService.getDoc(this.collectionName, id);
            const academic = this.formatAcademic(updatedDoc);

            this.logger.log(`Academic record ${id} updated successfully`);
            return {
                success: true,
                message: 'Academic record updated successfully',
                data: academic,
                statusCode: 200
            };
        } catch (error) {
            this.logger.error(`Failed to update academic record ${id}: ${error.message}`, error.stack);
            return {
                success: false,
                message: 'Failed to update academic record',
                error: error.message,
                statusCode: 500
            };
        }
    }

    async remove(id: string): Promise<StandardResponse<void>> {
        this.logger.log(`Attempting to delete academic record with ID: ${id}`);
        try {
            const findResult = await this.findOne(id);
            if (!findResult.success) {
                this.logger.warn(`Delete failed: Academic record ${id} does not exist`);
                return findResult as StandardResponse;
            }

            const deleteResult = await this.firestoreService.deleteDoc(this.collectionName, id);

            if (!deleteResult.success) {
                this.logger.error(`Failed to delete academic record ${id}: ${deleteResult.message}`);
                return {
                    success: false,
                    message: deleteResult.message,
                    error: deleteResult.error,
                    statusCode: deleteResult.statusCode || 500
                };
            }

            this.cacheService.del(`academic_${id}`);
            this.cacheService.del('all_academics');

            this.logger.log(`Academic record ${id} deleted successfully`);
            return {
                success: true,
                message: 'Academic record deleted successfully',
                statusCode: 200
            };
        } catch (error) {
            this.logger.error(`Failed to delete academic record ${id}: ${error.message}`, error.stack);
            return {
                success: false,
                message: 'Failed to delete academic record',
                error: error.message,
                statusCode: 500
            };
        }
    }

    async seedInitialData(): Promise<StandardResponse<void>> {
        this.logger.log('Seeding initial academic data');
        try {
            const initialData: CreateAcademicDto[] = [
                {
                    degree: "Programador Computacional",
                    institution: "Instituto Profesional AIEP",
                    period: {
                        start: "2016-01-01",
                        end: "2018-12-31",
                        current: false
                    },
                    description: "Especialización en desarrollo de software y sistemas de información."
                },
                {
                    degree: "Análisis de Sistemas",
                    institution: "Instituto Profesional AIEP",
                    period: {
                        start: "2019-01-01",
                        end: "2020-12-31",
                        current: false
                    },
                    description: "Especialización en análisis de sistemas."
                }
            ];

            for (const data of initialData) {
                await this.create(data);
            }

            return {
                success: true,
                message: 'Academic records seeded successfully',
                statusCode: 201
            };
        } catch (error) {
            this.logger.error(`Failed to seed academic data: ${error.message}`, error.stack);
            return {
                success: false,
                message: 'Failed to seed academic data',
                error: error.message,
                statusCode: 500
            };
        }
    }
}