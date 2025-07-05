export interface Technology {
  name: string;
}

export interface SkillItem {
  title: string;
  description: string;
  icon: string;
  technologies: Technology[];
}

export interface SkillCategory {
  name: string;
  icon: string;
  skills: SkillItem[];
}

export interface CreateSkillPayload {
  name: string;
  icon: string;
  skills: SkillItem[];
}
