import { createRoot } from 'react-dom/client';
import { Provider } from '@/components/ui/provider.tsx';
import App from './App.tsx';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider.tsx';
import CartProvider from './context/CartContext.tsx';

const AppProviders = ({ children }: { children: React.ReactNode }) => (
  <Provider>
    <Router>
      <AuthProvider>
        <CartProvider>{children}</CartProvider>
      </AuthProvider>
    </Router>
  </Provider>
);

createRoot(document.getElementById('root')!).render(
  <AppProviders>
    <App />
  </AppProviders>
);
