import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateTarifaDto } from '../dto/create-tarifa.dto';
import { UpdateTarifaDto } from '../dto/update-tarifa.dto';

@Injectable()
export class TarifasRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.tarifa.findMany({
      include: { tipoEspacio: true, membresia: true },
    });
  }

  async findOne(id: number) {
    const tarifa = await this.prisma.tarifa.findUnique({
      where: { id },
      include: { tipoEspacio: true, membresia: true },
    });
    if (!tarifa) throw new NotFoundException(`Tarifa #${id} no encontrada`);
    return tarifa;
  }

  async create(dto: CreateTarifaDto) {
    const existe = await this.prisma.tarifa.findUnique({
      where: {
        tipoEspacioId_membresiaId: {
          tipoEspacioId: dto.tipoEspacioId,
          membresiaId: dto.membresiaId,
        },
      },
    });
    if (existe)
      throw new ConflictException('Ya existe una tarifa para esa combinación');
    return this.prisma.tarifa.create({ data: dto });
  }

  async update(id: number, dto: UpdateTarifaDto) {
    await this.findOne(id);
    return this.prisma.tarifa.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.tarifa.delete({ where: { id } });
  }
}
