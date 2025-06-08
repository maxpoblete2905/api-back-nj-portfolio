import { Module } from '@nestjs/common';
import { AcademicService } from './academic.service';
import { AcademicController } from './academic.controller';
import { FirestoreService } from 'src/firebase/firestore.service';
import { FirebaseModule } from 'src/firebase/firebase.module';

@Module({
    imports: [FirebaseModule],
    controllers: [AcademicController],
    providers: [AcademicService, FirestoreService],
    exports: [AcademicService],
})
export class AcademicModule { }