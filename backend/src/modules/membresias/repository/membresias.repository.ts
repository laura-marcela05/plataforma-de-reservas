import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateMembresiaDto } from '../dto/create-membresia.dto';
import { UpdateMembresiaDto } from '../dto/update-membresia.dto';

@Injectable()
export class MembresiasRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.membresia.findMany();
  }

  async findOne(id: number) {
    const membresia = await this.prisma.membresia.findUnique({ where: { id } });
    if (!membresia)
      throw new NotFoundException(`Membresía #${id} no encontrada`);
    return membresia;
  }

  async create(dto: CreateMembresiaDto) {
    const tipoNormalizado = dto.tipo.trim();

    const existente = await this.prisma.membresia.findFirst({
      where: { tipo: { equals: tipoNormalizado, mode: 'insensitive' } },
    });

    if (existente) {
      throw new ConflictException('Ya existe una membresía con ese tipo.');
    }

    return this.prisma.membresia.create({
      data: { ...dto, tipo: tipoNormalizado },
    });
  }

  async update(id: number, dto: UpdateMembresiaDto) {
    await this.findOne(id);

    if (dto.tipo !== undefined) {
      const tipoNormalizado = dto.tipo.trim();
      const existente = await this.prisma.membresia.findFirst({
        where: {
          tipo: { equals: tipoNormalizado, mode: 'insensitive' },
          NOT: { id },
        },
      });

      if (existente) {
        throw new ConflictException('Ya existe una membresía con ese tipo.');
      }

      return this.prisma.membresia.update({
        where: { id },
        data: { ...dto, tipo: tipoNormalizado },
      });
    }

    return this.prisma.membresia.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.membresia.delete({ where: { id } });
  }
}
