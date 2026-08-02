import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { showAppAlert } from '../../appAlert';
import { OptionChips } from '../../components/OptionChips';
import { SecondaryScreenHeader } from '../../components/SecondaryScreenHeader';
import { createId } from '../../createId';
import {
  defaultGamePlatform,
  gamePlatforms,
  hasMultiplePlatforms,
} from '../../gamePlatforms';
import { strings } from '../../strings';
import { colors } from '../../theme/colors';
import type { Game, GameAccess, GamePlatform, MainTab } from '../../types';

type GameFormScreenProps = {
  game: Game | null;
  // Where a new game lands in the wishlist queue.
  newGamePriority: number;
  onBack: () => void;
  onSave: (game: Game) => void;
  sourceTab: MainTab;
};

const accessOptions: { label: string; value: GameAccess | null }[] = [
  { label: strings.gameForm.accessNone, value: null },
  { label: strings.access.purchased, value: 'purchased' },
  { label: strings.access.friend, value: 'friend' },
  { label: strings.access.subscription, value: 'subscription' },
];

const playedOptions: { label: string; value: boolean }[] = [
  { label: strings.gameForm.playedNo, value: false },
  { label: strings.gameForm.playedYes, value: true },
];

const platformOptions: { label: string; value: GamePlatform }[] = gamePlatforms.map(
  (platform) => ({ label: strings.platforms[platform], value: platform }),
);

const ratingOptions: { label: string; value: number | null }[] = [
  { label: strings.gameForm.ratingNotSet, value: null },
  ...Array.from({ length: 10 }, (_, index) => ({
    label: String(index + 1),
    value: index + 1,
  })),
];

// A new game starts out looking like the tab it was added from.
function createDefaults(sourceTab: MainTab): { access: GameAccess | null; isPlayed: boolean } {
  if (sourceTab === 'played') {
    return { access: 'purchased', isPlayed: true };
  }

  return { access: null, isPlayed: false };
}

export function GameFormScreen({
  game,
  newGamePriority,
  onBack,
  onSave,
  sourceTab,
}: GameFormScreenProps) {
  const defaults = createDefaults(sourceTab);
  const [name, setName] = useState(game?.name ?? '');
  const [access, setAccess] = useState<GameAccess | null>(game?.access ?? defaults.access);
  const [isPlayed, setIsPlayed] = useState(game?.isPlayed ?? defaults.isPlayed);
  const [platform, setPlatform] = useState<GamePlatform>(
    game?.platform ?? defaultGamePlatform,
  );
  const [rating, setRating] = useState<number | null>(game?.rating ?? null);
  const [note, setNote] = useState(game?.note ?? '');

  function handleSave() {
    const trimmedName = name.trim();

    if (trimmedName.length === 0) {
      showAppAlert(strings.alerts.emptyNameTitle, strings.alerts.emptyNameMessage);
      return;
    }

    onSave({
      access,
      // Nothing sets a cover yet; editing a game must not drop the one it has.
      coverUrl: game?.coverUrl ?? null,
      // The database owns createdAt; this value only keeps the object complete
      // until the list refetches.
      createdAt: game?.createdAt ?? new Date().toISOString(),
      id: game?.id ?? createId(),
      isPlayed,
      name: trimmedName,
      note: note.trim(),
      platform,
      priority: game?.priority ?? newGamePriority,
      rating: isPlayed ? rating : null,
    });
  }

  return (
    <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <SecondaryScreenHeader
          marginBottom={18}
          onBack={onBack}
          title={game === null ? strings.gameForm.addTitle : strings.gameForm.editTitle}
        />

        <View style={styles.field}>
          <Text style={styles.label}>{strings.gameForm.nameLabel}</Text>
          <TextInput
            onChangeText={setName}
            placeholder={strings.gameForm.namePlaceholder}
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={name}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>{strings.gameForm.accessLabel}</Text>
          <OptionChips
            onSelect={setAccess}
            options={accessOptions}
            selectedValue={access}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>{strings.gameForm.playedLabel}</Text>
          <OptionChips
            onSelect={setIsPlayed}
            options={playedOptions}
            selectedValue={isPlayed}
          />
        </View>

        {hasMultiplePlatforms() ? (
          <View style={styles.field}>
            <Text style={styles.label}>{strings.gameForm.platformLabel}</Text>
            <OptionChips
              onSelect={setPlatform}
              options={platformOptions}
              selectedValue={platform}
            />
          </View>
        ) : null}

        {isPlayed ? (
          <View style={styles.field}>
            <Text style={styles.label}>{strings.gameForm.ratingLabel}</Text>
            <OptionChips
              onSelect={setRating}
              options={ratingOptions}
              selectedValue={rating}
            />
          </View>
        ) : null}

        <View style={styles.field}>
          <Text style={styles.label}>{strings.gameForm.noteLabel}</Text>
          <TextInput
            multiline
            onChangeText={setNote}
            placeholder={strings.gameForm.notePlaceholder}
            placeholderTextColor={colors.muted}
            style={[styles.input, styles.noteInput]}
            textAlignVertical="top"
            value={note}
          />
        </View>

        <Pressable
          onPress={handleSave}
          style={({ pressed }) => [styles.saveButton, pressed && styles.pressedButton]}
        >
          <Text style={styles.saveButtonText}>{strings.actions.save}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.appBackground,
    flex: 1,
  },
  content: {
    paddingBottom: 28,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  field: {
    gap: 8,
    marginBottom: 16,
  },
  label: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    height: 48,
    paddingHorizontal: 14,
  },
  noteInput: {
    height: 110,
    paddingTop: 12,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: colors.active,
    borderColor: colors.activeBorder,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
    marginTop: 4,
  },
  saveButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  pressedButton: {
    opacity: 0.7,
  },
});
