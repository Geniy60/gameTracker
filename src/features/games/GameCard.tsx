import { Ionicons } from '@expo/vector-icons';
import { type ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { createQuickStep, type QuickStepKind } from '../../gameActions';
import { hasMultiplePlatforms } from '../../gamePlatforms';
import { strings } from '../../strings';
import { colors } from '../../theme/colors';
import type { Game, MainTab } from '../../types';

type GameCardProps = {
  game: Game;
  // Set on the wishlist only, where a long press starts a drag.
  onLongPress?: () => void;
  onDelete: (game: Game) => void;
  onPress: (game: Game) => void;
  onQuickStep: (game: Game) => void;
  tab: MainTab;
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

// Metadata that every row in the current tab would repeat is left out.
function createMetaParts(game: Game, tab: MainTab): string[] {
  const parts: string[] = [];

  if (hasMultiplePlatforms()) {
    parts.push(strings.platforms[game.platform]);
  }

  if (game.access !== null) {
    parts.push(strings.access[game.access]);
  }

  if (game.isPlayed && tab !== 'played') {
    parts.push(strings.list.playedMark);
  }

  if (game.rating !== null) {
    parts.push(strings.list.ratingValue(game.rating));
  }

  return parts;
}

export function GameCard({
  game,
  onLongPress,
  onDelete,
  onPress,
  onQuickStep,
  tab,
}: GameCardProps) {
  const metaParts = createMetaParts(game, tab);
  const quickStep = createQuickStep(game);

  return (
    <Pressable
      delayLongPress={dragHoldDelayMs}
      onLongPress={onLongPress}
      onPress={() => onPress(game)}
      style={({ pressed }) => [styles.row, pressed && styles.pressedRow]}
    >
      <View style={styles.info}>
        <Text numberOfLines={1} style={styles.name}>
          {game.name}
        </Text>
        {metaParts.length > 0 ? (
          <Text numberOfLines={1} style={styles.meta}>
            {metaParts.join(' · ')}
          </Text>
        ) : null}
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
    justifyContent: 'space-between',
    marginBottom: 8,
    minHeight: 52,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pressedRow: {
    opacity: 0.6,
  },
  info: {
    flex: 1,
    paddingRight: 10,
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
