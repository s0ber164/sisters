import '../styles/globals.css';
import { ProductProvider } from '../context/ProductContext';
import { CategoryProvider } from '../context/CategoryContext';
import { Libre_Baskerville } from 'next/font/google';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const libreBaskerville = Libre_Baskerville({
  weight: ['400', '700'],
  subsets: ['latin'],
});

// Create a theme instance
const theme = createTheme({
  typography: {
    fontFamily: libreBaskerville.style.fontFamily,
  },
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ProductProvider>
        <CategoryProvider>
          <main className={libreBaskerville.className}>
            <Component {...pageProps} />
          </main>
        </CategoryProvider>
      </ProductProvider>
    </ThemeProvider>
  );
}

export default MyApp;
