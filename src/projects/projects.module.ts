import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { FirebaseModule } from '../firebase/firebase.module';
import { CacheModule } from '@nestjs/cache-manager';
import { CacheService } from 'src/services/cache.service';

@Module({
  imports: [FirebaseModule, CacheModule.register()],
  controllers: [ProjectsController],
  providers: [ProjectsService, CacheService],
})
export class ProjectsModule { }