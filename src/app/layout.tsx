import type { Metadata } from 'next';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { AppProvider } from '@/providers/AppProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'OS System',
  description: 'Sistema de Ordem de Serviço',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <AppRouterCacheProvider>
          <AppProvider>
            {children}
          </AppProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}