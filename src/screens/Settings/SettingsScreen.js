import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function SettingsScreen({ navigation }) {
  const { colors, typography, spacing } = useTheme();

  const options = [
    { label: 'PRIVACY CONTROLS', icon: 'shield-lock-outline', screen: 'Privacy' },
    { label: 'UPDATE SECURITY KEY', icon: 'key-change', screen: 'UpdatePassword' },
    { label: 'BLOCKED USERS LIST', icon: 'account-cancel-outline', screen: 'BlockedUsers' },
    { label: 'MY REPORT HISTORY LOG', icon: 'flag-outline', screen: 'ReportHistory' },
    { label: 'THEME MODE CONFIG', icon: 'palette-outline', screen: 'Theme' },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background, padding: spacing.md }]}>
      <Text style={[styles.title, {
        color: colors.textPrimary,
        fontFamily: typography.fontFamily.header,
        fontSize: typography.sizes.xl,
        marginBottom: spacing.xl,
        textTransform: 'uppercase',
      }]}>
        SYSTEM PREFERENCES
      </Text>

      {options.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.item,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: spacing.borderRadius.xs,
              padding: spacing.md,
              marginBottom: spacing.sm,
            }
          ]}
          onPress={() => navigation.navigate(item.screen)}
          activeOpacity={0.8}
        >
          <View style={styles.itemLeft}>
            <MaterialCommunityIcons name={item.icon} size={20} color={colors.accent} />
            <Text style={[
              styles.itemLabel,
              {
                color: colors.textPrimary,
                fontFamily: typography.fontFamily.header,
                fontSize: typography.sizes.sm,
                marginLeft: 12,
              }
            ]}>
              {item.label}
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontWeight: '900',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemLabel: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
