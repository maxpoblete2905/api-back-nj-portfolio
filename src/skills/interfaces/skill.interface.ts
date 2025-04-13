// src/skills/interfaces/skill.interface.ts
export interface Skill {
    id: string;
    title: string;
    description: string;
    icon: string;
    technologies: string[];
    createdAt?: Date;
    updatedAt?: Date;
}