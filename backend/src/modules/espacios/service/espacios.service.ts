import { Injectable } from '@nestjs/common';
import { EspaciosRepository } from '../repository/espacios.repository';
import { CreateEspacioDto } from '../dto/create-espacio.dto';
import { UpdateEspacioDto } from '../dto/update-espacio.dto';

@Injectable()
export class EspaciosService {
  constructor(private readonly repository: EspaciosRepository) {}

  findAll(sedeId?: number) {
    return this.repository.findAll(sedeId);
  }

  findOne(id: number) {
    return this.repository.findOne(id);
  }

  create(dto: CreateEspacioDto) {
    return this.repository.create(dto);
  }

  update(id: number, dto: UpdateEspacioDto) {
    return this.repository.update(id, dto);
  }

  remove(id: number) {
    return this.repository.remove(id);
  }

  // ✅ HU-04: disponibilidad dentro de espacios
  disponibles(sedeId: number, fecha: string, horaInicio: string, horaFin: string) {
    return this.repository.findDisponibles({ sedeId, fecha, horaInicio, horaFin });
  }
}