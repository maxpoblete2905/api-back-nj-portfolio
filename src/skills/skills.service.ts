import { Injectable, Logger } from '@nestjs/common';
import { CreateSkillDto } from './dto/create-skill.dto';
import { Skill } from './interfaces/skill.interface';
import { FirestoreService } from 'src/firebase/firestore.service';
import { CacheService } from 'src/services/cache.service';
import { StandardResponse } from 'src/interface/standard-response.interface';

@Injectable()
export class SkillsService {
    private readonly collectionName = 'skills';
    private readonly logger = new Logger(SkillsService.name);

    constructor(
        private readonly firestoreService: FirestoreService,
        private readonly cacheService: CacheService
    ) {
        this.logger.log('SkillsService initialized');
    }

    private formatSkill(doc: any): Skill {
        try {
            const data = doc.data();
            const skill = {
                id: doc.id,
                title: data.title,
                description: data.description,
                icon: data.icon,
                technologies: data.technologies || [],
                createdAt: data.createdAt?.toDate?.() || new Date(),
                updatedAt: data.updatedAt?.toDate?.() || new Date(),
            };
            return skill;
        } catch (error) {
            this.logger.error(`Error formatting skill: ${error.message}`, error.stack);
            throw error;
        }
    }

    async create(createSkillDto: CreateSkillDto, id?: string): Promise<StandardResponse<Skill>> {
        this.logger.log(`Creating new skill: ${createSkillDto.title}`);
        try {
            const createResult = await this.firestoreService.createDoc<CreateSkillDto>(
                this.collectionName,
                createSkillDto,
                id
            );

            if (!createResult.success || !createResult.data) {
                const errorMessage = createResult.message || 'Failed to create skill';
                this.logger.error(`Failed to create skill: ${errorMessage}`);
                return {
                    success: false,
                    message: errorMessage,
                    error: createResult.error,
                    statusCode: createResult.statusCode || 500
                };
            }

            this.cacheService.clear();
            this.cacheService.delete('all_skills');

            const doc = await createResult.data.get();
            const skill = this.formatSkill(doc);

            this.logger.log(`Skill created successfully with ID: ${doc.id}`);
            return {
                success: true,
                message: 'Skill created successfully',
                data: skill,
                statusCode: 201
            };
        } catch (error) {
            this.logger.error(`Failed to create skill: ${error.message}`, error.stack);
            return {
                success: false,
                message: 'Failed to create skill',
                error: error.message,
                statusCode: 500
            };
        }
    }

    async findAll(): Promise<StandardResponse<Skill[]>> {
        this.logger.log('Fetching all skills');
        try {
            const getResult = await this.firestoreService.getDocs<Skill>(this.collectionName);

            if (!getResult.success || !getResult.data) {
                const errorMessage = getResult.message || 'Failed to fetch skills';
                this.logger.error(`Failed to fetch skills: ${errorMessage}`);
                return {
                    success: false,
                    message: errorMessage,
                    error: getResult.error,
                    statusCode: getResult.statusCode || 500
                };
            }

            const skills = getResult.data.docs.map(doc => this.formatSkill(doc));
            this.logger.debug(`Found ${skills.length} skills`);
            return {
                success: true,
                message: skills.length > 0
                    ? 'Skills retrieved successfully'
                    : 'No skills found',
                data: skills,
                statusCode: skills.length > 0 ? 200 : 204
            };
        } catch (error) {
            this.logger.error(`Failed to fetch skills: ${error.message}`, error.stack);
            return {
                success: false,
                message: 'Failed to fetch skills',
                error: error.message,
                statusCode: 500
            };
        }
    }

    async findOne(id: string): Promise<StandardResponse<Skill>> {
        this.logger.log(`Fetching skill with ID: ${id}`);
        try {
            const getResult = await this.firestoreService.getDoc<Skill>(this.collectionName, id);

            if (!getResult.success || !getResult.data) {
                const errorMessage = getResult.message || 'Skill not found';
                this.logger.warn(`Skill not found with ID: ${id}`);
                return {
                    success: false,
                    message: errorMessage,
                    statusCode: getResult.statusCode || 404
                };
            }

            const skill = this.formatSkill(getResult.data);
            this.logger.debug(`Found skill with ID: ${id}`);
            return {
                success: true,
                message: 'Skill retrieved successfully',
                data: skill,
                statusCode: 200
            };
        } catch (error) {
            this.logger.error(`Failed to fetch skill ${id}: ${error.message}`, error.stack);
            return {
                success: false,
                message: 'Failed to fetch skill',
                error: error.message,
                statusCode: 500
            };
        }
    }

    async update(id: string, updateSkillDto: Partial<CreateSkillDto>): Promise<StandardResponse<Skill>> {
        this.logger.log(`Updating skill with ID: ${id}`);
        try {
            const findResult = await this.findOne(id);
            if (!findResult.success) {
                return findResult;
            }

            const updateResult = await this.firestoreService.updateDoc<Partial<CreateSkillDto>>(
                this.collectionName,
                id,
                updateSkillDto
            );

            if (!updateResult.success) {
                this.logger.error(`Failed to update skill ${id}: ${updateResult.message}`);
                return {
                    success: false,
                    message: updateResult.message,
                    error: updateResult.error,
                    statusCode: updateResult.statusCode || 500
                };
            }

            this.cacheService.delete(`skill_${id}`);
            this.cacheService.delete('all_skills');

            const updatedSkill = await this.findOne(id);
            this.logger.log(`Skill ${id} updated successfully`);

            return updatedSkill;
        } catch (error) {
            this.logger.error(`Failed to update skill ${id}: ${error.message}`, error.stack);
            return {
                success: false,
                message: 'Failed to update skill',
                error: error.message,
                statusCode: 500
            };
        }
    }

    async remove(id: string): Promise<StandardResponse<void>> {
        this.logger.log(`Attempting to delete skill with ID: ${id}`);
        try {
            const findResult = await this.findOne(id);
            if (!findResult.success) {
                this.logger.warn(`Delete failed: Skill ${id} does not exist`);
                return findResult as StandardResponse;
            }

            const deleteResult = await this.firestoreService.deleteDoc(this.collectionName, id);

            if (!deleteResult.success) {
                this.logger.error(`Failed to delete skill ${id}: ${deleteResult.message}`);
                return {
                    success: false,
                    message: deleteResult.message,
                    error: deleteResult.error,
                    statusCode: deleteResult.statusCode || 500
                };
            }

            this.cacheService.delete(`skill_${id}`);
            this.cacheService.delete('all_skills');

            this.logger.log(`Skill ${id} deleted successfully`);
            return {
                success: true,
                message: 'Skill deleted successfully',
                statusCode: 200
            };
        } catch (error) {
            this.logger.error(`Failed to delete skill ${id}: ${error.message}`, error.stack);
            return {
                success: false,
                message: 'Failed to delete skill',
                error: error.message,
                statusCode: 500
            };
        }
    }

    async findByTechnology(technology: string): Promise<StandardResponse<Skill[]>> {
        this.logger.log(`Finding skills with technology: ${technology}`);
        try {
            const queryResult = await this.firestoreService.queryDocs<Skill>(
                this.collectionName,
                'technologies',
                'array-contains',
                technology
            );

            if (!queryResult.success || !queryResult.data) {
                const errorMessage = queryResult.message || 'Failed to query skills by technology';
                this.logger.error(`Failed to find skills by technology: ${errorMessage}`);
                return {
                    success: false,
                    message: errorMessage,
                    error: queryResult.error,
                    statusCode: queryResult.statusCode || 500
                };
            }

            const skills = queryResult.data.docs.map(doc => this.formatSkill(doc));
            this.logger.debug(`Found ${skills.length} skills with technology ${technology}`);
            return {
                success: true,
                message: skills.length > 0
                    ? 'Skills retrieved successfully'
                    : 'No skills found with this technology',
                data: skills,
                statusCode: skills.length > 0 ? 200 : 204
            };
        } catch (error) {
            this.logger.error(`Failed to find skills by technology: ${error.message}`, error.stack);
            return {
                success: false,
                message: 'Failed to find skills by technology',
                error: error.message,
                statusCode: 500
            };
        }
    }
}