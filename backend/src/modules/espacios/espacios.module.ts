import { Module } from '@nestjs/common';
import { EspaciosController } from './controller/espacios.controller';
import { EspaciosService } from './service/espacios.service';
import { EspaciosRepository } from './repository/espacios.repository';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EspaciosController],
  providers: [EspaciosService, EspaciosRepository],
})
export class EspaciosModule {}
