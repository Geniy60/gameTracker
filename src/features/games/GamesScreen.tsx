import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { EmptyState } from '../../components/EmptyState';
import { SearchInput } from '../../components/SearchInput';
import { strings } from '../../strings';
import { colors } from '../../theme/colors';
import type { Game, MainTab } from '../../types';
import { GameCard } from './GameCard';

type GamesScreenProps = {
  games: Game[];
  hasLoadError: boolean;
  isLoading: boolean;
  onAddGame: () => void;
  onDeleteGame: (game: Game) => void;
  onEditGame: (game: Game) => void;
  onQuickStep: (game: Game) => void;
  tab: MainTab;
};

export function GamesScreen({
  games,
  hasLoadError,
  isLoading,
  onAddGame,
  onDeleteGame,
  onEditGame,
  onQuickStep,
  tab,
}: GamesScreenProps) {
  const [searchText, setSearchText] = useState('');
  const normalizedSearch = searchText.trim().toLowerCase();
  const visibleGames = games.filter((game) =>
    game.name.toLowerCase().includes(normalizedSearch),
  );

  return (
    <View style={styles.screen}>
      <View style={styles.toolbar}>
        <SearchInput
          onChangeText={setSearchText}
          placeholder={strings.search.games}
          value={searchText}
        />
        <Pressable
          accessibilityLabel={strings.accessibility.addGame}
          onPress={onAddGame}
          style={({ pressed }) => [styles.addButton, pressed && styles.pressedButton]}
        >
          <Ionicons color={colors.primary} name="add" size={26} />
        </Pressable>
      </View>
      {isLoading ? (
        <View style={styles.centeredState}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : hasLoadError ? (
        <View style={styles.centeredState}>
          <Text style={styles.errorText}>{strings.list.loadError}</Text>
        </View>
      ) : visibleGames.length === 0 ? (
        normalizedSearch.length > 0 ? (
          <EmptyState
            message={strings.empty.filtered.message}
            onReset={() => setSearchText('')}
            resetLabel={strings.actions.resetSearch}
            title={strings.empty.filtered.title}
          />
        ) : (
          <EmptyState
            message={strings.empty[tab].message}
            title={strings.empty[tab].title}
          />
        )
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          style={styles.list}
        >
          {visibleGames.map((game, index) => (
            <GameCard
              game={game}
              isFirst={index === 0}
              key={game.id}
              onDelete={onDeleteGame}
              onPress={onEditGame}
              onQuickStep={onQuickStep}
              tab={tab}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 20,
  },
  toolbar: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: colors.active,
    borderColor: colors.activeBorder,
    borderRadius: 8,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  centeredState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  errorText: {
    color: colors.destructive,
    fontSize: 15,
    textAlign: 'center',
  },
  // The border sits on the scroller itself, so it stays put while rows slide under it.
  list: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flex: 1,
    marginTop: 2,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 24,
    paddingTop: 10,
  },
  pressedButton: {
    opacity: 0.7,
  },
});
