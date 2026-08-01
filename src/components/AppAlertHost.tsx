import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  type AppAlertButton,
  type AppAlertConfig,
  subscribeToAppAlerts,
} from '../appAlert';
import { strings } from '../strings';
import { colors } from '../theme/colors';

const okButton: AppAlertButton = { text: strings.actions.ok };

export function AppAlertHost() {
  const [alertConfig, setAlertConfig] = useState<AppAlertConfig | null>(null);
  const buttons =
    alertConfig?.buttons && alertConfig.buttons.length > 0
      ? alertConfig.buttons
      : [okButton];

  useEffect(() => subscribeToAppAlerts(setAlertConfig), []);

  function closeAlert(button?: AppAlertButton) {
    setAlertConfig(null);
    button?.onPress?.();
  }

  return (
    <Modal
      animationType="fade"
      // The hardware back button dismisses without running a destructive action.
      onRequestClose={() => closeAlert(buttons.find((button) => button.style === 'cancel'))}
      statusBarTranslucent
      transparent
      visible={alertConfig !== null}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{alertConfig?.title}</Text>
          {alertConfig?.message ? (
            <Text style={styles.message}>{alertConfig.message}</Text>
          ) : null}
          <View style={styles.actions}>
            {buttons.map((button) => {
              const isDestructive = button.style === 'destructive';

              return (
                <Pressable
                  key={button.text}
                  onPress={() => closeAlert(button)}
                  style={({ pressed }) => [
                    styles.button,
                    isDestructive && styles.destructiveButton,
                    pressed && styles.pressedButton,
                  ]}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      isDestructive && styles.destructiveButtonText,
                    ]}
                  >
                    {button.text}
                  </Text>
                </Pressable>
              );
            })}
          </View>
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
  message: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 21,
    marginTop: 10,
  },
  actions: {
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
  destructiveButton: {
    backgroundColor: colors.surface,
    borderColor: colors.destructiveBorder,
  },
  buttonText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  destructiveButtonText: {
    color: colors.destructive,
  },
  pressedButton: {
    opacity: 0.7,
  },
});
