'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrdersContext';
import { Box, Container, Typography, Grid, Card, CardContent, CircularProgress } from '@mui/material';
import Navbar from '@/components/Navbar';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const { orders, fetchOrders, loading: loadingOrders } = useOrders();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    } else if (user) {
      fetchOrders();
    }
  }, [user, loading, router, fetchOrders]);

  if (loading || loadingOrders) {
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
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Bem-vindo, {user.name}!
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Dashboard do Sistema de Ordem de Serviço
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Pedidos
                </Typography>
                <Typography variant="h5">{orders.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}