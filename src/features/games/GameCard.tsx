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
  onDelete: (game: Game) => void;
  onPress: (game: Game) => void;
  onQuickStep: (game: Game) => void;
  tab: MainTab;
};

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
  onDelete,
  onPress,
  onQuickStep,
  tab,
}: GameCardProps) {
  const metaParts = createMetaParts(game, tab);
  const quickStep = createQuickStep(game);

  return (
    <Pressable
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
  // Rows are separated by a hairline instead of being individual cards, so the
  // list stays dense. The top border also separates the first row from the toolbar.
  row: {
    alignItems: 'center',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 56,
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
  actionButton: {
    alignItems: 'center',
    backgroundColor: colors.subtleBackground,
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
