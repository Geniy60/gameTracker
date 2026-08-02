import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
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
import { queryKeys } from '../../queryClient';
import { findCoverOptions, findGameTitles } from '../../services/steamGridDb';
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

// Long enough that typing a title does not fire a request per letter.
const titleSearchDelayMs = 350;
const minTitleSearchLength = 2;

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
  const [coverUrl, setCoverUrl] = useState(game?.coverUrl ?? '');
  // A cover the user chose must survive a rename, unlike one the app found on its
  // own. Only this flag can tell the two apart.
  const [isCoverManual, setIsCoverManual] = useState(false);
  // Suggestions open while the name is being typed and close once one is taken, so
  // they do not sit under the field for the rest of the form.
  const [areTitlesOpen, setAreTitlesOpen] = useState(false);
  const [areCoversOpen, setAreCoversOpen] = useState(false);
  const searchedTitle = useDebouncedValue(name.trim(), titleSearchDelayMs);
  const titlesQuery = useQuery({
    enabled: areTitlesOpen && searchedTitle.length >= minTitleSearchLength,
    queryFn: () => findGameTitles(searchedTitle),
    queryKey: queryKeys.gameTitles(searchedTitle),
  });
  const coversQuery = useQuery({
    enabled: areCoversOpen && name.trim().length >= minTitleSearchLength,
    queryFn: () => findCoverOptions(name.trim()),
    queryKey: queryKeys.gameCovers(name.trim()),
  });
  // The title already typed in full is not worth offering back.
  const titles = (titlesQuery.data ?? []).filter((title) => title !== name.trim());
  const coverOptions = coversQuery.data ?? [];

  function takeTitle(title: string) {
    setName(title);
    setAreTitlesOpen(false);
  }

  function takeCover(url: string) {
    setCoverUrl(url);
    setIsCoverManual(true);
    setAreCoversOpen(false);
  }

  // An untouched cover keeps the old rule: it belongs to the name it was found by,
  // so a rename drops it and the save that follows looks up a new one. A cover the
  // user picked or typed is theirs and is left alone. Clearing the field is how a
  // fresh lookup is asked for.
  function resolveCoverUrl(trimmedName: string): string | null {
    if (isCoverManual) {
      return coverUrl.trim().length === 0 ? null : coverUrl.trim();
    }

    return game !== null && game.name === trimmedName ? game.coverUrl : null;
  }

  function handleSave() {
    const trimmedName = name.trim();

    if (trimmedName.length === 0) {
      showAppAlert(strings.alerts.emptyNameTitle, strings.alerts.emptyNameMessage);
      return;
    }

    onSave({
      access,
      coverUrl: resolveCoverUrl(trimmedName),
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
            onChangeText={(text) => {
              setName(text);
              setAreTitlesOpen(true);
            }}
            placeholder={strings.gameForm.namePlaceholder}
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={name}
          />
          {titles.map((title) => (
            <Pressable
              key={title}
              onPress={() => takeTitle(title)}
              style={({ pressed }) => [
                styles.titleSuggestion,
                pressed && styles.pressedButton,
              ]}
            >
              <Text numberOfLines={1} style={styles.titleSuggestionText}>
                {title}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>{strings.gameForm.coverLabel}</Text>
          <View style={styles.coverRow}>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={(text) => {
                setCoverUrl(text);
                setIsCoverManual(true);
              }}
              placeholder={strings.gameForm.coverPlaceholder}
              placeholderTextColor={colors.muted}
              style={[styles.input, styles.coverInput]}
              value={coverUrl}
            />
            <Pressable
              accessibilityLabel={strings.accessibility.pickCover}
              accessibilityRole="button"
              onPress={() => setAreCoversOpen((isOpen) => !isOpen)}
              style={({ pressed }) => [
                styles.coverPickButton,
                pressed && styles.pressedButton,
              ]}
            >
              <Ionicons color={colors.primary} name="images-outline" size={22} />
            </Pressable>
          </View>
          {areCoversOpen && coverOptions.length > 0 ? (
            <View style={styles.coverOptions}>
              {coverOptions.map((url) => (
                <Pressable
                  key={url}
                  onPress={() => takeCover(url)}
                  style={({ pressed }) => [
                    styles.coverOption,
                    url === coverUrl && styles.selectedCoverOption,
                    pressed && styles.pressedButton,
                  ]}
                >
                  <Image contentFit="cover" source={url} style={styles.coverImage} />
                </Pressable>
              ))}
            </View>
          ) : null}
          {areCoversOpen && coversQuery.isSuccess && coverOptions.length === 0 ? (
            <Text style={styles.coverEmpty}>{strings.gameForm.coverNotFound}</Text>
          ) : null}
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

// Keeps the title search from firing on every keystroke.
function useDebouncedValue(value: string, delayMs: number): string {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delayMs);

    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
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
  coverRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  coverInput: {
    flex: 1,
  },
  coverPickButton: {
    alignItems: 'center',
    backgroundColor: colors.active,
    borderColor: colors.activeBorder,
    borderRadius: 8,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  coverOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  coverOption: {
    borderColor: colors.border,
    borderRadius: 6,
    borderWidth: 1,
    overflow: 'hidden',
  },
  selectedCoverOption: {
    borderColor: colors.activeBorder,
    borderWidth: 2,
  },
  coverImage: {
    height: 108,
    width: 72,
  },
  coverEmpty: {
    color: colors.muted,
    fontSize: 14,
  },
  titleSuggestion: {
    backgroundColor: colors.surface,
    borderColor: colors.activeBorder,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 14,
  },
  titleSuggestionText: {
    color: colors.text,
    fontSize: 15,
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
