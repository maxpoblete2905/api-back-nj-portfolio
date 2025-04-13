import { Module } from '@nestjs/common';
import { FirebaseModule } from './firebase/firebase.module';
import { ProjectsModule } from './projects/projects.module';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { SkillsModule } from './skills/skills.module';

@Module({
  imports: [
    FirebaseModule,
    ProjectsModule,
    CacheModule.register({
      ttl: 30, // Tiempo de vida en segundos (30s)
      max: 100, // Máximo número de items en caché
    }),
    SkillsModule,
  ],
})
export class AppModule { }