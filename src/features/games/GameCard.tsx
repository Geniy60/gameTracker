import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { strings } from '../../strings';
import { colors } from '../../theme/colors';
import type { Game } from '../../types';

type GameCardProps = {
  game: Game;
  onDelete: (game: Game) => void;
  onPress: (game: Game) => void;
};

export function GameCard({ game, onDelete, onPress }: GameCardProps) {
  const metaParts = [strings.platforms[game.platform]];

  if (game.rating !== null) {
    metaParts.push(strings.list.ratingValue(game.rating));
  }

  return (
    <Pressable
      onPress={() => onPress(game)}
      style={({ pressed }) => [styles.card, pressed && styles.pressedCard]}
    >
      <View style={styles.info}>
        <Text numberOfLines={1} style={styles.name}>
          {game.name}
        </Text>
        <Text numberOfLines={1} style={styles.meta}>
          {metaParts.join(' · ')}
        </Text>
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
