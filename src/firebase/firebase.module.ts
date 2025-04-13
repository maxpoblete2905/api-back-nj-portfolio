import { Module } from '@nestjs/common';
import { FirebaseConfig } from 'src/firebase.config';
import { FirestoreService } from './firestore.service';

@Module({
  providers: [FirebaseConfig, FirestoreService],
  exports: [FirebaseConfig, FirestoreService],
})
export class FirebaseModule { }