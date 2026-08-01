import { Ionicons } from '@expo/vector-icons';
import { type ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { strings } from '../strings';
import { colors } from '../theme/colors';
import type { MainTab } from '../types';

type TabConfig = {
  iconName: ComponentProps<typeof Ionicons>['name'];
  key: MainTab;
  label: string;
};

type MainTabsProps = {
  activeTab: MainTab;
  onSelectTab: (tab: MainTab) => void;
};

const tabs: TabConfig[] = [
  {
    iconName: 'bookmark-outline',
    key: 'wishlist',
    label: strings.tabs.wishlist,
  },
  {
    iconName: 'library-outline',
    key: 'available',
    label: strings.tabs.available,
  },
  {
    iconName: 'game-controller-outline',
    key: 'played',
    label: strings.tabs.played,
  },
];

export function MainTabs({ activeTab, onSelectTab }: MainTabsProps) {
  return (
    <View style={styles.tabRow}>
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;

        return (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            key={tab.key}
            onPress={() => onSelectTab(tab.key)}
            style={({ pressed }) => [
              styles.tab,
              isActive && styles.activeTab,
              pressed && styles.pressedButton,
            ]}
          >
            <Ionicons
              color={isActive ? colors.primary : colors.muted}
              name={tab.iconName}
              size={17}
            />
            <Text
              adjustsFontSizeToFit
              minimumFontScale={0.78}
              numberOfLines={1}
              style={[styles.tabLabel, isActive && styles.activeTabLabel]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabRow: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    marginBottom: 12,
    marginHorizontal: 20,
    marginTop: 8,
    padding: 4,
  },
  tab: {
    alignItems: 'center',
    borderColor: 'transparent',
    borderRadius: 6,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
    minHeight: 42,
    minWidth: 0,
    paddingHorizontal: 2,
  },
  activeTab: {
    backgroundColor: colors.active,
    borderColor: colors.activeBorder,
  },
  tabLabel: {
    color: colors.muted,
    flexShrink: 1,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  activeTabLabel: {
    color: colors.primary,
  },
  pressedButton: {
    opacity: 0.7,
  },
});
