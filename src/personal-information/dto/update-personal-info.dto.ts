// src/personal-information/dto/update-personal-info.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreatePersonalInfoDto } from './create-personal-info.dto';

export class UpdatePersonalInfoDto extends PartialType(CreatePersonalInfoDto) { }