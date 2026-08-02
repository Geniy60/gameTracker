import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import ReorderableList, {
  type ReorderableListReorderEvent,
  useReorderableDrag,
} from 'react-native-reorderable-list';

import { showAppAlert } from '../../appAlert';
import { EmptyState } from '../../components/EmptyState';
import { OptionChips } from '../../components/OptionChips';
import { SearchInput } from '../../components/SearchInput';
import { filterPlayedGames, filterWishlistGames } from '../../gameFilters';
import { reorderPriorities, type PriorityUpdate } from '../../gameOrder';
import { strings } from '../../strings';
import { colors } from '../../theme/colors';
import type { Game, MainTab, PlayedFilter, WishlistFilter } from '../../types';
import { GameCard } from './GameCard';
import { RandomGameDialog } from './RandomGameDialog';

// The library scales a dragged row up by default, which pushes its edges past the
// list bounds. Android clips there, so the side borders and rounded corners get cut
// off. Dropping the transform leaves the opacity dim as the drag feedback.
const dragCellAnimations = { transform: [] };

const wishlistFilterOptions: { label: string; value: WishlistFilter }[] = [
  { label: strings.wishlistFilters.all, value: 'all' },
  { label: strings.wishlistFilters.owned, value: 'owned' },
  { label: strings.wishlistFilters.toBuy, value: 'toBuy' },
];

const playedFilterOptions: { label: string; value: PlayedFilter }[] = [
  { label: strings.playedFilters.all, value: 'all' },
  { label: strings.playedFilters.finished, value: 'finished' },
  { label: strings.playedFilters.unfinished, value: 'unfinished' },
];

type GamesScreenProps = {
  games: Game[];
  hasLoadError: boolean;
  isLoading: boolean;
  onAddGame: () => void;
  onEditGame: (game: Game) => void;
  onOpenActions: (game: Game) => void;
  onReorder: (updates: PriorityUpdate[]) => void;
  tab: MainTab;
};

type GameRowProps = {
  game: Game;
  onEdit: (game: Game) => void;
  onOpenActions: (game: Game) => void;
};

// Rolling the same game twice in a row is the one result that feels broken, so the
// game on screen is left out of the draw whenever there is anything else to pick.
function pickRandomGame(candidates: Game[], previous: Game | null): Game | null {
  const pool =
    previous === null || candidates.length === 1
      ? candidates
      : candidates.filter((candidate) => candidate.id !== previous.id);

  return pool[Math.floor(Math.random() * pool.length)] ?? null;
}

// Only the wishlist can be reordered, so only its rows subscribe to the drag gesture.
function DraggableGameRow({ game, onEdit, onOpenActions }: GameRowProps) {
  const drag = useReorderableDrag();

  return (
    <GameCard
      game={game}
      onLongPress={drag}
      onOpenActions={onOpenActions}
      onPress={onEdit}
    />
  );
}

export function GamesScreen({
  games,
  hasLoadError,
  isLoading,
  onAddGame,
  onEditGame,
  onOpenActions,
  onReorder,
  tab,
}: GamesScreenProps) {
  const [searchText, setSearchText] = useState('');
  const [wishlistFilter, setWishlistFilter] = useState<WishlistFilter>('all');
  const [playedFilter, setPlayedFilter] = useState<PlayedFilter>('all');
  const [randomGame, setRandomGame] = useState<Game | null>(null);
  // The list sits inside the horizontal tab pager. The library's default drag gesture
  // has no axis limit and swallows the sideways swipe that changes tabs, so it is
  // replaced with one that only reacts to vertical movement. Memoized because the
  // library rebuilds its handlers whenever this object changes identity.
  const dragGesture = useMemo(
    () => Gesture.Pan().activeOffsetY([-10, 10]).failOffsetX([-10, 10]),
    [],
  );
  const normalizedSearch = searchText.trim().toLowerCase();
  // Each tab has its own quick filter: ownership on the wishlist, progress on the
  // played tab. Only the one belonging to this tab is applied.
  const isFiltered =
    tab === 'wishlist' ? wishlistFilter !== 'all' : playedFilter !== 'all';
  const filteredGames =
    tab === 'wishlist'
      ? filterWishlistGames(games, wishlistFilter)
      : filterPlayedGames(games, playedFilter);
  const visibleGames = filteredGames.filter((game) =>
    game.name.toLowerCase().includes(normalizedSearch),
  );
  const isNarrowed = normalizedSearch.length > 0 || isFiltered;
  // Reordering a narrowed list would move a game past rows the user cannot see, so
  // the result would not be the one the drag appeared to describe.
  const canReorder = tab === 'wishlist' && !isNarrowed;

  function resetFilters() {
    setSearchText('');
    setWishlistFilter('all');
    setPlayedFilter('all');
  }

  function handleReorder({ from, to }: ReorderableListReorderEvent) {
    onReorder(reorderPriorities(visibleGames, from, to));
  }

  // Draws from the whole wishlist, ignoring the search and the chips: the answer to
  // "what do I play now" should not depend on what happens to be on screen. Only
  // games with access take part, since a game that still has to be bought cannot be
  // started tonight.
  function rollRandomGame() {
    const candidates = games.filter((game) => game.access !== null);

    if (candidates.length === 0) {
      showAppAlert(strings.randomGame.emptyTitle, strings.randomGame.emptyMessage);
      return;
    }

    setRandomGame((previous) => pickRandomGame(candidates, previous));
  }

  function openRandomGame(game: Game) {
    setRandomGame(null);
    onEditGame(game);
  }

  return (
    <View style={styles.screen}>
      <View style={styles.toolbar}>
        <SearchInput
          onChangeText={setSearchText}
          placeholder={strings.search.games}
          value={searchText}
        />
        {/* The wishlist only: on the played tab there is nothing left to choose. */}
        {tab === 'wishlist' ? (
          <Pressable
            accessibilityLabel={strings.accessibility.pickRandomGame}
            onPress={rollRandomGame}
            style={({ pressed }) => [
              styles.toolbarButton,
              pressed && styles.pressedButton,
            ]}
          >
            <Ionicons color={colors.primary} name="dice-outline" size={24} />
          </Pressable>
        ) : null}
        <Pressable
          accessibilityLabel={strings.accessibility.addGame}
          onPress={onAddGame}
          style={({ pressed }) => [styles.toolbarButton, pressed && styles.pressedButton]}
        >
          <Ionicons color={colors.primary} name="add" size={26} />
        </Pressable>
      </View>
      <View style={styles.filterRow}>
        {tab === 'wishlist' ? (
          <OptionChips
            onSelect={setWishlistFilter}
            options={wishlistFilterOptions}
            selectedValue={wishlistFilter}
          />
        ) : (
          <OptionChips
            onSelect={setPlayedFilter}
            options={playedFilterOptions}
            selectedValue={playedFilter}
          />
        )}
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
          cellAnimations={dragCellAnimations}
          contentContainerStyle={styles.listContent}
          data={visibleGames}
          dragEnabled={canReorder}
          keyExtractor={(game) => game.id}
          keyboardShouldPersistTaps="handled"
          onReorder={handleReorder}
          panGesture={dragGesture}
          renderItem={({ item }) =>
            canReorder ? (
              <DraggableGameRow
                game={item}
                onEdit={onEditGame}
                onOpenActions={onOpenActions}
              />
            ) : (
              <GameCard
                game={item}
                onOpenActions={onOpenActions}
                onPress={onEditGame}
              />
            )
          }
          style={styles.list}
        />
      )}
      <RandomGameDialog
        game={randomGame}
        onClose={() => setRandomGame(null)}
        onOpen={openRandomGame}
        onReroll={rollRandomGame}
      />
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
  // The 44x44 accent frame every control in the app wears, shared by the add button
  // and the dice beside it.
  toolbarButton: {
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
