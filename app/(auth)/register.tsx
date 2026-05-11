import React from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useRegister } from '@/lib/queries/auth';
import { esMayorDeEdad } from '@/lib/utils';
import { config } from '@/constants/config';

const registerSchema = z.object({
  nombre: z.string().min(2, 'El nombre es muy corto').max(50),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  fechaNacimiento: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: AAAA-MM-DD')
    .refine(esMayorDeEdad, `Tenés que tener al menos ${config.EDAD_MINIMA} años`),
  genero: z.enum(['HOMBRE', 'MUJER', 'NO_BINARIO', 'OTRO']),
  ciudad: z.string().min(2, 'Ingresá tu ciudad'),
  bio: z.string().max(300).optional(),
});

type RegisterForm = z.infer<typeof registerSchema>;

const GENEROS = [
  { value: 'HOMBRE', label: 'Hombre' },
  { value: 'MUJER', label: 'Mujer' },
  { value: 'NO_BINARIO', label: 'No binario' },
  { value: 'OTRO', label: 'Otro' },
] as const;

export default function RegisterScreen() {
  const register = useRegister();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { genero: 'HOMBRE' },
  });

  const generoActual = watch('genero');

  const onSubmit = async (data: RegisterForm) => {
    try {
      await register.mutateAsync(data);
      router.replace('/(onboarding)/perfil');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al registrarse';
      setError('root', { message });
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingVertical: 40, paddingHorizontal: 24, gap: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="gap-y-1">
          <Text className="text-3xl font-black text-neutral-900">Crear cuenta</Text>
          <Text className="text-neutral-500">Completá tus datos para empezar</Text>
        </View>

        {/* Campos */}
        <View className="gap-y-4">
          <Controller
            control={control}
            name="nombre"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Tu nombre"
                placeholder="Como te llaman tus amigos"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={errors.nombre?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Email"
                placeholder="tucorreo@ejemplo.com"
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Contraseña"
                placeholder="Mínimo 6 caracteres"
                secureTextEntry
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={errors.password?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="fechaNacimiento"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Fecha de nacimiento"
                placeholder="AAAA-MM-DD (ej: 1998-03-15)"
                keyboardType="numeric"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={errors.fechaNacimiento?.message}
                hint={`Tenés que tener al menos ${config.EDAD_MINIMA} años`}
              />
            )}
          />

          {/* Selector de género */}
          <View className="gap-y-2">
            <Text className="text-sm font-medium text-neutral-700">Género</Text>
            <View className="flex-row flex-wrap gap-2">
              {GENEROS.map((g) => (
                <TouchableOpacity
                  key={g.value}
                  onPress={() => setValue('genero', g.value)}
                  className={`px-4 py-2 rounded-full border ${
                    generoActual === g.value
                      ? 'bg-primary border-primary'
                      : 'bg-white border-neutral-300'
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      generoActual === g.value ? 'text-white' : 'text-neutral-700'
                    }`}
                  >
                    {g.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.genero && (
              <Text className="text-xs text-error">{errors.genero.message}</Text>
            )}
          </View>

          <Controller
            control={control}
            name="ciudad"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Ciudad"
                placeholder="Ej: Montevideo"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={errors.ciudad?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="bio"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Bio (opcional)"
                placeholder="Contá algo de vos..."
                multiline
                numberOfLines={3}
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={errors.bio?.message}
                hint="Máx. 300 caracteres"
              />
            )}
          />
        </View>

        {errors.root && (
          <Text className="text-error text-sm text-center">{errors.root.message}</Text>
        )}

        <Button
          label="Crear cuenta"
          onPress={handleSubmit(onSubmit)}
          isLoading={register.isPending}
          fullWidth
          size="lg"
        />

        <View className="flex-row justify-center gap-x-1 pb-4">
          <Text className="text-neutral-500">¿Ya tenés cuenta?</Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text className="text-primary font-semibold">Iniciá sesión</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
