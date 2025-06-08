// src/skills/skills.module.ts
import { Module } from '@nestjs/common';
import { SkillsController } from './skills.controller';
import { SkillsService } from './skills.service';
import { FirestoreService } from 'src/firebase/firestore.service';
import { FirebaseModule } from 'src/firebase/firebase.module';

@Module({
  imports: [FirebaseModule],
  providers: [SkillsService, FirestoreService],
  controllers: [SkillsController],
})
export class SkillsModule {}
