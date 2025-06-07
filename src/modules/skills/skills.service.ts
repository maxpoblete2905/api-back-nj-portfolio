import { FirestoreService } from 'src/firebase/firestore.service';
import {
  GroupedSkills,
  SkillItem,
  Technology,
} from './interfaces/skill.interface';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { StandardResponse } from 'src/interface/standard-response.interface';

@Injectable()
export class SkillsService {
  private readonly collection = 'skills-tech';
  private readonly logger = new Logger(SkillsService.name);

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
    private readonly firestoreService: FirestoreService,
  ) {
    this.logger.log('SkillsService initialized');
  }

  private formatTechnologies(techs: string[]): Technology[] {
    return techs.map((t) => ({ name: t }));
  }

  private formatSkill(skill: any): SkillItem {
    return {
      title: skill.title,
      description: skill.description,
      icon: skill.icon,
      technologies: this.formatTechnologies(skill.technologies || []),
    };
  }

  async findAll(): Promise<StandardResponse<GroupedSkills>> {
    this.logger.log('Fetching all skills grouped by categories');
    const cacheKey = 'grouped_skills';

    try {
      const cached = await this.cacheService.get<GroupedSkills>(cacheKey);
      if (cached) {
        return {
          success: true,
          message: 'Skills retrieved from cache',
          data: cached,
          statusCode: 200,
        };
      }

      const result = await this.firestoreService.getDocs(this.collection);
      if (!result.success || !result.data?.docs) {
        throw new Error(result.message || 'No data found');
      }

      const categories = result.data.docs.map((doc: any) => {
        const data = doc.data();
        const formattedSkills = (data.skills || []).map((s: any) =>
          this.formatSkill(s),
        );

        return {
          name: data.name,
          icon: data.icon,
          skills: formattedSkills,
        };
      });

      const groupedSkills: GroupedSkills = {
        categories,
        lastUpdated: new Date(),
      };

      await this.cacheService.set(cacheKey, groupedSkills, 3600000);

      return {
        success: true,
        message: 'Skills retrieved successfully',
        data: groupedSkills,
        statusCode: 200,
      };
    } catch (error) {
      this.logger.error(
        `Failed to fetch skills: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        message: 'Failed to fetch skills',
        error: error.message,
        statusCode: 500,
      };
    }
  }
}
