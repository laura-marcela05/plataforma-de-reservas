export class UsuarioEntity {
  id!: number;
  nombre!: string;
  apellido!: string;
  correo!: string;
  contrasena!: string;
  telefono!: string;
  membresiaId!: number;
  createdAt!: Date;
  updatedAt!: Date;
}
