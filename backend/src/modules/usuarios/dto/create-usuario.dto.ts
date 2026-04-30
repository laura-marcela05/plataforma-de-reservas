import { IsString, IsEmail, IsInt, Matches } from 'class-validator';

export class CreateUsuarioDto {
  @IsString()
  nombre: string;

  @IsString()
  apellido: string;

  @IsEmail()
  correo: string;

  // ✅ Contraseña segura: 8-32, 1 mayús, 1 minús, 1 número, sin espacios
  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?!.*\s).{8,32}$/, {
    message:
      'La contraseña debe tener 8 a 32 caracteres, incluir al menos 1 mayúscula, 1 minúscula y 1 número (sin espacios).',
  })
  contrasena: string;

  // ✅ Teléfono: 10 dígitos, solo números, empieza por 3
  @IsString()
  @Matches(/^3\d{9}$/, {
    message:
      'El teléfono debe tener 10 dígitos, solo números y empezar por 3 (ej: 3001234567)',
  })
  telefono: string;

  @IsInt()
  membresiaId: number;
}