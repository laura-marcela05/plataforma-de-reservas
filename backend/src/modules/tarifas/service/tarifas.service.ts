import { Injectable } from '@nestjs/common';
import { TarifasRepository } from '../repository/tarifas.repository';
import { CreateTarifaDto } from '../dto/create-tarifa.dto';
import { UpdateTarifaDto } from '../dto/update-tarifa.dto';

@Injectable()
export class TarifasService {
  constructor(private readonly repository: TarifasRepository) {}

  findAll() {
    return this.repository.findAll();
  }
  findOne(id: number) {
    return this.repository.findOne(id);
  }
  create(dto: CreateTarifaDto) {
    return this.repository.create(dto);
  }
  update(id: number, dto: UpdateTarifaDto) {
    return this.repository.update(id, dto);
  }
  remove(id: number) {
    return this.repository.remove(id);
  }
}
