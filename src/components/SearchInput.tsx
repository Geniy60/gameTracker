import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { strings } from '../strings';
import { colors } from '../theme/colors';

type SearchInputProps = {
  onChangeText: (text: string) => void;
  placeholder: string;
  value: string;
};

export function SearchInput({ onChangeText, placeholder, value }: SearchInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value.length > 0;

  return (
    <View style={[styles.container, isFocused && styles.focusedContainer]}>
      <Ionicons
        color={isFocused ? colors.primary : colors.muted}
        name="search-outline"
        size={19}
        style={styles.searchIcon}
      />
      <TextInput
        accessibilityLabel={strings.accessibility.search}
        autoCapitalize="none"
        clearButtonMode="while-editing"
        onBlur={() => setIsFocused(false)}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        style={styles.input}
        value={value}
      />
      {hasValue ? (
        <Pressable
          accessibilityLabel={strings.accessibility.clearSearch}
          hitSlop={8}
          onPress={() => onChangeText('')}
          style={styles.clearButton}
        >
          <Ionicons color={colors.muted} name="close-circle" size={21} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    height: 44,
    paddingLeft: 12,
    paddingRight: 2,
  },
  focusedContainer: {
    backgroundColor: colors.panel,
    borderColor: colors.activeBorder,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    color: colors.text,
    flex: 1,
    fontSize: 15,
    height: 44,
    paddingLeft: 0,
    paddingRight: 8,
  },
  clearButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
});
