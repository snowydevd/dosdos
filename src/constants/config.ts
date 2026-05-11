export const config = {
  // Edad mínima para registrarse en DosDos
  EDAD_MINIMA: 18,

  // Máximo de fotos por perfil
  MAX_FOTOS: 6,

  // Mínimo de fotos para completar el perfil
  MIN_FOTOS: 2,

  // Longitud máxima de bio individual
  BIO_MAX_LENGTH: 300,

  // Longitud máxima de bio conjunta del dúo
  BIO_DUO_MAX_LENGTH: 500,

  // Tiempo en ms que dura la animación de match (celebración)
  MATCH_ANIMATION_DURATION: 3000,

  // Cuántas cards del deck de swipe se pre-renderizan
  SWIPE_DECK_PRERENDER: 3,
} as const;
