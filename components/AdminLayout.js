import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Menu,
  MenuItem,
  Container,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const AdminLayout = ({ children }) => {
  const [productsAnchorEl, setProductsAnchorEl] = useState(null);
  const router = useRouter();

  const handleProductsClick = (event) => {
    setProductsAnchorEl(event.currentTarget);
  };

  const handleProductsClose = () => {
    setProductsAnchorEl(null);
  };

  const isActive = (path) => router.pathname === path;
  const isProductsActive = router.pathname.startsWith('/admin/products');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" color="default" elevation={1}>
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <Typography
              variant="h6"
              component={Link}
              href="/"
              sx={{
                mr: 4,
                textDecoration: 'none',
                color: 'text.primary',
                fontWeight: 'bold',
              }}
            >
              SIS PROPS
            </Typography>

            <Button
              component={Link}
              href="/admin"
              color={isActive('/admin') ? 'primary' : 'inherit'}
              sx={{ mr: 2 }}
            >
              Dashboard
            </Button>

            <Button
              color={isProductsActive ? 'primary' : 'inherit'}
              onClick={handleProductsClick}
              endIcon={<KeyboardArrowDownIcon />}
            >
              Products
            </Button>
            <Menu
              anchorEl={productsAnchorEl}
              open={Boolean(productsAnchorEl)}
              onClose={handleProductsClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
            >
              <MenuItem
                component={Link}
                href="/admin/products"
                onClick={handleProductsClose}
                selected={isActive('/admin/products')}
              >
                Manage Products
              </MenuItem>
              <MenuItem
                component={Link}
                href="/admin/products/upload"
                onClick={handleProductsClose}
                selected={isActive('/admin/products/upload')}
              >
                Upload Products
              </MenuItem>
            </Menu>

            <Button
              component={Link}
              href="/admin/categories"
              color={isActive('/admin/categories') ? 'primary' : 'inherit'}
              sx={{ mr: 2 }}
            >
              Categories
            </Button>

            <Button
              component={Link}
              href="/"
              color="primary"
              variant="contained"
              sx={{ ml: 'auto' }}
            >
              View Site
            </Button>
          </Toolbar>
        </Container>
      </AppBar>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          p: 3,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AdminLayout;
