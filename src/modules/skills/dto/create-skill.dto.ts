import { ApiProperty } from '@nestjs/swagger';

export class TechnologyDto {
  @ApiProperty()
  name: string;
}

export class SkillItemDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  icon: string;

  @ApiProperty({ type: [TechnologyDto] })
  technologies: TechnologyDto[];
}

export class SkillCategoryDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  icon: string;

  @ApiProperty({ type: [SkillItemDto] })
  skills: SkillItemDto[];
}

export class GroupedSkillsDto {
  @ApiProperty({ type: [SkillCategoryDto] })
  categories: SkillCategoryDto[];

  @ApiProperty()
  lastUpdated: Date;
}
