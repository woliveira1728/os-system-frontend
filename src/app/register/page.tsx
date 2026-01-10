'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { registerSchema, type RegisterFormData } from '@/schemas/auth.schema';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading, register: registerUser } = useAuth();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { handleSubmit, register, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError('');
      setIsSubmitting(true);
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
      });
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Erro ao registrar';
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="background.default"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (user) {
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        p: 2,
        bgcolor: 'background.default',
      }}
    >
      <Card sx={{ maxWidth: 420, width: '100%' }}>
        <CardContent>
          <Typography variant="h5" component="h1" sx={{ mb: 3, fontWeight: 'bold' }}>
            Criar Conta
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2}>
              <TextField
                label="Nome"
                fullWidth
                disabled={isSubmitting}
                error={!!errors.name}
                helperText={errors.name?.message}
                {...register('name')}
              />
              <TextField
                label="Email"
                type="email"
                fullWidth
                disabled={isSubmitting}
                error={!!errors.email}
                helperText={errors.email?.message}
                {...register('email')}
              />
              <TextField
                label="Senha"
                type="password"
                fullWidth
                disabled={isSubmitting}
                error={!!errors.password}
                helperText={errors.password?.message}
                {...register('password')}
              />
              <TextField
                label="Confirmar Senha"
                type="password"
                fullWidth
                disabled={isSubmitting}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                sx={{ mt: 2 }}
              >
                {isSubmitting ? 'Registrando...' : 'Registrar'}
              </Button>

              <Stack direction="row" spacing={1} justifyContent="center">
                <Typography variant="body2">Já tem uma conta?</Typography>
                <Link href="/" style={{ textDecoration: 'none' }}>
                  <Typography
                    variant="body2"
                    sx={{ color: 'primary.main', cursor: 'pointer' }}
                  >
                    Faça login
                  </Typography>
                </Link>
              </Stack>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}