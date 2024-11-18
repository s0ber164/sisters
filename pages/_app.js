import '../styles/globals.css';
import { ProductProvider } from '../context/ProductContext';
import { CategoryProvider } from '../context/CategoryContext';
import { Libre_Baskerville } from 'next/font/google';

const libreBaskerville = Libre_Baskerville({
  weight: ['400', '700'],
  subsets: ['latin'],
});

function MyApp({ Component, pageProps }) {
  return (
    <ProductProvider>
      <CategoryProvider>
        <main className={libreBaskerville.className}>
          <Component {...pageProps} />
        </main>
      </CategoryProvider>
    </ProductProvider>
  );
}

export default MyApp;
