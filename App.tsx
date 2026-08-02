import { QueryClientProvider } from '@tanstack/react-query';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AppNavigator } from './src/AppNavigator';
import { queryClient } from './src/queryClient';

// react-native-gesture-handler needs this root view on Android, and the wishlist
// drag gesture depends on it.
export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <QueryClientProvider client={queryClient}>
        <AppNavigator />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
