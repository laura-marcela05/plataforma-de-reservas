import { Module } from '@nestjs/common';
import { ReservasController } from './controller/reservas.controller';
import { ReservasService } from './service/reservas.service';
import { ReservasRepository } from './repository/reservas.repository';
import { PrismaModule } from '../../prisma/prisma.module';

// Módulo de reservas: agrupa controller, service y repository.
// Aquí se registra la conectividad con Prisma para acceder a la base de datos.
@Module({
  imports: [PrismaModule],
  controllers: [ReservasController],
  providers: [ReservasService, ReservasRepository],
})
export class ReservasModule {}
