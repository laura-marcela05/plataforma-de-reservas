import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateSedeDto } from '../dto/create-sede.dto';
import { UpdateSedeDto } from '../dto/update-sede.dto';

@Injectable()
export class SedesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.sede.findMany();
  }

  async findOne(id: number) {
    const sede = await this.prisma.sede.findUnique({ where: { id } });
    if (!sede) throw new NotFoundException(`Sede #${id} no encontrada`);
    return sede;
  }

  async create(dto: CreateSedeDto) {
    const existe = await this.prisma.sede.findUnique({
      where: { nombre: dto.nombre },
    });
    if (existe) throw new ConflictException('El nombre de la sede ya existe');

    // ✅ HU-02: horarioCierre debe ser posterior a horarioApertura
    // Como el formato es HH:mm, comparar strings funciona correctamente.
    if (dto.horarioCierre <= dto.horarioApertura) {
      throw new BadRequestException(
        'El horario de cierre debe ser posterior al de apertura',
      );
    }

    return this.prisma.sede.create({ data: dto });
  }

  async update(id: number, dto: UpdateSedeDto) {
    const actual = await this.findOne(id);

    const espaciosAsociados = await this.prisma.espacio.count({
      where: { sedeId: id },
    });

    if (espaciosAsociados > 0) {
      throw new ConflictException(
        'No se puede editar: la sede tiene espacios asociados',
      );
    }

    // Si en el update viene solo uno de los dos, usamos el valor actual del otro
    const apertura = dto.horarioApertura ?? actual.horarioApertura;
    const cierre = dto.horarioCierre ?? actual.horarioCierre;

    // ✅ HU-02: cierre posterior a apertura
    if (cierre <= apertura) {
      throw new BadRequestException(
        'El horario de cierre debe ser posterior al de apertura',
      );
    }

    return this.prisma.sede.update({ where: { id }, data: dto });
  }

  // HU-02: Solo eliminar si NO tiene espacios asociados
  async remove(id: number) {
    await this.findOne(id);

    const espaciosAsociados = await this.prisma.espacio.count({
      where: { sedeId: id },
    });

    if (espaciosAsociados > 0) {
      throw new ConflictException(
        'No se puede eliminar: la sede tiene espacios asociados',
      );
    }

    return this.prisma.sede.delete({ where: { id } });
  }
}