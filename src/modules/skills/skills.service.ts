import { FirestoreService } from 'src/firebase/firestore.service';
import {
  SkillCategory,
  SkillItem,
  Technology,
} from './interfaces/skill.interface';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SkillsService {
  private readonly collection = 'skills-tech';
  private readonly logger = new Logger(SkillsService.name);

  constructor(private readonly firestoreService: FirestoreService) {
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

    try {
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

      return categories as unknown as SkillCategory;
    } catch (error) {
      this.logger.error(
        `Failed to fetch skills: ${error.message}`,
        error.stack,
      );
      return {
        name: '',
        icon: '',
        skills: [],
      };
    }
  }

  async create(createSkillDto: any): Promise<void> {
    this.logger.log('Creating new skill category or adding skills');
    try {
      await this.firestoreService.createDoc(this.collection, createSkillDto);
      this.logger.log('Skill operation completed successfully');
    } catch (error) {
      this.logger.error(
        `Failed to create/update skill: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
