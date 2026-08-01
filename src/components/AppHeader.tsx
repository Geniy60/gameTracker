import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { strings } from '../strings';
import { colors } from '../theme/colors';

type AppHeaderProps = {
  isRefreshing: boolean;
  onRefresh: () => void;
};

export function AppHeader({ isRefreshing, onRefresh }: AppHeaderProps) {
  return (
    <View style={styles.header}>
      <Text style={styles.appTitle}>{strings.app.title}</Text>
      <Pressable
        accessibilityLabel={strings.accessibility.refreshData}
        disabled={isRefreshing}
        onPress={onRefresh}
        style={({ pressed }) => [
          styles.headerIconButton,
          pressed && styles.pressedButton,
        ]}
      >
        {isRefreshing ? (
          <ActivityIndicator color={colors.text} size="small" />
        ) : (
          <Ionicons color={colors.text} name="refresh-outline" size={25} />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 6,
  },
  appTitle: {
    color: colors.text,
    flex: 1,
    fontSize: 25,
    fontWeight: '800',
  },
  headerIconButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  pressedButton: {
    opacity: 0.7,
  },
});
