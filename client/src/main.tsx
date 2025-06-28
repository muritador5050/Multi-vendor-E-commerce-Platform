import { createRoot } from 'react-dom/client';
import { Provider } from '@/components/ui/provider.tsx';
import App from './App.tsx';
import { CartProvider } from './context/CartContext.tsx';

createRoot(document.getElementById('root')!).render(
  <Provider>
    <CartProvider>
      <App />
    </CartProvider>
  </Provider>
);
