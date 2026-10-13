import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function StreakBadge({ count }) {
  const { colors, typography } = useTheme();

  return (
    <View style={[styles.badge, { backgroundColor: colors.yellowMuted, borderColor: colors.accent }]}>
      <MaterialCommunityIcons name="fire" size={14} color={colors.accent} />
      <Text style={[styles.text, {
        color: colors.accent,
        fontFamily: typography.fontFamily.header,
        fontSize: 11,
        fontWeight: '800',
        marginLeft: 4,
        letterSpacing: 0.5,
      }]}>
        {count} DAY STREAK
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 16,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '800',
  },
});
