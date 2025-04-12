import { Module } from '@nestjs/common';
import { FirebaseModule } from './firebase/firebase.module';
import { ProjectsModule } from './projects/projects.module';

@Module({
  imports: [
    FirebaseModule,
    ProjectsModule,
  ],
})
export class AppModule { }