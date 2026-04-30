import { Module } from '@nestjs/common';
import { TiposEspacioController } from './controller/tipos-espacio.controller';
import { TiposEspacioService } from './service/tipos-espacio.service';
import { TiposEspacioRepository } from './repository/tipos-espacio.repository';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TiposEspacioController],
  providers: [TiposEspacioService, TiposEspacioRepository],
})
export class TiposEspacioModule {}
