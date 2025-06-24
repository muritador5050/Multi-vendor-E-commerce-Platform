import { createRoot } from 'react-dom/client';
import { Provider } from '@/components/ui/provider.tsx';
import App from './App.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { AuthProvider } from './context/AuthProvider.tsx';

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <Provider>
      <CartProvider>
        <App />
      </CartProvider>
    </Provider>
  </AuthProvider>
);
