'use client';

import { 
  AppBar, Toolbar, Typography, Button, Box, Menu, MenuItem, Avatar, IconButton, Drawer, List, ListItem, ListItemText, Divider 
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
  };

  const toggleDrawer = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleDrawerClose = () => {
    setMobileOpen(false);
  };

  if (!user) return null;

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          {/* Menu Hamburguer - visível apenas em mobile */}
          <IconButton
            color="inherit"
            aria-label="abrir menu"
            edge="start"
            onClick={toggleDrawer}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo */}
          <Link href="/dashboard" style={{ textDecoration: 'none', color: 'inherit', flex: 1 }}>
            <Typography variant="h6" component="div" sx={{ cursor: 'pointer' }}>
              OS System
            </Typography>
          </Link>

          {/* Menu Desktop - oculto em mobile */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 2 }}>
            <Link href="/dashboard" style={{ textDecoration: 'none' }}>
              <Button color="inherit">Dashboard</Button>
            </Link>
            <Link href="/orders" style={{ textDecoration: 'none' }}>
              <Button color="inherit">Ordens de Serviço</Button>
            </Link>
          </Box>

          {/* Perfil do usuário */}
          <Box sx={{ ml: { xs: 0, sm: 4 } }}>
            <IconButton
              onClick={handleMenu}
              sx={{ p: 0 }}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                {user.name.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
              <MenuItem disabled>
                <Box>
                  <Typography variant="body2" fontWeight="bold">{user.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                </Box>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>Sair</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer Mobile */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerClose}
        sx={{ display: { sm: 'none' } }}
      >
        <Box sx={{ width: 250 }} role="presentation">
          <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
            <Typography variant="h6">OS System</Typography>
            <Typography variant="caption">{user.name}</Typography>
          </Box>
          <Divider />
          <List>
            <Link href="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
              <ListItem button onClick={handleDrawerClose}>
                <ListItemText primary="Dashboard" />
              </ListItem>
            </Link>
            <Link href="/orders" style={{ textDecoration: 'none', color: 'inherit' }}>
              <ListItem button onClick={handleDrawerClose}>
                <ListItemText primary="Ordens de Serviço" />
              </ListItem>
            </Link>
          </List>
          <Divider />
          <List>
            <ListItem button onClick={() => { handleLogout(); handleDrawerClose(); }}>
              <ListItemText primary="Sair" />
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
}