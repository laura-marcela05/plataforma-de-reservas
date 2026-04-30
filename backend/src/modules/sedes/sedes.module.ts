import { Module } from '@nestjs/common';
import { SedesController } from './controller/sedes.controller';
import { SedesService } from './service/sedes.service';
import { SedesRepository } from './repository/sedes.repository';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SedesController],
  providers: [SedesService, SedesRepository],
})
export class SedesModule {}
