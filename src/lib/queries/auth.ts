import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface RegisterData {
  email: string;
  password: string;
  nombre: string;
  fechaNacimiento: string;
  genero: string;
  ciudad: string;
  bio?: string;
}

interface LoginData {
  email: string;
  password: string;
}

/**
 * Registro: crea cuenta en Supabase Auth y luego el perfil en nuestra DB.
 */
export function useRegister() {
  return useMutation({
    mutationFn: async (data: RegisterData) => {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No se pudo crear el usuario');

      const now = new Date().toISOString();
      const { error: profileError } = await supabase.from('users').insert({
        id: authData.user.id,
        email: data.email,
        nombre: data.nombre,
        fechaNacimiento: data.fechaNacimiento,
        genero: data.genero,
        ciudad: data.ciudad,
        bio: data.bio ?? null,
        updatedAt: now,
      });

      if (profileError) throw profileError;

      return authData.user;
    },
  });
}

/**
 * Login con email y contraseña.
 */
export function useLogin() {
  return useMutation({
    mutationFn: async (data: LoginData) => {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;
      return authData.user;
    },
  });
}

/**
 * Logout — limpia la sesión de Supabase y el store de Zustand.
 */
export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
  });
}
