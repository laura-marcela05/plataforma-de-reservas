import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateUsuarioDto } from '../dto/create-usuario.dto';
import { UpdateUsuarioDto } from '../dto/update-usuario.dto';

@Injectable()
export class UsuariosRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Devuelve todos los usuarios incluyendo membresía
  findAll() {
    return this.prisma.usuario.findMany({
      include: { membresia: true },
    });
  }

  // Devuelve un usuario por ID
  async findOne(id: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      include: { membresia: true },
    });
    if (!usuario) throw new NotFoundException(`Usuario #${id} no encontrado`);
    return usuario;
  }

  // Crear usuario con validación de correo y membresía existente
  async create(dto: CreateUsuarioDto) {
    const existe = await this.prisma.usuario.findUnique({
      where: { correo: dto.correo },
    });
    if (existe) throw new ConflictException('El correo ya está registrado');

    // Validar que la membresía exista
    const membresia = await this.prisma.membresia.findUnique({
      where: { id: dto.membresiaId },
    });
    if (!membresia) {
      throw new NotFoundException(`Membresía #${dto.membresiaId} no encontrada`);
    }

    return this.prisma.usuario.create({
      data: {
        ...dto,
        membresiaId: dto.membresiaId,
      },
      include: { membresia: true },
    });
  }

  // Actualizar usuario (validar correo único y membresía si se envía)
  async update(id: number, dto: UpdateUsuarioDto) {
    const actual = await this.findOne(id);

    // ✅ Si intenta cambiar el correo, validar unicidad (que no pertenezca a otro usuario)
    if (dto.correo !== undefined && dto.correo !== actual.correo) {
      const existe = await this.prisma.usuario.findUnique({
        where: { correo: dto.correo },
      });
      if (existe && existe.id !== id) {
        throw new ConflictException('El correo ya está registrado');
      }
    }

    // ✅ Si intenta cambiar la membresía, validar existencia
    if (dto.membresiaId !== undefined) {
      const membresia = await this.prisma.membresia.findUnique({
        where: { id: dto.membresiaId },
      });
      if (!membresia) {
        throw new NotFoundException(`Membresía #${dto.membresiaId} no encontrada`);
      }
    }

    return this.prisma.usuario.update({
      where: { id },
      data: dto,
      include: { membresia: true },
    });
  }

  // Eliminar usuario (HU-01: solo si NO tiene reservas asociadas)
  async remove(id: number) {
    await this.findOne(id);

    const reservasAsociadas = await this.prisma.reserva.count({
      where: { usuarioId: id },
    });

    if (reservasAsociadas > 0) {
      throw new ConflictException(
        'No se puede eliminar: el usuario tiene reservas asociadas',
      );
    }

    return this.prisma.usuario.delete({ where: { id } });
  }
}