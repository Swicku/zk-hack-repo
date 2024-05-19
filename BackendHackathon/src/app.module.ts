import { Module } from '@nestjs/common';
import { ManagementController } from './controllers/management.controller';
import { AuthorisationService } from './authorisation.service';

@Module({
  imports: [],
  controllers: [ManagementController],
  providers: [AuthorisationService],
})
export class AppModule {}
