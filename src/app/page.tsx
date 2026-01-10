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
  CircularProgress,
} from '@mui/material';
import { loginSchema, type LoginFormData } from '@/schemas/auth.schema';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { handleSubmit, register, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsSubmitting(true);
      await login(data);
      router.push('/dashboard');
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Credenciais incorretas';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(onSubmit)();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="background.default">
        <CircularProgress />
      </Box>
    );
  }

  if (user) return null;

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2, bgcolor: 'background.default' }}>
      <Card sx={{ maxWidth: 420, width: '100%' }}>
        <CardContent>
          <Typography variant="h5" component="h1" sx={{ mb: 3, fontWeight: 'bold' }}>
            OS System
          </Typography>

          <Box component="form" onSubmit={handleFormSubmit} noValidate>
            <Stack spacing={2}>
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
              <Button type="submit" variant="contained" disabled={isSubmitting} sx={{ mt: 2 }}>
                {isSubmitting ? 'Entrando...' : 'Entrar'}
              </Button>

              <Stack direction="row" spacing={1} justifyContent="center">
                <Typography variant="body2">Não tem uma conta?</Typography>
                <Link href="/register" style={{ textDecoration: 'none' }}>
                  <Typography variant="body2" sx={{ color: 'primary.main', cursor: 'pointer' }}>
                    Registre-se
                  </Typography>
                </Link>
              </Stack>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}