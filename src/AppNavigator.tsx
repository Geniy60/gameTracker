import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from './components/AppHeader';
import { MainTabs } from './components/MainTabs';
import { GameFormScreen } from './features/games/GameFormScreen';
import { GamesScreen } from './features/games/GamesScreen';
import type { RootStackParamList } from './navigationTypes';
import { invalidateGameQueries, queryKeys } from './queryClient';
import { deleteGame, loadGames, saveGame } from './services/gamesService';
import { strings } from './strings';
import { colors } from './theme/colors';
import type { Game, MainTab } from './types';

const Stack = createStackNavigator<RootStackParamList>();
const MIN_REFRESH_FEEDBACK_MS = 600;

const navigationTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: colors.appBackground,
    border: colors.border,
    card: colors.appBackground,
    notification: colors.primary,
    primary: colors.primary,
    text: colors.text,
  },
};

export function AppNavigator() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavigationContainer theme={navigationTheme}>
        <MainStack />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

function MainStack() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<MainTab>('wishlist');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const gamesQuery = useQuery({ queryKey: queryKeys.games, queryFn: loadGames });
  const games = gamesQuery.data ?? [];

  useEffect(() => {
    if (gamesQuery.isError) {
      Alert.alert(strings.alerts.loadTitle, strings.alerts.loadMessage);
    }
  }, [gamesQuery.isError]);

  async function refreshGames() {
    if (isRefreshing) {
      return;
    }

    setIsRefreshing(true);
    const startedAt = Date.now();

    try {
      await invalidateGameQueries(queryClient);
    } finally {
      setTimeout(
        () => setIsRefreshing(false),
        Math.max(0, MIN_REFRESH_FEEDBACK_MS - (Date.now() - startedAt)),
      );
    }
  }

  async function handleSaveGame(game: Game): Promise<boolean> {
    try {
      await saveGame(game);
      await invalidateGameQueries(queryClient);
      return true;
    } catch {
      Alert.alert(strings.alerts.saveTitle, strings.alerts.saveMessage);
      return false;
    }
  }

  function confirmDeleteGame(game: Game) {
    Alert.alert(
      strings.alerts.deleteGameTitle,
      strings.alerts.deleteGameMessage(game.name),
      [
        { text: strings.actions.cancel, style: 'cancel' },
        {
          text: strings.actions.delete,
          style: 'destructive',
          onPress: () => {
            void deleteGame(game.id)
              .then(() => invalidateGameQueries(queryClient))
              .catch(() =>
                Alert.alert(strings.alerts.saveTitle, strings.alerts.saveMessage),
              );
          },
        },
      ],
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        animation: 'none',
        cardStyle: { backgroundColor: colors.appBackground },
        headerShown: false,
      }}
    >
      <Stack.Screen name="Home">
        {({ navigation }) => (
          <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={styles.safeArea}>
            <AppHeader isRefreshing={isRefreshing} onRefresh={() => void refreshGames()} />
            <MainTabs activeTab={activeTab} onSelectTab={setActiveTab} />
            <GamesScreen
              games={games.filter((game) => game.status === activeTab)}
              hasLoadError={gamesQuery.isError}
              isLoading={gamesQuery.isLoading}
              onAddGame={() =>
                navigation.navigate('GameForm', {
                  game: null,
                  initialStatus: activeTab,
                })
              }
              onDeleteGame={confirmDeleteGame}
              onEditGame={(game) =>
                navigation.navigate('GameForm', { game, initialStatus: game.status })
              }
              status={activeTab}
            />
          </SafeAreaView>
        )}
      </Stack.Screen>
      <Stack.Screen name="GameForm">
        {({ navigation, route }) => (
          <GameFormScreen
            game={route.params.game}
            initialStatus={route.params.initialStatus}
            onBack={() => navigation.goBack()}
            onSave={(game) => {
              void handleSaveGame(game).then((wasSaved) => {
                if (wasSaved) {
                  setActiveTab(game.status);
                  navigation.goBack();
                }
              });
            }}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.appBackground,
    flex: 1,
  },
});
