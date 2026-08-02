import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { type ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { createQuickStep, type QuickStepKind } from '../../gameActions';
import { hasMultiplePlatforms } from '../../gamePlatforms';
import { strings } from '../../strings';
import { colors } from '../../theme/colors';
import type { Game } from '../../types';

type GameCardProps = {
  game: Game;
  // Set on the wishlist only, where a long press starts a drag.
  onLongPress?: () => void;
  onDelete: (game: Game) => void;
  onPress: (game: Game) => void;
  onQuickStep: (game: Game) => void;
};

// The default 500 ms feels sluggish when the long press is how the wishlist is
// reordered. Short enough to react quickly, long enough not to fire on a tap.
const dragHoldDelayMs = 220;

const quickStepIcons: Record<
  QuickStepKind,
  ComponentProps<typeof Ionicons>['name']
> = {
  markOwned: 'bag-check-outline',
  markPlayed: 'checkmark-done-outline',
};

// One line per property, under the name. Metadata that every row in the current tab
// would repeat is left out.
function createMetaLines(game: Game): string[] {
  const lines: string[] = [];

  if (hasMultiplePlatforms()) {
    lines.push(strings.platforms[game.platform]);
  }

  if (game.access !== null) {
    lines.push(strings.access[game.access]);
  }

  if (game.rating !== null) {
    lines.push(strings.list.ratingValue(game.rating));
  }

  return lines;
}

export function GameCard({
  game,
  onLongPress,
  onDelete,
  onPress,
  onQuickStep,
}: GameCardProps) {
  const metaLines = createMetaLines(game);
  const quickStep = createQuickStep(game);

  return (
    <Pressable
      delayLongPress={dragHoldDelayMs}
      onLongPress={onLongPress}
      onPress={() => onPress(game)}
      style={({ pressed }) => [styles.row, pressed && styles.pressedRow]}
    >
      {game.coverUrl === null ? (
        <View style={[styles.cover, styles.coverPlaceholder]}>
          <Ionicons color={colors.muted} name="game-controller-outline" size={22} />
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
        {metaLines.map((line) => (
          <Text key={line} numberOfLines={1} style={styles.meta}>
            {line}
          </Text>
        ))}
      </View>
      <View style={styles.actions}>
        {quickStep === null ? null : (
          <Pressable
            accessibilityLabel={strings.accessibility[quickStep.kind]}
            hitSlop={6}
            onPress={() => onQuickStep(quickStep.game)}
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.pressedButton,
            ]}
          >
            <Ionicons
              color={colors.primary}
              name={quickStepIcons[quickStep.kind]}
              size={19}
            />
          </Pressable>
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
          <Ionicons color={colors.destructive} name="trash-outline" size={19} />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Each row is its own framed element, like a GymBro tile, just denser. A list of
  // one then looks like one element instead of a mostly empty container.
  row: {
    alignItems: 'center',
    backgroundColor: colors.subtleBackground,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 8,
    minHeight: 72,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pressedRow: {
    opacity: 0.6,
  },
  // Square rather than portrait or landscape: the cover source is not decided yet,
  // and a square crops both shapes without leaving empty bands.
  cover: {
    backgroundColor: colors.panel,
    borderRadius: 6,
    height: 56,
    width: 56,
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
    flexDirection: 'row',
    gap: 6,
  },
  // Darker than the row it sits on, so the buttons read as recessed rather than
  // disappearing into the list panel.
  actionButton: {
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  destructiveActionButton: {
    borderColor: colors.destructiveBorder,
  },
  pressedButton: {
    opacity: 0.7,
  },
});
