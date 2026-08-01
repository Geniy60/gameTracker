import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { strings } from '../strings';
import { colors } from '../theme/colors';

type SecondaryScreenHeaderProps = {
  marginBottom?: number;
  onBack: () => void;
  title: string;
};

export function SecondaryScreenHeader({
  marginBottom = 12,
  onBack,
  title,
}: SecondaryScreenHeaderProps) {
  return (
    <View style={[styles.secondaryHeader, { marginBottom }]}>
      <Pressable
        accessibilityLabel={strings.accessibility.back}
        onPress={onBack}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressedButton]}
      >
        <Ionicons color={colors.primary} name="arrow-back" size={22} />
      </Pressable>
      <Text style={styles.secondaryTitle}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  secondaryHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  secondaryTitle: {
    color: colors.text,
    flex: 1,
    fontSize: 21,
    fontWeight: '800',
  },
  pressedButton: {
    opacity: 0.7,
  },
});
