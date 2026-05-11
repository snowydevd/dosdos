# DosDos Mobile

App mobile de citas para dúos — el formato **2x2** típico de Uruguay y Latinoamérica.
En vez de matchear personas individuales, DosDos matchea **pares de amigos**: 2 personas forman un dúo y van al pool de matching juntos.

---

## Concepto

El "2 para 2" es un formato cultural muy arraigado: dos amigos (de cualquier género) coordinan una salida con otros dos. DosDos digitaliza ese proceso. El flujo de match es:

1. Dúo A swipea derecha al dúo B → **ambos** del dúo A deben haberle dado like
2. El sistema notifica al dúo B
3. **Ambos** del dúo B también swipean derecha → ¡Match!
4. Se crea un chat grupal de 4 personas en tiempo real

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Mobile | React Native + Expo SDK 51 + TypeScript |
| Navegación | Expo Router v3 (file-based) |
| Backend / Auth / DB | Supabase (Auth, PostgreSQL, Storage, Realtime) |
| ORM | Prisma 5 |
| Estado global | Zustand 5 |
| Data fetching | TanStack Query (React Query) v5 |
| Estilos | NativeWind v4 (Tailwind para RN) |
| Validación | Zod |
| Forms | React Hook Form |
| Swipe deck | react-native-deck-swiper |

> **¿Por qué react-native-deck-swiper?** Es la librería más usada para swipe de cards en RN, con API simple y overlays configurables. Alternativa evaluada: `rn-tinder-card` (menos mantenida) y gestos propios con Reanimated (más flexible pero más código para el MVP).

> **¿Por qué chat propio y no GiftedChat?** Componentes propios con NativeWind = consistencia visual total con la paleta de la app. GiftedChat tiene estilos propios difíciles de sobreescribir y dependencias pesadas.

---

## Estructura del proyecto

```
dosdos-mobile/
├── app/                          # Expo Router (file-based routing)
│   ├── (auth)/                   # Login + Registro
│   ├── (onboarding)/             # Fotos + Linkear dúo
│   ├── (tabs)/                   # Tabs principales
│   │   ├── descubrir.tsx         # Swipe deck
│   │   ├── matches.tsx           # Lista de matches
│   │   ├── chat.tsx              # Lista de chats
│   │   └── perfil.tsx            # Perfil + dúo
│   ├── chat/[id].tsx             # Chat grupal de 4
│   └── index.tsx                 # Redirect según estado de auth/onboarding
├── src/
│   ├── components/
│   │   ├── ui/                   # Button, Input, Card, Avatar
│   │   ├── duo/                  # DuoCard, SwipeDeck
│   │   └── chat/                 # MessageBubble, ChatInput
│   ├── lib/
│   │   ├── supabase.ts           # Cliente Supabase
│   │   ├── utils.ts              # Helpers: edad, fechas, etc.
│   │   └── queries/              # Hooks de React Query
│   │       ├── auth.ts
│   │       ├── duo.ts
│   │       ├── swipe.ts
│   │       ├── chat.ts
│   │       └── user.ts
│   ├── stores/                   # Zustand stores
│   │   ├── auth.ts
│   │   └── duo.ts
│   ├── types/index.ts            # Tipos TypeScript (espejo del schema Prisma)
│   └── constants/
│       ├── colors.ts             # Paleta de colores documentada
│       └── config.ts             # Constantes de negocio
└── prisma/
    └── schema.prisma             # Schema de la DB
```

---

## Cómo correr el proyecto (primera vez)

### 1. Crear el proyecto en Supabase

1. Andá a [supabase.com](https://supabase.com) y creá una cuenta si no tenés.
2. Hacé clic en **New project**.
3. Completá nombre, contraseña de base de datos y región (elegí `South America (São Paulo)` para menor latencia en Uruguay).
4. Esperá que el proyecto se inicialice (~1 minuto).

### 2. Obtener las keys

En tu proyecto de Supabase:

- **Settings → API** → copiá `Project URL` y `anon public` key.
- **Settings → Database → Connection string → URI** → copiá la URI de conexión (tiene dos variantes: la del pooler para queries normales y la directa para migraciones).

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Editá `.env` con tus valores:

```env
EXPO_PUBLIC_SUPABASE_URL=https://tuproyecto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Pooler (para queries en runtime)
DATABASE_URL=postgresql://postgres.tuproyecto:[PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true

# Directa (para migraciones de Prisma)
DIRECT_URL=postgresql://postgres.tuproyecto:[PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
```

### 4. Configurar Storage en Supabase

1. En tu proyecto de Supabase → **Storage → New bucket**.
2. Nombre: `fotos-perfil`, marcalo como **público**.
3. En **Policies**, agregá una política que permita `INSERT` y `SELECT` a usuarios autenticados.

### 5. Instalar dependencias

```bash
cd dosdos-mobile
npm install
```

### 6. Correr migraciones de Prisma

```bash
npx prisma generate    # Genera el cliente de Prisma
npx prisma migrate dev --name init   # Aplica el schema a tu DB de Supabase
```

### 7. Iniciar la app

```bash
npm start
```

Esto abre el Metro bundler. Escaneá el QR con **Expo Go** (iOS/Android) o presioná:
- `i` para simulador iOS
- `a` para emulador Android
- `w` para web

---

## Comandos útiles

```bash
npm run dev              # Alias de npm start
npm run lint             # ESLint
npm run format           # Prettier
npm run type-check       # TypeScript sin compilar

npx prisma studio        # GUI de la base de datos (browser)
npx prisma migrate dev   # Nueva migración
npx prisma generate      # Regenerar cliente (después de cambiar schema)
```

---

## Paleta de colores

Definida en `src/constants/colors.ts`:

| Token | Valor | Uso |
|-------|-------|-----|
| `primary.DEFAULT` | `#FF6B47` | CTAs, botones, íconos activos |
| `accent.DEFAULT` | `#FFB830` | Highlights, badges |
| `neutral.900` | `#141413` | Texto principal |
| `neutral.50` | `#FAFAF9` | Fondos |
| `success` | `#22C55E` | Estados positivos |
| `error` | `#EF4444` | Errores, validaciones |

El coral/naranja se eligió por ser **energético y cálido** — transmite la calidez social del formato 2x2 y se diferencia del rojo de Tinder, el violeta de Bumble y el verde de Hinge.

---

## Reglas de negocio clave

- **Un usuario = un dúo activo a la vez.** Si se deshace el dúo, los matches anteriores se conservan pero no pueden recibir nuevos mensajes.
- **El match requiere 4 votos RIGHT:** los 2 del dúo A → los 2 del dúo B.
- **Edad mínima: 18 años.** Se valida en el cliente con Zod y en la lógica de registro.
- **Mínimo 2 fotos** para completar el perfil y entrar al pool de matching.
- **Ciudad como filtro básico de descubrimiento** en el MVP. Sin geolocalización por ahora.

---

## Qué falta para la primera versión testeable

1. ✅ Proyecto Supabase creado + `.env` configurado
2. ✅ `npx prisma migrate dev` corrido
3. ⬜ Configurar Storage bucket `fotos-perfil` con política pública de lectura
4. ⬜ Habilitar Realtime en Supabase para la tabla `messages` (Dashboard → Database → Replication → Habilitar para `messages`)
5. ⬜ Registrar 2 usuarios y armar un dúo desde la app
6. ⬜ Poblar con datos de prueba (mínimo 2 dúos con fotos para poder swipear)
7. ⬜ Probar el flujo completo de swipe → match → chat

---

## Sugerencias para después del MVP

- **Verificación con selfie:** comparar foto de perfil con selfie en tiempo real para reducir catfishing.
- **Push notifications:** notificar cuando llega un like, un match o un mensaje nuevo. Expo Notifications + Supabase Edge Functions.
- **Geolocalización:** reemplazar el filtro por ciudad por proximidad en km. `expo-location` + índice PostGIS en Supabase.
- **Filtros de preferencias:** por edad, género del dúo, tipo de salida que buscan.
- **Video en fotos del dúo:** que el dúo pueda subir un video corto juntos (diferenciador de producto).
- **Moderación de contenido:** revisar fotos con un servicio de IA antes de publicarlas.
- **Reportes y bloqueos:** infraestructura mínima de seguridad de la plataforma.
- **Analytics:** funnel de conversión (registro → dúo formado → primer swipe → primer match → primer mensaje).
