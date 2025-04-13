import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { CacheModule } from '@nestjs/cache-manager';
import { FirebaseModule } from 'src/firebase/firebase.module';

@Module({
  imports: [FirebaseModule, CacheModule.register()],
  controllers: [ProjectsController],
  providers: [ProjectsService],
})
export class ProjectsModule { }