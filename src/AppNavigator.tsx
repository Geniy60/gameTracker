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

import { type AppAlertButton, showAppAlert } from './appAlert';
import { AppAlertHost } from './components/AppAlertHost';
import { MainTabs } from './components/MainTabs';
import { GameFormScreen } from './features/games/GameFormScreen';
import { GamesScreen } from './features/games/GamesScreen';
import { findDuplicateGame } from './gameDuplicates';
import { filterGamesByTab, findTabForGame, selectGamesForTab } from './gameFilters';
import { nextPriority, reorderPriorities, type PriorityUpdate } from './gameOrder';
import type { RootStackParamList } from './navigationTypes';
import { invalidateGameQueries, queryKeys } from './queryClient';
import { findCoverUrl } from './services/steamGridDb';
import {
  deleteGame,
  loadGames,
  saveGame,
  saveGameCover,
  saveGamePriorities,
} from './services/gamesService';
import { strings } from './strings';
import { colors } from './theme/colors';
import type { Game, GameAccess, GameProgress, MainTab } from './types';

// The choices behind the access button on a row, in the order they are offered.
// "No access" comes last: it is the way back from a wrong tap, not a normal pick.
const accessChoices: { access: GameAccess | null; label: string }[] = [
  { access: 'purchased', label: strings.access.purchased },
  { access: 'subscription', label: strings.access.subscription },
  { access: 'friend', label: strings.access.friend },
  { access: null, label: strings.gameForm.accessNone },
];

// 'none' is not offered: this entry moves a game forward or corrects which of the two
// states it reached. Sending a game back to the wishlist is a decision for the form.
const progressChoices: { label: string; progress: GameProgress }[] = [
  { progress: 'played', label: strings.progress.played },
  { progress: 'finished', label: strings.progress.finished },
];

const Stack = createStackNavigator<RootStackParamList>();
// Left to right order of the swipe pager. Must match the tab row.
const tabOrder: MainTab[] = ['wishlist', 'played'];

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
  const { width: pageWidth } = useWindowDimensions();
  const pagerRef = useRef<ScrollView>(null);
  const gamesQuery = useQuery({ queryKey: queryKeys.games, queryFn: loadGames });
  const games = gamesQuery.data ?? [];
  // Split once: both the pager pages and the tab counters need the same two lists.
  const gamesByTab: Record<MainTab, Game[]> = {
    wishlist: selectGamesForTab(games, 'wishlist'),
    played: selectGamesForTab(games, 'played'),
  };
  const tabCounts: Record<MainTab, number> = {
    wishlist: gamesByTab.wishlist.length,
    played: gamesByTab.played.length,
  };

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

  async function handleSaveGame(game: Game): Promise<boolean> {
    try {
      await saveGame(game);
      await invalidateGameQueries(queryClient);
      void fetchMissingCover(game);
      return true;
    } catch {
      showAppAlert(strings.alerts.saveTitle, strings.alerts.saveMessage);
      return false;
    }
  }

  // Deliberately not awaited by the caller: the cover is optional, and two requests
  // to a foreign server would otherwise hold the form open after every save.
  async function fetchMissingCover(game: Game) {
    if (game.coverUrl !== null) {
      return;
    }

    const coverUrl = await findCoverUrl(game.name);

    if (coverUrl === null) {
      return;
    }

    try {
      await saveGameCover(game.id, coverUrl);
      await invalidateGameQueries(queryClient);
    } catch {
      // A missing cover is not worth an error dialog.
    }
  }

  // The new order is written into the cache first: waiting for the round trip would
  // let the list snap back to the old order right after the finger is lifted.
  async function handleReorder(updates: PriorityUpdate[]) {
    if (updates.length === 0) {
      return;
    }

    queryClient.setQueryData<Game[]>(queryKeys.games, (current) =>
      current?.map((game) => {
        const update = updates.find((candidate) => candidate.id === game.id);

        return update === undefined ? game : { ...game, priority: update.priority };
      }),
    );

    try {
      await saveGamePriorities(updates);
    } catch {
      showAppAlert(strings.alerts.saveTitle, strings.alerts.saveMessage);
    } finally {
      await invalidateGameQueries(queryClient);
    }
  }

  // Every row action lives here rather than as its own button on the card. Nothing is
  // guessed: each entry says what it does, which is what the deleted quick-step button
  // failed to do. Moving to the top is offered on the wishlist only, since the played
  // tab is sorted by name and priority means nothing there.
  function openRowActions(game: Game) {
    const buttons: AppAlertButton[] = [];

    if (game.progress === 'none') {
      buttons.push({
        text: strings.actions.moveToTop,
        onPress: () => moveGameToTop(game),
      });
    }

    buttons.push(
      { text: strings.actions.access, onPress: () => chooseAccess(game) },
      { text: strings.actions.progress, onPress: () => chooseProgress(game) },
      {
        text: strings.actions.delete,
        style: 'destructive',
        onPress: () => confirmDeleteGame(game),
      },
      { text: strings.actions.cancel, style: 'cancel' },
    );

    showAppAlert(game.name, undefined, buttons);
  }

  // The queue is edited by dragging, which is fine for a nudge and painful across 74
  // rows. This is the one move long enough to be worth naming.
  function moveGameToTop(game: Game) {
    const wishlist = gamesByTab.wishlist;
    const fromIndex = wishlist.findIndex((candidate) => candidate.id === game.id);

    if (fromIndex <= 0) {
      return;
    }

    void handleReorder(reorderPriorities(wishlist, fromIndex, 0));
  }

  // Asks instead of acting, so one tap can never set the wrong kind of ownership, and
  // the same entry is how it is corrected later.
  function chooseAccess(game: Game) {
    showAppAlert(strings.alerts.accessTitle, game.name, [
      ...accessChoices.map((choice) => ({
        text: choice.label,
        onPress: () => void handleSaveGame({ ...game, access: choice.access }),
      })),
      { text: strings.actions.cancel, style: 'cancel' as const },
    ]);
  }

  // Asks which of the two states the game reached rather than guessing. On the
  // wishlist the question doubles as the confirmation this move needs, since it takes
  // the game out of the list being looked at.
  function chooseProgress(game: Game) {
    showAppAlert(strings.alerts.progressTitle, game.name, [
      ...progressChoices.map((choice) => ({
        text: choice.label,
        onPress: () => void handleSaveGame({ ...game, progress: choice.progress }),
      })),
      { text: strings.actions.cancel, style: 'cancel' as const },
    ]);
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
            <MainTabs activeTab={activeTab} counts={tabCounts} onSelectTab={openTab} />
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
                    games={gamesByTab[tab]}
                    hasLoadError={gamesQuery.isError}
                    isLoading={gamesQuery.isLoading}
                    onAddGame={() =>
                      navigation.navigate('GameForm', { game: null, sourceTab: tab })
                    }
                    onEditGame={(game) =>
                      navigation.navigate('GameForm', { game, sourceTab: tab })
                    }
                    onOpenActions={openRowActions}
                    onReorder={(updates) => void handleReorder(updates)}
                    tab={tab}
                  />
                </View>
              ))}
            </ScrollView>
          </SafeAreaView>
        )}
      </Stack.Screen>
      <Stack.Screen name="GameForm">
        {({ navigation, route }) => {
          function saveAndClose(game: Game) {
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
          }

          // A list of 167 games is well past what anyone remembers, and most of it
          // arrived from an import nobody typed. Adding something already in there
          // is easy to do and hard to notice afterwards. The warning names the tab
          // the game is already in, since finding it is the usual next question.
          //
          // It asks rather than refuses: two rows under one name are sometimes
          // wanted, and the app has no business being certain about it.
          function handleSave(game: Game) {
            const duplicate = findDuplicateGame(games, game.name, game.id);

            if (duplicate === null) {
              saveAndClose(game);
              return;
            }

            showAppAlert(
              strings.alerts.duplicateTitle,
              strings.alerts.duplicateMessage(
                duplicate.name,
                strings.tabs[findTabForGame(duplicate)],
              ),
              [
                { text: strings.actions.cancel, style: 'cancel' },
                { text: strings.actions.save, onPress: () => saveAndClose(game) },
              ],
            );
          }

          return (
            <GameFormScreen
              game={route.params.game}
              newGamePriority={nextPriority(games)}
              onBack={() => navigation.goBack()}
              onSave={handleSave}
              sourceTab={route.params.sourceTab}
            />
          );
        }}
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
