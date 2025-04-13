import { Module } from '@nestjs/common';
import { PersonalInfoController } from './personal-information.controller';
import { PersonalInfoService } from './personal-information.service';
import { CacheModule } from '@nestjs/cache-manager';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { CacheService } from 'src/services/cache.service';

@Module({
  imports: [FirebaseModule, CacheModule.register()],
  controllers: [PersonalInfoController],
  providers: [PersonalInfoService, CacheService]
})
export class PersonalInformationModule { }
