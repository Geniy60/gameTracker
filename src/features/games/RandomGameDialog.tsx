import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { strings } from '../../strings';
import { colors } from '../../theme/colors';
import type { Game } from '../../types';

type RandomGameDialogProps = {
  // null while nothing has been rolled, which is also what closes the window.
  game: Game | null;
  onClose: () => void;
  onOpen: (game: Game) => void;
  onReroll: () => void;
};

// A window rather than a screen, which UI_RULES would ask for: the whole point is
// roll, look, roll again, and a navigation screen for that is more machinery for the
// same thing. Deliberately styled after AppAlertHost, since it is the same kind of
// window.
export function RandomGameDialog({
  game,
  onClose,
  onOpen,
  onReroll,
}: RandomGameDialogProps) {
  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={game !== null}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{strings.randomGame.title}</Text>
          {game === null ? null : (
            <>
              {game.coverUrl === null ? (
                <View style={[styles.cover, styles.coverPlaceholder]}>
                  <Ionicons
                    color={colors.muted}
                    name="game-controller-outline"
                    size={44}
                  />
                </View>
              ) : (
                <Image
                  contentFit="cover"
                  source={game.coverUrl}
                  style={styles.cover}
                />
              )}
              <Text numberOfLines={2} style={styles.name}>
                {game.name}
              </Text>
              {/* Only games with access are ever rolled, so this line says how it can
                  be started right now. */}
              {game.access === null ? null : (
                <Text style={styles.access}>{strings.access[game.access]}</Text>
              )}
              <View style={styles.actions}>
                <Pressable
                  onPress={onReroll}
                  style={({ pressed }) => [styles.button, pressed && styles.pressed]}
                >
                  <Text style={styles.buttonText}>{strings.randomGame.reroll}</Text>
                </Pressable>
                <Pressable
                  onPress={() => onOpen(game)}
                  style={({ pressed }) => [styles.button, pressed && styles.pressed]}
                >
                  <Text style={styles.buttonText}>{strings.randomGame.open}</Text>
                </Pressable>
                <Pressable
                  onPress={onClose}
                  style={({ pressed }) => [
                    styles.button,
                    styles.closeButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.buttonText, styles.closeButtonText]}>
                    {strings.randomGame.close}
                  </Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.62)',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    maxWidth: 420,
    padding: 18,
    width: '100%',
  },
  title: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '800',
  },
  // The same 2:3 box art the list uses, drawn large: here the picture is the answer
  // rather than a row marker.
  cover: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    height: 216,
    marginTop: 16,
    width: 144,
  },
  coverPlaceholder: {
    alignItems: 'center',
    borderColor: colors.border,
    borderWidth: 1,
    justifyContent: 'center',
  },
  name: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 14,
    textAlign: 'center',
  },
  access: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 6,
  },
  actions: {
    alignSelf: 'stretch',
    gap: 10,
    marginTop: 18,
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.active,
    borderColor: colors.activeBorder,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 14,
  },
  closeButton: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  buttonText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  closeButtonText: {
    color: colors.muted,
  },
  pressed: {
    opacity: 0.7,
  },
});
