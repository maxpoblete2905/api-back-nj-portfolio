import { Injectable, Logger } from '@nestjs/common';
import { Project } from './entities/project.entity';
import { FirestoreService } from 'src/firebase/services/firestore/firestore.service';
import { CacheService } from 'src/services/cache.service';

interface StandardResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
  statusCode?: number;
}

@Injectable()
export class ProjectsService {
  private readonly collectionName = 'projects';
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    private readonly firestoreService: FirestoreService,
    private readonly cacheService: CacheService
  ) {
    this.logger.log('ProjectsService initialized');
  }

  private parseDate = (date: any): Date => {
    if (date?.toDate) return date.toDate();
    if (date?.toISOString) return new Date(date);
    return new Date();
  };

  private formatProject(doc: any): Project {
    try {
      const data = doc.data();
      const project = {
        id: doc.id,
        client: data.client,
        companyName: data.companyName,
        completedProfile: data.completedProfile,
        creationDate: this.parseDate(data.creationDate),
        description: data.description,
        imageUrl: data.imageUrl,
        position: data.position,
        state: data.state,
        technologies: data.technologies || [],
        title: data.title,
        views: data.views || [],
        createdAt: this.parseDate(data.createdAt),
        updatedAt: this.parseDate(data.updatedAt),
      };
      return project;
    } catch (error) {
      this.logger.error(`Error formatting project: ${error.message}`, error.stack);
      throw error;
    }
  }

  async create(createProjectDto: Omit<Project, 'id'>): Promise<StandardResponse<Project>> {
    this.logger.log(`Creating new project for client: ${createProjectDto}`);
    try {
      const createResult = await this.firestoreService.createDoc<Omit<Project, 'id'>>(
        this.collectionName,
        createProjectDto
      );

      if (!createResult.success || !createResult.data) {
        const errorMessage = createResult.message || 'Failed to create project';
        this.logger.error(`Failed to create project: ${errorMessage}`);
        return {
          success: false,
          message: errorMessage,
          error: createResult.error,
          statusCode: createResult.statusCode || 500
        };
      }
      this.cacheService.resetCache()
      this.cacheService.deleteKey(`all_project`)
      const doc = await createResult.data.get();
      const project = this.formatProject(doc);

      this.logger.log(`Project created successfully with ID: ${doc.id}`);
      return {
        success: true,
        message: 'Project created successfully',
        data: project,
        statusCode: 201
      };
    } catch (error) {
      this.logger.error(`Failed to create project: ${error.message}`, error.stack);
      return {
        success: false,
        message: 'Failed to create project',
        error: error.message,
        statusCode: 500
      };
    }
  }

  async findAll(): Promise<StandardResponse<Project[]>> {
    this.logger.log('Fetching all projects');
    try {
      const getResult = await this.firestoreService.getDocs<Project>(this.collectionName);

      if (!getResult.success || !getResult.data) {
        const errorMessage = getResult.message || 'Failed to fetch projects';
        this.logger.error(`Failed to fetch projects: ${errorMessage}`);
        return {
          success: false,
          message: errorMessage,
          error: getResult.error,
          statusCode: getResult.statusCode || 500
        };
      }

      const projects = getResult.data.docs.map(doc => this.formatProject(doc));
      this.logger.debug(`Found ${projects.length} projects`);

      return {
        success: true,
        message: projects.length > 0
          ? 'Projects retrieved successfully'
          : 'No projects found',
        data: projects,
        statusCode: projects.length > 0 ? 200 : 204
      };
    } catch (error) {
      this.logger.error(`Failed to fetch projects: ${error.message}`, error.stack);
      return {
        success: false,
        message: 'Failed to fetch projects',
        error: error.message,
        statusCode: 500
      };
    }
  }

  async findOne(id: string): Promise<StandardResponse<Project>> {
    this.logger.log(`Fetching project with ID: ${id}`);
    try {
      const getResult = await this.firestoreService.getDoc<Project>(this.collectionName, id);

      if (!getResult.success || !getResult.data) {
        const errorMessage = getResult.message || 'Project not found';
        this.logger.warn(`Project not found with ID: ${id}`);
        return {
          success: false,
          message: errorMessage,
          statusCode: getResult.statusCode || 404
        };
      }

      const project = this.formatProject(getResult.data);
      this.logger.debug(`Found project with ID: ${id}`);

      return {
        success: true,
        message: 'Project retrieved successfully',
        data: project,
        statusCode: 200
      };
    } catch (error) {
      this.logger.error(`Failed to fetch project ${id}: ${error.message}`, error.stack);
      return {
        success: false,
        message: 'Failed to fetch project',
        error: error.message,
        statusCode: 500
      };
    }
  }

  async update(id: string, updateProjectDto: Partial<Project>): Promise<StandardResponse<Project>> {
    this.logger.log(`Updating project with ID: ${id}`);
    try {
      const findResult = await this.findOne(id);
      if (!findResult.success) {
        return findResult;
      }

      const updateResult = await this.firestoreService.updateDoc<Partial<Project>>(
        this.collectionName,
        id,
        updateProjectDto
      );

      if (!updateResult.success) {
        this.logger.error(`Failed to update project ${id}: ${updateResult.message}`);
        return {
          success: false,
          message: updateResult.message,
          error: updateResult.error,
          statusCode: updateResult.statusCode || 500
        };
      }

      this.cacheService.deleteKey(`project_${id}`)
      const updatedProject = await this.findOne(id);
      this.logger.log(`Project ${id} updated successfully`);

      return updatedProject;
    } catch (error) {
      this.logger.error(`Failed to update project ${id}: ${error.message}`, error.stack);
      return {
        success: false,
        message: 'Failed to update project',
        error: error.message,
        statusCode: 500
      };
    }
  }

  async remove(id: string): Promise<StandardResponse<void>> {
    this.logger.log(`Attempting to delete project with ID: ${id}`);
    try {
      const findResult = await this.findOne(id);
      if (!findResult.success) {
        this.logger.warn(`Delete failed: Project ${id} does not exist`);
        return findResult as StandardResponse;
      }

      const deleteResult = await this.firestoreService.deleteDoc(this.collectionName, id);

      if (!deleteResult.success) {
        this.logger.error(`Failed to delete project ${id}: ${deleteResult.message}`);
        return {
          success: false,
          message: deleteResult.message,
          error: deleteResult.error,
          statusCode: deleteResult.statusCode || 500
        };
      }

      this.logger.log(`Project ${id} deleted successfully`);
      return {
        success: true,
        message: 'Project deleted successfully',
        statusCode: 200
      };
    } catch (error) {
      this.logger.error(`Failed to delete project ${id}: ${error.message}`, error.stack);
      return {
        success: false,
        message: 'Failed to delete project',
        error: error.message,
        statusCode: 500
      };
    }
  }

  async batchCreateProjects(projects: Omit<Project, 'id'>[]): Promise<StandardResponse<void>> {
    this.logger.log(`Starting batch creation of ${projects.length} projects`);
    try {
      const operations = projects.map(project => ({
        type: 'create' as const,
        collectionPath: this.collectionName,
        data: project,
      }));

      const batchResult = await this.firestoreService.runBatch(operations);

      if (!batchResult.success) {
        this.logger.error(`Batch creation failed: ${batchResult.message}`);
        return batchResult;
      }

      this.logger.log(`Batch creation completed successfully for ${projects.length} projects`);
      return {
        success: true,
        message: `Successfully created ${projects.length} projects`,
        statusCode: 201
      };
    } catch (error) {
      this.logger.error(`Failed batch creation: ${error.message}`, error.stack);
      return {
        success: false,
        message: 'Failed to create projects',
        error: error.message,
        statusCode: 500
      };
    }
  }
}