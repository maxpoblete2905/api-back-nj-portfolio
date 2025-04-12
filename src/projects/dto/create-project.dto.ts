import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDate, IsNotEmpty, IsString, IsUrl, ValidateNested } from 'class-validator';

class ProjectViewDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty()
    @IsUrl()
    @IsNotEmpty()
    src: string;
}

export class CreateProjectDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    client: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    companyName: string;

    @ApiProperty()
    @IsBoolean()
    completedProfile: boolean;

    @ApiProperty()
    @IsDate()
    @Type(() => Date)
    creationDate: Date;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty()
    @IsUrl()
    @IsNotEmpty()
    imageUrl: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    position: string;

    @ApiProperty()
    @IsBoolean()
    state: boolean;

    @ApiProperty({ type: [String] })
    @IsArray()
    @IsString({ each: true })
    technologies: string[];

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ type: [ProjectViewDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProjectViewDto)
    views: ProjectViewDto[];
}