import { Module } from '@nestjs/common';
import { AcademicService } from './academic.service';
import { AcademicController } from './academic.controller';
import { FirestoreService } from 'src/firebase/firestore.service';
import { CacheModule } from '@nestjs/cache-manager';
import { FirebaseModule } from 'src/firebase/firebase.module';

@Module({
    imports: [FirebaseModule, CacheModule.register()],
    controllers: [AcademicController],
    providers: [AcademicService, FirestoreService],
    exports: [AcademicService],
})
export class AcademicModule { }