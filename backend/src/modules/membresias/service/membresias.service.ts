import { Injectable } from '@nestjs/common';
import { MembresiasRepository } from '../repository/membresias.repository';
import { CreateMembresiaDto } from '../dto/create-membresia.dto';
import { UpdateMembresiaDto } from '../dto/update-membresia.dto';

@Injectable()
export class MembresiasService {
  constructor(private readonly repository: MembresiasRepository) {}

  findAll() {
    return this.repository.findAll();
  }
  findOne(id: number) {
    return this.repository.findOne(id);
  }
  create(dto: CreateMembresiaDto) {
    return this.repository.create(dto);
  }
  update(id: number, dto: UpdateMembresiaDto) {
    return this.repository.update(id, dto);
  }
  remove(id: number) {
    return this.repository.remove(id);
  }
}
