import { Module } from '@nestjs/common';
import { FirebaseModule } from './firebase/firebase.module';
import { PersonalInformationModule } from './modules/personal-information/personal-information.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { SkillsModule } from './modules/skills/skills.module';
import { TechnologiesModule } from './modules/technologies/technologies.module';
import { AcademicModule } from './modules/academic/academic.module';
import { CertificationsModule } from './modules/certifications/certifications.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { MailModule } from './mail/mail.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    FirebaseModule,
    ProjectsModule,
    SkillsModule,
    PersonalInformationModule,
    TechnologiesModule,
    AcademicModule,
    CertificationsModule,
    ContactsModule,
    MailModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
