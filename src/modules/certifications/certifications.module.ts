import { Module } from '@nestjs/common';
import { CertificationsController } from './certifications.controller';
import { CertificationsService } from './certifications.service';
import { FirebaseModule } from 'src/firebase/firebase.module';

@Module({
  imports: [FirebaseModule],
  controllers: [CertificationsController],
  providers: [CertificationsService]
})
export class CertificationsModule { }
