'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from './ThemeProvider';
import { QueryProvider } from './QueryProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { OrdersProvider } from '@/contexts/OrdersContext';
import { Toaster } from 'react-hot-toast';

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <AuthProvider>
          <OrdersProvider>
            {children}
            <Toaster position="top-right" />
          </OrdersProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}