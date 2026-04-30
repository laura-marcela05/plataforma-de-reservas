/**
 * ============================================================
 * SERVICIO DE PRISMA (Conexión a Base de Datos)
 * ============================================================
 *
 * ¿QUÉ HACE?
 *   Este servicio gestiona la conexión con PostgreSQL usando Prisma ORM.
 *   Actúa como el "puente" entre la aplicación y la base de datos.
 *
 * ¿CÓMO FUNCIONA?
 *   1. Extiende PrismaClient → hereda TODOS los métodos de consulta
 *      (this.prisma.estudiante.findMany(), this.prisma.docente.create(), etc.)
 *   2. Usa PrismaPg como adaptador de conexión a PostgreSQL
 *   3. Lee la URL de conexión de la variable de entorno DATABASE_URL
 *
 * CICLO DE VIDA:
 *   - onModuleInit()    → Se conecta a la BD cuando arranca el módulo
 *   - onModuleDestroy() → Cierra la conexión cuando se detiene la app
 *
 * ¿POR QUÉ ES @Global()? (definido en PrismaModule)
 *   Porque TODOS los módulos necesitan acceso a la BD. Al ser global,
 *   cualquier Repository puede inyectar PrismaService sin importar
 *   PrismaModule explícitamente.
 *
 * VARIABLE DE ENTORNO:
 *   DATABASE_URL = postgresql://admin:admin123@db:5432/gestion_academica
 *                  └─usuario─┘ └─pass──┘ └host┘└port┘ └──database──┘
 */
import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
