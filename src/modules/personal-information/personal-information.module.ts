import { Module } from '@nestjs/common';
import { PersonalInfoController } from './personal-information.controller';
import { PersonalInfoService } from './personal-information.service';
import { FirebaseModule } from 'src/firebase/firebase.module';

@Module({
  imports: [FirebaseModule],
  controllers: [PersonalInfoController],
  providers: [PersonalInfoService],
})
export class PersonalInformationModule {}
