import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function StreakBadge({ count, onPress }) {
  const { colors, typography } = useTheme();

  const content = (
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
      {Boolean(onPress) && (
        <MaterialCommunityIcons name="chevron-right" size={13} color={colors.accent} style={{ marginLeft: 2 }} />
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
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
