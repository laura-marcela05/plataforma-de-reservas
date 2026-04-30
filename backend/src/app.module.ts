import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { MembresiasModule } from './modules/membresias/membresias.module';
import { SedesModule } from './modules/sedes/sedes.module';
import { TiposEspacioModule } from './modules/tipos-espacio/tipos-espacio.module';
import { EspaciosModule } from './modules/espacios/espacios.module';
import { TarifasModule } from './modules/tarifas/tarifas.module';
import { ReservasModule } from './modules/reservas/reservas.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UsuariosModule,
    MembresiasModule,
    SedesModule,
    TiposEspacioModule,
    EspaciosModule,
    TarifasModule,
    ReservasModule,
  ],
})
export class AppModule {}