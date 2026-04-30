import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateTipoEspacioDto } from '../dto/create-tipo-espacio.dto';
import { UpdateTipoEspacioDto } from '../dto/update-tipo-espacio.dto';

@Injectable()
export class TiposEspacioRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.tipoEspacio.findMany();
  }

  async findOne(id: number) {
    const tipo = await this.prisma.tipoEspacio.findUnique({ where: { id } });
    if (!tipo) throw new NotFoundException(`TipoEspacio #${id} no encontrado`);
    return tipo;
  }

  async create(dto: CreateTipoEspacioDto) {
    const nombreNormalizado = dto.nombre.trim();

    const existente = await this.prisma.tipoEspacio.findFirst({
      where: { nombre: { equals: nombreNormalizado, mode: 'insensitive' } },
    });

    if (existente) {
      throw new ConflictException('Ya existe un tipo de espacio con ese nombre.');
    }

    return this.prisma.tipoEspacio.create({
      data: { ...dto, nombre: nombreNormalizado },
    });
  }

  async update(id: number, dto: UpdateTipoEspacioDto) {
    await this.findOne(id);

    if (dto.nombre !== undefined) {
      const nombreNormalizado = dto.nombre.trim();
      const existente = await this.prisma.tipoEspacio.findFirst({
        where: {
          nombre: { equals: nombreNormalizado, mode: 'insensitive' },
          NOT: { id },
        },
      });

      if (existente) {
        throw new ConflictException('Ya existe un tipo de espacio con ese nombre.');
      }

      return this.prisma.tipoEspacio.update({
        where: { id },
        data: { ...dto, nombre: nombreNormalizado },
      });
    }

    return this.prisma.tipoEspacio.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.tipoEspacio.delete({ where: { id } });
  }
}
