import { config } from '@/constants/config';

/**
 * Calcula la edad a partir de una fecha de nacimiento ISO.
 */
export function calcularEdad(fechaNacimiento: string): number {
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  return edad;
}

/**
 * Verifica si el usuario tiene la edad mínima requerida.
 */
export function esMayorDeEdad(fechaNacimiento: string): boolean {
  return calcularEdad(fechaNacimiento) >= config.EDAD_MINIMA;
}

/**
 * Formatea una fecha en formato legible en español rioplatense.
 */
export function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString('es-UY', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Formatea la hora de un mensaje de chat.
 */
export function formatearHoraChat(fecha: string): string {
  return new Date(fecha).toLocaleTimeString('es-UY', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Genera un código de invitación de 6 caracteres a partir de un userId.
 * Se usa para compartir invitación al dúo por fuera de la app.
 */
export function generarCodigoInvitacion(userId: string): string {
  return userId.replace(/-/g, '').toUpperCase().slice(0, 6);
}

/**
 * Trunca un texto a una longitud máxima con "...".
 */
export function truncar(texto: string, max: number): string {
  if (texto.length <= max) return texto;
  return texto.slice(0, max - 3) + '...';
}

/**
 * Clasifica el género con etiqueta amigable en español.
 */
export function labelGenero(genero: string): string {
  const labels: Record<string, string> = {
    HOMBRE: 'Hombre',
    MUJER: 'Mujer',
    NO_BINARIO: 'No binario',
    OTRO: 'Otro',
  };
  return labels[genero] ?? genero;
}
