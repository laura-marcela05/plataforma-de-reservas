/**
 * ============================================================
 * MÓDULO DE PRISMA (Base de Datos)
 * ============================================================
 *
 * @Global() → Hace que PrismaService esté disponible en TODA la app
 *   sin necesidad de importar PrismaModule en cada módulo.
 *
 * exports: [PrismaService] → Permite que otros módulos inyecten PrismaService
 *   en sus constructores (ej: EstudiantesRepository recibe PrismaService).
 */
import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
