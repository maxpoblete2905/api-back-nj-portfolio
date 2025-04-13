// src/skills/skills.module.ts
import { Module } from '@nestjs/common';
import { SkillsController } from './skills.controller';
import { SkillsService } from './skills.service';
import { FirestoreService } from 'src/firebase/firestore.service';
import { CacheModule } from '@nestjs/cache-manager';
import { FirebaseModule } from 'src/firebase/firebase.module';

@Module({
  imports: [FirebaseModule, CacheModule.register()],
  controllers: [SkillsController],
  providers: [SkillsService, FirestoreService],
})
export class SkillsModule { }