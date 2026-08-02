import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { hasMultiplePlatforms } from '../../gamePlatforms';
import { strings } from '../../strings';
import { colors } from '../../theme/colors';
import type { Game } from '../../types';

type GameCardProps = {
  game: Game;
  // Set on the wishlist only, where a long press starts a drag.
  onLongPress?: () => void;
  onChangeAccess: (game: Game) => void;
  onDelete: (game: Game) => void;
  onMarkPlayed: (game: Game) => void;
  onPress: (game: Game) => void;
};

// The default 500 ms feels sluggish when the long press is how the wishlist is
// reordered. Short enough to react quickly, long enough not to fire on a tap.
const dragHoldDelayMs = 220;

// One line per property, under the name. Anything the game does not have is left
// out, as is metadata that every row in the current tab would repeat. The note goes
// last because it is the only free text and can run onto a second line.
function createMetaLines(game: Game): string[] {
  const lines: string[] = [];

  if (hasMultiplePlatforms()) {
    lines.push(strings.platforms[game.platform]);
  }

  if (game.access !== null) {
    lines.push(strings.access[game.access]);
  } else if (!game.isPlayed) {
    // A played game without access needs no buying, so the mark is for the
    // wishlist only.
    lines.push(strings.list.toBuyMark);
  }

  if (game.rating !== null) {
    lines.push(strings.list.ratingValue(game.rating));
  }

  if (game.note.length > 0) {
    lines.push(game.note);
  }

  return lines;
}

export function GameCard({
  game,
  onLongPress,
  onChangeAccess,
  onDelete,
  onMarkPlayed,
  onPress,
}: GameCardProps) {
  const metaLines = createMetaLines(game);

  return (
    <Pressable
      delayLongPress={dragHoldDelayMs}
      onLongPress={onLongPress}
      onPress={() => onPress(game)}
      style={({ pressed }) => [styles.row, pressed && styles.pressedRow]}
    >
      {game.coverUrl === null ? (
        <View style={[styles.cover, styles.coverPlaceholder]}>
          <Ionicons color={colors.muted} name="game-controller-outline" size={34} />
        </View>
      ) : (
        // expo-image keeps the picture in its own disk cache, so scrolling the list
        // does not refetch it.
        <Image contentFit="cover" source={game.coverUrl} style={styles.cover} />
      )}
      <View style={styles.info}>
        <Text numberOfLines={2} style={styles.name}>
          {game.name}
        </Text>
        {metaLines.map((line, index) => (
          // Index keys: the lines are derived fresh from the game every render and
          // two of them can hold the same text.
          <Text key={index} numberOfLines={1} style={styles.meta}>
            {line}
          </Text>
        ))}
      </View>
      <View style={styles.actions}>
        {/* Both buttons stay put for as long as the game is unplayed. The access one
            never disappears after a purchase: it is how the kind of ownership is set
            and later changed. */}
        {game.isPlayed ? null : (
          <>
            <Pressable
              accessibilityLabel={strings.accessibility.changeAccess}
              hitSlop={6}
              onPress={() => onChangeAccess(game)}
              style={({ pressed }) => [
                styles.actionButton,
                pressed && styles.pressedButton,
              ]}
            >
              <Ionicons color={colors.primary} name="bag-outline" size={21} />
            </Pressable>
            <Pressable
              accessibilityLabel={strings.accessibility.markPlayed}
              hitSlop={6}
              onPress={() => onMarkPlayed(game)}
              style={({ pressed }) => [
                styles.actionButton,
                pressed && styles.pressedButton,
              ]}
            >
              <Ionicons color={colors.primary} name="game-controller-outline" size={21} />
            </Pressable>
          </>
        )}
        <Pressable
          accessibilityLabel={strings.accessibility.deleteGame}
          hitSlop={6}
          onPress={() => onDelete(game)}
          style={({ pressed }) => [
            styles.actionButton,
            styles.destructiveActionButton,
            pressed && styles.pressedButton,
          ]}
        >
          <Ionicons color={colors.destructive} name="trash-outline" size={21} />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Each row is its own framed element, like a GymBro tile, just denser. A list of
  // one then looks like one element instead of a mostly empty container.
  // Top aligned rather than centred: next to a 132 tall cover, three short lines
  // floating in the middle read as unfinished.
  row: {
    alignItems: 'flex-start',
    backgroundColor: colors.subtleBackground,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 8,
    minHeight: 148,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pressedRow: {
    opacity: 0.6,
  },
  // 2:3, matching the 600x900 box art SteamGridDB returns, so nothing is cropped.
  // At this size a three times density screen asks for about 264x396 pixels, which
  // is what the stored thumbnail holds, so it still does not need the full picture.
  cover: {
    backgroundColor: colors.panel,
    borderRadius: 6,
    height: 132,
    width: 88,
  },
  coverPlaceholder: {
    alignItems: 'center',
    borderColor: colors.border,
    borderWidth: 1,
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  meta: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2,
  },
  actions: {
    alignItems: 'center',
    flexDirection: 'column',
    gap: 6,
  },
  // The accent frame the add button and the active tab already use, so the buttons
  // read as controls rather than as dim outlines next to the destructive one.
  // 40x40 is the roomier of the two sizes UI_RULES gives, which suits a 148 tall row.
  actionButton: {
    alignItems: 'center',
    backgroundColor: colors.active,
    borderColor: colors.activeBorder,
    borderRadius: 8,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  destructiveActionButton: {
    borderColor: colors.destructiveBorder,
  },
  pressedButton: {
    opacity: 0.7,
  },
});
