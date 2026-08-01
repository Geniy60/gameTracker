import { QueryClientProvider } from '@tanstack/react-query';

import { AppNavigator } from './src/AppNavigator';
import { queryClient } from './src/queryClient';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppNavigator />
    </QueryClientProvider>
  );
}
