import { Injectable } from '@nestjs/common';
import { UsuariosRepository } from '../repository/usuarios.repository';
import { CreateUsuarioDto } from '../dto/create-usuario.dto';
import { UpdateUsuarioDto } from '../dto/update-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(private readonly repository: UsuariosRepository) {}

  findAll() {
    return this.repository.findAll();
  }
  findOne(id: number) {
    return this.repository.findOne(id);
  }
  create(dto: CreateUsuarioDto) {
    return this.repository.create(dto);
  }
  update(id: number, dto: UpdateUsuarioDto) {
    return this.repository.update(id, dto);
  }
  remove(id: number) {
    return this.repository.remove(id);
  }
}
