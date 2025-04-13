import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsDateString, IsBoolean, IsOptional } from 'class-validator';

class AcademicPeriodDto {
    @ApiProperty({ example: '2020-01-01', description: 'Start date of the academic period' })
    @IsDateString()
    @IsNotEmpty()
    start: string;

    @ApiProperty({ example: '2022-12-31', description: 'End date of the academic period' })
    @IsDateString()
    @IsNotEmpty()
    end: string;

    @ApiProperty({ required: false, description: 'Is this the current period?' })
    @IsBoolean()
    @IsOptional()
    current?: boolean;
}

export class CreateAcademicDto {
    @ApiProperty({ example: 'Computer Science', description: 'Degree title' })
    @IsString()
    @IsNotEmpty()
    degree: string;

    @ApiProperty({ example: 'University of Technology', description: 'Institution name' })
    @IsString()
    @IsNotEmpty()
    institution: string;

    @ApiProperty({ type: AcademicPeriodDto, description: 'Academic period dates' })
    @IsNotEmpty()
    period: AcademicPeriodDto;

    @ApiProperty({ example: 'Specialized in software development', description: 'Detailed description' })
    @IsString()
    @IsNotEmpty()
    description: string;
}