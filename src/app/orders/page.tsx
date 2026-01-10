'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box, Container, Typography, Grid, Card, CardContent, Button, Stack, TextField, CircularProgress,
} from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrdersContext';
import { orderCreateSchema, type OrderCreateForm } from '@/schemas/order.schema';
import Navbar from '@/components/Navbar';

export default function OrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { orders, fetchOrders, createOrder, loading } = useOrders();

  const { handleSubmit, register, formState: { errors, isSubmitting }, reset } = useForm<OrderCreateForm>({
    resolver: zodResolver(orderCreateSchema),
  });

  useEffect(() => {
    if (!authLoading && user) fetchOrders();
    if (!authLoading && !user) router.push('/');
  }, [authLoading, user, fetchOrders, router]);

  const onSubmit = async (data: OrderCreateForm) => {
    try {
      await createOrder(data);
      reset();
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) return null;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h5" gutterBottom>Ordens de Serviço</Typography>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>Nova OS</Typography>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={2}>
                <TextField
                  label="Título"
                  error={!!errors.title}
                  helperText={errors.title?.message}
                  {...register('title')}
                />
                <TextField
                  label="Descrição"
                  multiline
                  minRows={3}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                  {...register('description')}
                />
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando...' : 'Criar OS'}
                </Button>
              </Stack>
            </form>
          </CardContent>
        </Card>

        <Typography variant="subtitle1" sx={{ mt: 4, mb: 2 }}>
          Ordens Existentes
        </Typography>
        <Grid container spacing={2}>
          {orders.length === 0 ? (
            <Grid item xs={12}>
              <Typography color="text.secondary">Nenhuma OS criada ainda.</Typography>
            </Grid>
          ) : (
            orders.map((order) => (
              <Grid item xs={12} sm={6} key={order.id}>
                <Card 
                  onClick={() => router.push(`/orders/${order.id}`)} 
                  sx={{ cursor: 'pointer', '&:hover': { boxShadow: 3 } }}
                >
                  <CardContent>
                    <Typography variant="subtitle1">{order.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {order.description?.substring(0, 50)}...
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Status: {order.status}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Container>
    </Box>
  );
}