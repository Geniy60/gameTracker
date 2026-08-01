import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { hasMultiplePlatforms } from '../../gamePlatforms';
import { strings } from '../../strings';
import { colors } from '../../theme/colors';
import type { Game, MainTab } from '../../types';

type GameCardProps = {
  game: Game;
  onDelete: (game: Game) => void;
  onPress: (game: Game) => void;
  tab: MainTab;
};

// Metadata that every card in the current tab would repeat is left out.
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

export function GameCard({ game, onDelete, onPress, tab }: GameCardProps) {
  const metaParts = createMetaParts(game, tab);

  return (
    <Pressable
      onPress={() => onPress(game)}
      style={({ pressed }) => [styles.card, pressed && styles.pressedCard]}
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
      <Pressable
        accessibilityLabel={strings.accessibility.deleteGame}
        hitSlop={6}
        onPress={() => onDelete(game)}
        style={({ pressed }) => [styles.actionButton, pressed && styles.pressedButton]}
      >
        <Ionicons color={colors.destructive} name="trash-outline" size={19} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 64,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  pressedCard: {
    opacity: 0.75,
  },
  info: {
    flex: 1,
    paddingRight: 12,
  },
  name: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '600',
  },
  meta: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 3,
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.destructiveBorder,
    borderRadius: 8,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  pressedButton: {
    opacity: 0.7,
  },
});
