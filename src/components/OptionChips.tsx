import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';

type OptionChipsProps<T extends string | number | null> = {
  onSelect: (value: T) => void;
  options: { label: string; value: T }[];
  selectedValue: T;
};

export function OptionChips<T extends string | number | null>({
  onSelect,
  options,
  selectedValue,
}: OptionChipsProps<T>) {
  return (
    <View style={styles.row}>
      {options.map((option) => {
        const isSelected = option.value === selectedValue;

        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            key={String(option.value)}
            onPress={() => onSelect(option.value)}
            style={({ pressed }) => [
              styles.chip,
              isSelected && styles.selectedChip,
              pressed && styles.pressedChip,
            ]}
          >
            <Text style={[styles.chipLabel, isSelected && styles.selectedChipLabel]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 40,
    minWidth: 44,
    paddingHorizontal: 14,
  },
  selectedChip: {
    backgroundColor: colors.active,
    borderColor: colors.activeBorder,
  },
  pressedChip: {
    opacity: 0.7,
  },
  chipLabel: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: '600',
  },
  selectedChipLabel: {
    color: colors.primary,
    fontWeight: '700',
  },
});
