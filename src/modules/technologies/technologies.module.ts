import { Module } from '@nestjs/common';
import { TechnologiesService } from './technologies.service';
import { TechnologiesController } from './technologies.controller';
import { FirestoreService } from 'src/firebase/firestore.service';
import { FirebaseModule } from 'src/firebase/firebase.module';

@Module({
  imports: [FirebaseModule],
  controllers: [TechnologiesController],
  providers: [TechnologiesService, FirestoreService],
  exports: [TechnologiesService],
})
export class TechnologiesModule { }