import { Injectable } from '@nestjs/common';
import { SedesRepository } from '../repository/sedes.repository';
import { CreateSedeDto } from '../dto/create-sede.dto';
import { UpdateSedeDto } from '../dto/update-sede.dto';

@Injectable()
export class SedesService {
  constructor(private readonly repository: SedesRepository) {}

  findAll() {
    return this.repository.findAll();
  }
  findOne(id: number) {
    return this.repository.findOne(id);
  }
  create(dto: CreateSedeDto) {
    return this.repository.create(dto);
  }
  update(id: number, dto: UpdateSedeDto) {
    return this.repository.update(id, dto);
  }
  remove(id: number) {
    return this.repository.remove(id);
  }
}
