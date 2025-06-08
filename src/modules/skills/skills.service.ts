import { FirestoreService } from 'src/firebase/firestore.service';
import {
  SkillCategory,
  SkillItem,
  Technology,
} from './interfaces/skill.interface';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

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

  async findAll(): Promise<SkillCategory> {
    this.logger.log('Fetching all skills grouped by categories');
    const cacheKey = 'grouped_skills';

    try {
      const cached = await this.cacheService.get<SkillCategory>(cacheKey);
      if (cached) {
        return cached;
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

      await this.cacheService.set(cacheKey, categories, 3600000);
      return categories as unknown as SkillCategory;
    } catch (error) {
      this.logger.error(
        `Failed to fetch skills: ${error.message}`,
        error.stack,
      );
      // Return a default value to satisfy the return type
      return {
        name: '',
        icon: '',
        skills: [],
      };
    }
  }
}
