import { Module } from '@nestjs/common';
import { TechnologiesService } from './technologies.service';
import { TechnologiesController } from './technologies.controller';
import { FirestoreService } from 'src/firebase/firestore.service';
import { CacheService } from 'src/services/cache.service';
import { CacheModule } from '@nestjs/cache-manager';
import { FirebaseModule } from 'src/firebase/firebase.module';

@Module({
  imports: [FirebaseModule, CacheModule.register()],
  controllers: [TechnologiesController],
  providers: [TechnologiesService, FirestoreService, CacheService],
  exports: [TechnologiesService],
})
export class TechnologiesModule { }