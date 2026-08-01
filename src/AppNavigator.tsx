import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { showAppAlert } from './appAlert';
import { AppAlertHost } from './components/AppAlertHost';
import { AppHeader } from './components/AppHeader';
import { MainTabs } from './components/MainTabs';
import { GameFormScreen } from './features/games/GameFormScreen';
import { GamesScreen } from './features/games/GamesScreen';
import { filterGamesByTab, findTabForGame } from './gameFilters';
import type { RootStackParamList } from './navigationTypes';
import { invalidateGameQueries, queryKeys } from './queryClient';
import { deleteGame, loadGames, saveGame } from './services/gamesService';
import { strings } from './strings';
import { colors } from './theme/colors';
import type { Game, MainTab } from './types';

const Stack = createStackNavigator<RootStackParamList>();
const MIN_REFRESH_FEEDBACK_MS = 600;
// Left to right order of the swipe pager. Must match the tab row.
const tabOrder: MainTab[] = ['wishlist', 'available', 'played'];

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
      <AppAlertHost />
    </SafeAreaProvider>
  );
}

function MainStack() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<MainTab>('wishlist');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { width: pageWidth } = useWindowDimensions();
  const pagerRef = useRef<ScrollView>(null);
  const gamesQuery = useQuery({ queryKey: queryKeys.games, queryFn: loadGames });
  const games = gamesQuery.data ?? [];

  // Tapping a tab jumps the pager. Swiping does the reverse through handlePagerScroll,
  // so the pager is never scrolled programmatically while a drag is in progress.
  function openTab(tab: MainTab) {
    setActiveTab(tab);
    pagerRef.current?.scrollTo({ animated: false, x: tabOrder.indexOf(tab) * pageWidth });
  }

  function handlePagerScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const nextTab = tabOrder[Math.round(event.nativeEvent.contentOffset.x / pageWidth)];

    if (nextTab !== undefined && nextTab !== activeTab) {
      setActiveTab(nextTab);
    }
  }

  useEffect(() => {
    if (gamesQuery.isError) {
      showAppAlert(strings.alerts.loadTitle, strings.alerts.loadMessage);
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
      showAppAlert(strings.alerts.saveTitle, strings.alerts.saveMessage);
      return false;
    }
  }

  function confirmDeleteGame(game: Game) {
    showAppAlert(
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
                showAppAlert(strings.alerts.saveTitle, strings.alerts.saveMessage),
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
            <MainTabs activeTab={activeTab} onSelectTab={openTab} />
            <ScrollView
              horizontal
              onMomentumScrollEnd={handlePagerScroll}
              onScroll={handlePagerScroll}
              pagingEnabled
              ref={pagerRef}
              scrollEventThrottle={16}
              showsHorizontalScrollIndicator={false}
              style={styles.pager}
            >
              {tabOrder.map((tab) => (
                <View key={tab} style={{ width: pageWidth }}>
                  <GamesScreen
                    games={filterGamesByTab(games, tab)}
                    hasLoadError={gamesQuery.isError}
                    isLoading={gamesQuery.isLoading}
                    onAddGame={() =>
                      navigation.navigate('GameForm', { game: null, sourceTab: tab })
                    }
                    onDeleteGame={confirmDeleteGame}
                    onEditGame={(game) =>
                      navigation.navigate('GameForm', { game, sourceTab: tab })
                    }
                    tab={tab}
                  />
                </View>
              ))}
            </ScrollView>
          </SafeAreaView>
        )}
      </Stack.Screen>
      <Stack.Screen name="GameForm">
        {({ navigation, route }) => (
          <GameFormScreen
            game={route.params.game}
            onBack={() => navigation.goBack()}
            onSave={(game) => {
              void handleSaveGame(game).then((wasSaved) => {
                if (!wasSaved) {
                  return;
                }

                // Saving can move a game out of the tab it was edited in.
                // Follow it instead of returning to a list it no longer belongs to.
                if (filterGamesByTab([game], activeTab).length === 0) {
                  openTab(findTabForGame(game));
                }

                navigation.goBack();
              });
            }}
            sourceTab={route.params.sourceTab}
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
  pager: {
    flex: 1,
  },
});
