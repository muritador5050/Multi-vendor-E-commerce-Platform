import { createRoot } from 'react-dom/client';
import { Provider } from '@/components/ui/provider.tsx';
import App from './App.tsx';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContextService.tsx';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

const AppProviders = ({ children }: { children: React.ReactNode }) => (
  <Provider>
    <Router>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </AuthProvider>
    </Router>
  </Provider>
);

createRoot(document.getElementById('root')!).render(
  <AppProviders>
    <App />
  </AppProviders>
);
