import { Module } from '@nestjs/common';
import { TarifasController } from './controller/tarifas.controller';
import { TarifasService } from './service/tarifas.service';
import { TarifasRepository } from './repository/tarifas.repository';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TarifasController],
  providers: [TarifasService, TarifasRepository],
})
export class TarifasModule {}
