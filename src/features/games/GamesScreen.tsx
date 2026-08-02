import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import ReorderableList, {
  type ReorderableListReorderEvent,
  useReorderableDrag,
} from 'react-native-reorderable-list';

import { EmptyState } from '../../components/EmptyState';
import { OptionChips } from '../../components/OptionChips';
import { SearchInput } from '../../components/SearchInput';
import { filterWishlistGames } from '../../gameFilters';
import { reorderPriorities, type PriorityUpdate } from '../../gameOrder';
import { strings } from '../../strings';
import { colors } from '../../theme/colors';
import type { Game, MainTab, WishlistFilter } from '../../types';
import { GameCard } from './GameCard';

const wishlistFilterOptions: { label: string; value: WishlistFilter }[] = [
  { label: strings.wishlistFilters.all, value: 'all' },
  { label: strings.wishlistFilters.owned, value: 'owned' },
  { label: strings.wishlistFilters.toBuy, value: 'toBuy' },
];

type GamesScreenProps = {
  games: Game[];
  hasLoadError: boolean;
  isLoading: boolean;
  onAddGame: () => void;
  onDeleteGame: (game: Game) => void;
  onEditGame: (game: Game) => void;
  onQuickStep: (game: Game) => void;
  onReorder: (updates: PriorityUpdate[]) => void;
  tab: MainTab;
};

type GameRowProps = {
  game: Game;
  onDelete: (game: Game) => void;
  onEdit: (game: Game) => void;
  onQuickStep: (game: Game) => void;
  tab: MainTab;
};

// Only the wishlist can be reordered, so only its rows subscribe to the drag gesture.
function DraggableGameRow({ game, onDelete, onEdit, onQuickStep, tab }: GameRowProps) {
  const drag = useReorderableDrag();

  return (
    <GameCard
      game={game}
      onDelete={onDelete}
      onLongPress={drag}
      onPress={onEdit}
      onQuickStep={onQuickStep}
      tab={tab}
    />
  );
}

export function GamesScreen({
  games,
  hasLoadError,
  isLoading,
  onAddGame,
  onDeleteGame,
  onEditGame,
  onQuickStep,
  onReorder,
  tab,
}: GamesScreenProps) {
  const [searchText, setSearchText] = useState('');
  const [wishlistFilter, setWishlistFilter] = useState<WishlistFilter>('all');
  const normalizedSearch = searchText.trim().toLowerCase();
  // The ownership filter belongs to the wishlist only; the played tab ignores it.
  const activeFilter: WishlistFilter = tab === 'wishlist' ? wishlistFilter : 'all';
  const visibleGames = filterWishlistGames(games, activeFilter).filter((game) =>
    game.name.toLowerCase().includes(normalizedSearch),
  );
  const isNarrowed = normalizedSearch.length > 0 || activeFilter !== 'all';

  function resetFilters() {
    setSearchText('');
    setWishlistFilter('all');
  }

  function handleReorder({ from, to }: ReorderableListReorderEvent) {
    onReorder(reorderPriorities(visibleGames, from, to));
  }

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
      {tab === 'wishlist' ? (
        <View style={styles.filterRow}>
          <OptionChips
            onSelect={setWishlistFilter}
            options={wishlistFilterOptions}
            selectedValue={wishlistFilter}
          />
        </View>
      ) : null}
      {isLoading ? (
        <View style={styles.centeredState}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : hasLoadError ? (
        <View style={styles.centeredState}>
          <Text style={styles.errorText}>{strings.list.loadError}</Text>
        </View>
      ) : visibleGames.length === 0 ? (
        isNarrowed ? (
          <EmptyState
            message={strings.empty.filtered.message}
            onReset={resetFilters}
            resetLabel={strings.actions.resetFilters}
            title={strings.empty.filtered.title}
          />
        ) : (
          <EmptyState
            message={strings.empty[tab].message}
            title={strings.empty[tab].title}
          />
        )
      ) : (
        <ReorderableList
          contentContainerStyle={styles.listContent}
          data={visibleGames}
          keyExtractor={(game) => game.id}
          keyboardShouldPersistTaps="handled"
          onReorder={handleReorder}
          renderItem={({ item }) =>
            tab === 'wishlist' ? (
              <DraggableGameRow
                game={item}
                onDelete={onDeleteGame}
                onEdit={onEditGame}
                onQuickStep={onQuickStep}
                tab={tab}
              />
            ) : (
              <GameCard
                game={item}
                onDelete={onDeleteGame}
                onPress={onEditGame}
                onQuickStep={onQuickStep}
                tab={tab}
              />
            )
          }
          style={styles.list}
        />
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
  filterRow: {
    marginBottom: 12,
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
  // Only a fixed top line, as in GymBro. Rows slide under it and carry their own
  // frames, so a single row looks like one element rather than a half empty panel.
  list: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flex: 1,
    marginTop: 2,
  },
  // Row spacing lives on the row itself rather than as a gap here: the drag
  // animation measures whole cells, and a container gap sits outside them.
  listContent: {
    flexGrow: 1,
    paddingBottom: 16,
    paddingTop: 10,
  },
  pressedButton: {
    opacity: 0.7,
  },
});
