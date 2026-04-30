import { Injectable } from '@nestjs/common';
import { TiposEspacioRepository } from '../repository/tipos-espacio.repository';
import { CreateTipoEspacioDto } from '../dto/create-tipo-espacio.dto';
import { UpdateTipoEspacioDto } from '../dto/update-tipo-espacio.dto';

@Injectable()
export class TiposEspacioService {
  constructor(private readonly repository: TiposEspacioRepository) {}

  findAll() {
    return this.repository.findAll();
  }
  findOne(id: number) {
    return this.repository.findOne(id);
  }
  create(dto: CreateTipoEspacioDto) {
    return this.repository.create(dto);
  }
  update(id: number, dto: UpdateTipoEspacioDto) {
    return this.repository.update(id, dto);
  }
  remove(id: number) {
    return this.repository.remove(id);
  }
}
