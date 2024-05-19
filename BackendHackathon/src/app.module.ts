import { Module } from '@nestjs/common';
import { ManagementController } from './controllers/management.controller';
import { AuthorisationService } from './authorisation.service';
import {ManagementService} from "./management.service";

@Module({
  imports: [],
  controllers: [ManagementController],
  providers: [AuthorisationService, ManagementService
  ],
})
export class AppModule {}
