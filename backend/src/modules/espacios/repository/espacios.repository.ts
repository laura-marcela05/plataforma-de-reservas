import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateEspacioDto } from '../dto/create-espacio.dto';
import { UpdateEspacioDto } from '../dto/update-espacio.dto';

@Injectable()
export class EspaciosRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(sedeId?: number) {
    return this.prisma.espacio.findMany({
      where: sedeId ? { sedeId } : {},
      include: { sede: true, tipoEspacio: true },
    });
  }

  async findOne(id: number) {
    const espacio = await this.prisma.espacio.findUnique({
      where: { id },
      include: { sede: true, tipoEspacio: true },
    });
    if (!espacio) throw new NotFoundException(`Espacio #${id} no encontrado`);
    return espacio;
  }

  async create(dto: CreateEspacioDto) {
    // ✅ Validar sede existente
    const sede = await this.prisma.sede.findUnique({
      where: { id: dto.sedeId },
    });
    if (!sede) throw new NotFoundException(`Sede #${dto.sedeId} no encontrada`);

    // ✅ Validar tipo de espacio existente
    const tipo = await this.prisma.tipoEspacio.findUnique({
      where: { id: dto.tipoEspacioId },
    });
    if (!tipo) {
      throw new NotFoundException(
        `TipoEspacio #${dto.tipoEspacioId} no encontrado`,
      );
    }

    if (dto.capacidad > sede.capacidadTotal) {
      throw new BadRequestException(
        `La capacidad del espacio (${dto.capacidad}) no puede superar la capacidad total de la sede (${sede.capacidadTotal})`,
      );
    }

    const capacidadActualSede = await this.prisma.espacio.aggregate({
      where: { sedeId: dto.sedeId },
      _sum: { capacidad: true },
    });

    const capacidadOcupada = capacidadActualSede._sum.capacidad ?? 0;
    if (capacidadOcupada + dto.capacidad > sede.capacidadTotal) {
      throw new BadRequestException(
        `La suma de capacidades de la sede excede su capacidad total (${sede.capacidadTotal})`,
      );
    }

    // ✅ Validar duplicado: nombre único por sede (regla A)
    const duplicado = await this.prisma.espacio.findFirst({
      where: {
        sedeId: dto.sedeId,
        nombre: dto.nombre,
      },
    });

    if (duplicado) {
      throw new ConflictException(
        'Ya existe un espacio con ese nombre en la sede seleccionada',
      );
    }

    try {
      return await this.prisma.espacio.create({
        data: dto,
        include: { sede: true, tipoEspacio: true },
      });
    } catch (e: any) {
      // ✅ Fallback: por si la BD dispara el unique (P2002)
      if (e?.code === 'P2002') {
        throw new ConflictException(
          'Ya existe un espacio con ese nombre en la sede seleccionada',
        );
      }
      throw e;
    }
  }

  async update(id: number, dto: UpdateEspacioDto) {
    const actual = await this.findOne(id);

    // ✅ HU-03: no permitir editar si tiene reservas activas
    const reservasActivas = await this.prisma.reserva.count({
      where: { espacioId: id, estado: 'activa' },
    });

    if (reservasActivas > 0) {
      throw new ConflictException(
        `El espacio #${id} tiene reservas activas y no puede editarse`,
      );
    }

    // ✅ Si cambia sedeId, validar sede existente
    if (dto.sedeId !== undefined) {
      const sede = await this.prisma.sede.findUnique({
        where: { id: dto.sedeId },
      });
      if (!sede) throw new NotFoundException(`Sede #${dto.sedeId} no encontrada`);
    }

    // ✅ Si cambia tipoEspacioId, validar tipo existente
    if (dto.tipoEspacioId !== undefined) {
      const tipo = await this.prisma.tipoEspacio.findUnique({
        where: { id: dto.tipoEspacioId },
      });
      if (!tipo) {
        throw new NotFoundException(
          `TipoEspacio #${dto.tipoEspacioId} no encontrado`,
        );
      }
    }

    // ✅ Validar duplicado en update (considerando valores finales)
    const sedeFinal = dto.sedeId ?? actual.sedeId;
    const nombreFinal = dto.nombre ?? actual.nombre;
    const capacidadFinal = dto.capacidad ?? actual.capacidad;

    const sedeValidada = await this.prisma.sede.findUnique({
      where: { id: sedeFinal },
    });
    if (!sedeValidada) {
      throw new NotFoundException(`Sede #${sedeFinal} no encontrada`);
    }

    if (capacidadFinal > sedeValidada.capacidadTotal) {
      throw new BadRequestException(
        `La capacidad del espacio (${capacidadFinal}) no puede superar la capacidad total de la sede (${sedeValidada.capacidadTotal})`,
      );
    }

    const capacidadActualSede = await this.prisma.espacio.aggregate({
      where: {
        sedeId: sedeFinal,
        NOT: { id },
      },
      _sum: { capacidad: true },
    });

    const capacidadOcupada = capacidadActualSede._sum.capacidad ?? 0;
    if (capacidadOcupada + capacidadFinal > sedeValidada.capacidadTotal) {
      throw new BadRequestException(
        `La suma de capacidades de la sede excede su capacidad total (${sedeValidada.capacidadTotal})`,
      );
    }

    const duplicado = await this.prisma.espacio.findFirst({
      where: {
        sedeId: sedeFinal,
        nombre: nombreFinal,
        NOT: { id }, // excluir el mismo registro
      },
    });

    if (duplicado) {
      throw new ConflictException(
        'Ya existe un espacio con ese nombre en la sede seleccionada',
      );
    }

    try {
      return await this.prisma.espacio.update({
        where: { id },
        data: dto,
        include: { sede: true, tipoEspacio: true },
      });
    } catch (e: any) {
      if (e?.code === 'P2002') {
        throw new ConflictException(
          'Ya existe un espacio con ese nombre en la sede seleccionada',
        );
      }
      throw e;
    }
  }

  async remove(id: number) {
    await this.findOne(id);

    const reservasActivas = await this.prisma.reserva.count({
      where: { espacioId: id, estado: 'activa' },
    });

    if (reservasActivas > 0) {
      throw new ConflictException(
        `El espacio #${id} tiene reservas activas y no puede eliminarse`,
      );
    }

    return this.prisma.espacio.delete({ where: { id } });
  }

  // =========================================================
  // HU-04: Disponibilidad dentro de Espacios
  // GET /espacios/disponibles?sedeId=&fecha=&horaInicio=&horaFin=
  // =========================================================

  private isHHmm(hhmm: string): boolean {
    return /^([01]\d|2[0-3]):[0-5]\d$/.test(hhmm);
  }

  private toMinutes(hhmm: string): number {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
  }

  // Convierte HH:mm a Date "time-only" compatible con @db.Time
  private toTimeOnly(hhmm: string): Date {
    return new Date(`1970-01-01T${hhmm}:00.000Z`);
  }

  async findDisponibles(params: {
    sedeId: number;
    fecha: string;      // YYYY-MM-DD
    horaInicio: string; // HH:mm
    horaFin: string;    // HH:mm
  }) {
    const { sedeId, fecha, horaInicio, horaFin } = params;

    // Validaciones HU-04 (parámetros)
    if (!sedeId || !fecha || !horaInicio || !horaFin) {
      throw new BadRequestException(
        'Debe enviar sedeId, fecha, horaInicio y horaFin',
      );
    }

    if (!this.isHHmm(horaInicio) || !this.isHHmm(horaFin)) {
      throw new BadRequestException(
        'Las horas deben tener formato 24h HH:mm (ej: 09:00)',
      );
    }

    // Mantener la regla simple: no permitir cruzar día (fin <= inicio)
    if (horaFin <= horaInicio) {
      throw new BadRequestException(
        'La hora de fin debe ser posterior a la hora de inicio',
      );
    }

    // Validar sede existe
    const sedeExiste = await this.prisma.sede.findUnique({
      where: { id: sedeId },
    });
    if (!sedeExiste) {
      throw new NotFoundException(`Sede #${sedeId} no encontrada`);
    }

    // ✅ Validación estricta: rango dentro del horario de la sede
    const apertura = sedeExiste.horarioApertura;
    const cierre = sedeExiste.horarioCierre;

    // Por seguridad: validar que el horario de sede esté en HH:mm
    if (!this.isHHmm(apertura) || !this.isHHmm(cierre)) {
      throw new BadRequestException(
        'La sede tiene un horario inválido. Revise horario de apertura y cierre.',
      );
    }

    const inicioMin = this.toMinutes(horaInicio);
    const finMin = this.toMinutes(horaFin);
    const aperturaMin = this.toMinutes(apertura);
    const cierreMin = this.toMinutes(cierre);

    if (inicioMin < aperturaMin || finMin > cierreMin) {
      throw new BadRequestException(
        `El rango consultado está fuera del horario de la sede (${apertura}–${cierre}).`,
      );
    }

    const fechaDate = new Date(fecha); // YYYY-MM-DD
    const inicio = this.toTimeOnly(horaInicio);
    const fin = this.toTimeOnly(horaFin);

    // Query: espacios de la sede SIN reservas activas que se crucen en el rango
    const espacios = await this.prisma.espacio.findMany({
      where: {
        sedeId,
        reservas: {
          none: {
            estado: 'activa',
            fecha: fechaDate,
            AND: [
              { horaInicio: { lt: fin } },
              { horaFin: { gt: inicio } },
            ],
          },
        },
      },
      include: { sede: true, tipoEspacio: true },
      orderBy: { id: 'asc' },
    });

    if (espacios.length === 0) {
      return {
        espacios: [],
        total: 0,
        mensaje: 'No hay espacios disponibles para el rango seleccionado.',
      };
    }

    return { espacios, total: espacios.length };
  }
}