import { Module } from '@nestjs/common';
import { FirebaseModule } from './firebase/firebase.module';
import { ProjectsModule } from './projects/projects.module';
import { CacheModule } from '@nestjs/cache-manager';
import { SkillsModule } from './skills/skills.module';
import { PersonalInformationModule } from './personal-information/personal-information.module';
import { TechnologiesModule } from './technologies/technologies.module';

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
  ],
})
export class AppModule { }