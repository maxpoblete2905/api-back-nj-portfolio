import { Module } from '@nestjs/common';
import { FirebaseModule } from './firebase/firebase.module';
import { CacheModule } from '@nestjs/cache-manager';
import { PersonalInformationModule } from './modules/personal-information/personal-information.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { SkillsModule } from './modules/skills/skills.module';
import { TechnologiesModule } from './modules/technologies/technologies.module';
import { AcademicModule } from './modules/academic/academic.module';
import { CertificationsModule } from './modules/certifications/certifications.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { MailModule } from './mail/mail.module';
import { HealthController } from './health.controller';
import { CacheController } from './cache.controller';
import * as memoryStore from 'cache-manager-memory-store';

@Module({
  imports: [
    FirebaseModule,
    ProjectsModule,
    CacheModule.register({
      isGlobal: true,
      store: memoryStore,
      ttl: 30, // Tiempo de vida en segundos
      max: 100, // Máximo número de elementos
    }),
    SkillsModule,
    PersonalInformationModule,
    TechnologiesModule,
    AcademicModule,
    CertificationsModule,
    ContactsModule,
    MailModule,
  ],
  controllers: [HealthController, CacheController],
})
export class AppModule {}
