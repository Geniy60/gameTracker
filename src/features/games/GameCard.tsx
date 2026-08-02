import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { type ComponentProps, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { hasMultiplePlatforms } from '../../gamePlatforms';
import { strings } from '../../strings';
import { colors } from '../../theme/colors';
import type { Game } from '../../types';

type GameCardProps = {
  game: Game;
  // Set on the wishlist only, where a long press starts a drag.
  onLongPress?: () => void;
  onOpenActions: (game: Game) => void;
  onPress: (game: Game) => void;
};

// The default 500 ms feels sluggish when the long press is how the wishlist is
// reordered. Short enough to react quickly, long enough not to fire on a tap.
const dragHoldDelayMs = 220;

type GameTag = {
  color: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
};

// One line per property, under the name. Anything the game does not have is left
// out, as is metadata that every row in the current tab would repeat. The note goes
// last because it is the only free text and can run onto a second line.
function createMetaLines(game: Game): string[] {
  const lines: string[] = [];

  if (hasMultiplePlatforms()) {
    lines.push(strings.platforms[game.platform]);
  }

  if (game.rating !== null) {
    lines.push(strings.list.ratingValue(game.rating));
  }

  if (game.note.length > 0) {
    lines.push(game.note);
  }

  return lines;
}

// Access and progress are short closed sets, so they read faster as marks along the
// bottom than as two more lines of text competing with the note. The label is kept
// for the screen reader, which cannot see the icon.
//
// The colour carries one rule and only one: green is something the user has or has
// done, amber is something that wants money, grey is a dead end. The accent colour is
// deliberately not used, since everything else in the app already is it.
function createTags(game: Game): GameTag[] {
  const tags: GameTag[] = [createAccessTag(game)];

  // Skipped on the wishlist, where every row would carry the same mark.
  if (game.progress === 'played') {
    tags.push({
      color: colors.text,
      icon: 'game-controller-outline',
      label: strings.progress.played,
    });
  }

  if (game.progress === 'finished') {
    tags.push({
      color: colors.positive,
      icon: 'trophy-outline',
      label: strings.progress.finished,
    });
  }

  return tags;
}

function createAccessTag(game: Game): GameTag {
  if (game.access === 'purchased') {
    return {
      color: colors.positive,
      icon: 'bag-check-outline',
      label: strings.access.purchased,
    };
  }

  if (game.access === 'subscription') {
    return {
      color: colors.positive,
      icon: 'repeat-outline',
      label: strings.access.subscription,
    };
  }

  if (game.access === 'friend') {
    return {
      color: colors.positive,
      icon: 'people-outline',
      label: strings.access.friend,
    };
  }

  // The same fact reads differently by tab, so the mark does too: money still to spend
  // on the wishlist, and on the played tab a game simply out of reach, where telling
  // the user to buy something they have finished would make no sense.
  if (game.progress === 'none') {
    return { color: colors.attention, icon: 'logo-usd', label: strings.list.toBuyMark };
  }

  return {
    color: colors.muted,
    icon: 'lock-closed-outline',
    label: strings.list.noAccessMark,
  };
}

export function GameCard({
  game,
  onLongPress,
  onOpenActions,
  onPress,
}: GameCardProps) {
  const metaLines = createMetaLines(game);
  const tags = createTags(game);
  // The covers sit on someone else's CDN and are community uploaded, so an address
  // can stop working. The failed address is remembered rather than a flag: a new
  // cover for the same game then draws normally, without anything having to reset.
  const [failedCoverUrl, setFailedCoverUrl] = useState<string | null>(null);
  const hasCover = game.coverUrl !== null && game.coverUrl !== failedCoverUrl;

  return (
    <Pressable
      delayLongPress={dragHoldDelayMs}
      onLongPress={onLongPress}
      onPress={() => onPress(game)}
      style={({ pressed }) => [styles.row, pressed && styles.pressedRow]}
    >
      {hasCover ? (
        // expo-image keeps the picture in its own disk cache, so scrolling the list
        // does not refetch it.
        <Image
          contentFit="cover"
          onError={() => setFailedCoverUrl(game.coverUrl)}
          source={game.coverUrl}
          style={styles.cover}
        />
      ) : (
        <View style={[styles.cover, styles.coverPlaceholder]}>
          <Ionicons color={colors.muted} name="game-controller-outline" size={34} />
        </View>
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
        {/* Pushed to the bottom of the column so the marks sit on one line along the
            foot of the card, whatever the text above them takes up. */}
        <View style={styles.tags}>
          {tags.map((tag) => (
            <View
              accessibilityLabel={tag.label}
              accessibilityRole="text"
              key={tag.icon}
              style={styles.tag}
            >
              {/* The frame stays plain whatever the icon colour, so a tag is not
                  mistaken for the button beside it. */}
              <Ionicons color={tag.color} name={tag.icon} size={20} />
            </View>
          ))}
        </View>
      </View>
      {/* One button rather than a stack of them. Every row action is rare enough to
          live a tap away, and three accent frames beside every cover made a list of
          74 games read as a control panel instead of a shelf. */}
      <Pressable
        accessibilityLabel={strings.accessibility.rowActions}
        hitSlop={6}
        onPress={() => onOpenActions(game)}
        style={({ pressed }) => [styles.actionButton, pressed && styles.pressedButton]}
      >
        <Ionicons color={colors.primary} name="ellipsis-horizontal" size={21} />
      </Pressable>
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
  // Stretched to the full row height, which the row's flex-start alignment would
  // otherwise not do, so the tags have a bottom to sit against.
  info: {
    alignSelf: 'stretch',
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
  tags: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 'auto',
    paddingTop: 8,
  },
  tag: {
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 7,
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    width: 34,
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
  pressedButton: {
    opacity: 0.7,
  },
});
