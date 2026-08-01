import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OptionChips } from '../../components/OptionChips';
import { SecondaryScreenHeader } from '../../components/SecondaryScreenHeader';
import { createId } from '../../createId';
import { strings } from '../../strings';
import { colors } from '../../theme/colors';
import type { Game, GamePlatform, GameStatus } from '../../types';

type GameFormScreenProps = {
  game: Game | null;
  initialStatus: GameStatus;
  onBack: () => void;
  onSave: (game: Game) => void;
};

const statusOptions: { label: string; value: GameStatus }[] = [
  { label: strings.status.wishlist, value: 'wishlist' },
  { label: strings.status.played, value: 'played' },
];

const platformOptions: { label: string; value: GamePlatform }[] = [
  { label: strings.platforms.pc, value: 'pc' },
  { label: strings.platforms.playstation, value: 'playstation' },
  { label: strings.platforms.xbox, value: 'xbox' },
  { label: strings.platforms.switch, value: 'switch' },
  { label: strings.platforms.mobile, value: 'mobile' },
  { label: strings.platforms.other, value: 'other' },
];

const ratingOptions: { label: string; value: number | null }[] = [
  { label: strings.gameForm.ratingNotSet, value: null },
  ...Array.from({ length: 10 }, (_, index) => ({
    label: String(index + 1),
    value: index + 1,
  })),
];

export function GameFormScreen({
  game,
  initialStatus,
  onBack,
  onSave,
}: GameFormScreenProps) {
  const [name, setName] = useState(game?.name ?? '');
  const [status, setStatus] = useState<GameStatus>(game?.status ?? initialStatus);
  const [platform, setPlatform] = useState<GamePlatform>(game?.platform ?? 'pc');
  const [rating, setRating] = useState<number | null>(game?.rating ?? null);
  const [note, setNote] = useState(game?.note ?? '');

  function handleSave() {
    const trimmedName = name.trim();

    if (trimmedName.length === 0) {
      Alert.alert(strings.alerts.emptyNameTitle, strings.alerts.emptyNameMessage);
      return;
    }

    onSave({
      id: game?.id ?? createId(),
      name: trimmedName,
      note: note.trim(),
      platform,
      rating: status === 'played' ? rating : null,
      status,
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
          <Text style={styles.label}>{strings.gameForm.statusLabel}</Text>
          <OptionChips
            onSelect={setStatus}
            options={statusOptions}
            selectedValue={status}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>{strings.gameForm.platformLabel}</Text>
          <OptionChips
            onSelect={setPlatform}
            options={platformOptions}
            selectedValue={platform}
          />
        </View>

        {status === 'played' ? (
          <View style={styles.field}>
            <Text style={styles.label}>{strings.gameForm.ratingLabel}</Text>
            <Text style={styles.hint}>{strings.gameForm.ratingHint}</Text>
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
  hint: {
    color: colors.muted,
    fontSize: 13,
    marginTop: -4,
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
