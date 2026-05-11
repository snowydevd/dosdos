// Tipos que reflejan el schema de Prisma + extensiones para la UI

export type Gender = 'HOMBRE' | 'MUJER' | 'NO_BINARIO' | 'OTRO';
export type DuoRole = 'CREATOR' | 'MEMBER';
export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
export type SwipeDirection = 'LEFT' | 'RIGHT';

export interface User {
  id: string;
  email: string;
  nombre: string;
  fechaNacimiento: string; // ISO string
  genero: Gender;
  bio?: string;
  ciudad: string;
  fotos: Photo[];
  duoMembership?: DuoMember;
  createdAt: string;
  updatedAt: string;
}

export interface Photo {
  id: string;
  userId: string;
  url: string;
  orden: number;
  createdAt: string;
}

export interface Duo {
  id: string;
  miembros: DuoMember[];
  bioConjunta?: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DuoMember {
  id: string;
  duoId: string;
  userId: string;
  user: User;
  rol: DuoRole;
  createdAt: string;
}

export interface DuoInvitation {
  id: string;
  inviterId: string;
  inviter: User;
  inviteeId: string;
  invitee: User;
  estado: InvitationStatus;
  createdAt: string;
  respondedAt?: string;
}

export interface Swipe {
  id: string;
  swiperUserId: string;
  swiperDuoId: string;
  targetDuoId: string;
  direccion: SwipeDirection;
  createdAt: string;
}

export interface Match {
  id: string;
  duoAId: string;
  duoA: Duo;
  duoBId: string;
  duoB: Duo;
  chat?: Chat;
  createdAt: string;
}

export interface Chat {
  id: string;
  matchId: string;
  mensajes: Message[];
  createdAt: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  sender: User;
  contenido: string;
  leidoPor: string[];
  createdAt: string;
}

// Tipo para mostrar un dúo en el feed de descubrir
export interface DuoCard {
  duo: Duo;
  miembro1: User;
  miembro2: User;
}

// Tipo para mostrar un match en la lista con la última info del chat
export interface MatchWithChat extends Match {
  ultimoMensaje?: Message;
  noLeidos: number;
}
