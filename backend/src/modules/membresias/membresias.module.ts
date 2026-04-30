import { Module } from '@nestjs/common';
import { MembresiasController } from './controller/membresias.controller';
import { MembresiasService } from './service/membresias.service';
import { MembresiasRepository } from './repository/membresias.repository';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MembresiasController],
  providers: [MembresiasService, MembresiasRepository],
})
export class MembresiasModule {}
