import { Module } from '@nestjs/common';
import { FirebaseModule } from './firebase/firebase.module';
import { CacheModule } from '@nestjs/cache-manager';
import { PersonalInformationModule } from './modules/personal-information/personal-information.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { SkillsModule } from './modules/skills/skills.module';
import { TechnologiesModule } from './modules/technologies/technologies.module';
import { AcademicModule } from './modules/academic/academic.module';


@Module({
  imports: [
    FirebaseModule,
    ProjectsModule,
    CacheModule.register({
      ttl: 30, // Tiempo de vida en segundos (30s)
      max: 100, // Máximo número de items en caché
    }),
    SkillsModule,
    PersonalInformationModule,
    TechnologiesModule,
    AcademicModule,
  ],
})
export class AppModule { }