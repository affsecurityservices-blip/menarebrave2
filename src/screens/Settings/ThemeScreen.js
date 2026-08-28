import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ThemeScreen() {
  const { colors, typography, spacing, themeMode, selectTheme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, padding: spacing.md }]}>
      <Text style={[styles.title, {
        color: colors.textPrimary,
        fontFamily: typography.fontFamily.header,
        fontSize: typography.sizes.xl,
        marginBottom: spacing.xl,
        textTransform: 'uppercase',
        textAlign: 'center',
      }]}>
        THEME CUSTOMIZATION
      </Text>

      <TouchableOpacity
        style={[
          styles.themeOption,
          {
            backgroundColor: colors.surface,
            borderColor: themeMode === 'batman' ? colors.accent : colors.border,
            borderWidth: 2,
            borderRadius: spacing.borderRadius.xs,
            padding: spacing.md,
            marginBottom: spacing.md,
          }
        ]}
        onPress={() => selectTheme('batman')}
      >
        <View style={styles.themeInfo}>
          <MaterialCommunityIcons name="bat" size={24} color="#FFD100" />
          <View style={{ marginLeft: 12, flex: 1, paddingRight: 8 }}>
            <Text style={[styles.optionLabel, { color: colors.textPrimary, fontFamily: typography.fontFamily.header, fontSize: typography.sizes.md }]}>
              BATMAN DARK (YELLOW SIGNAL)
            </Text>
            <Text style={[styles.optionDesc, { color: colors.textSecondary, fontFamily: typography.fontFamily.body, fontSize: typography.sizes.xs }]}>
              Deep matte black background, signal yellow highlights, gunmetal frames.
            </Text>
          </View>
        </View>
        <MaterialCommunityIcons
          name={themeMode === 'batman' ? 'radiobox-marked' : 'radiobox-blank'}
          size={20}
          color={themeMode === 'batman' ? colors.accent : colors.textSecondary}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.themeOption,
          {
            backgroundColor: colors.surface,
            borderColor: themeMode === 'classicDark' ? colors.accent : colors.border,
            borderWidth: 2,
            borderRadius: spacing.borderRadius.xs,
            padding: spacing.md,
            marginBottom: spacing.md,
          }
        ]}
        onPress={() => selectTheme('classicDark')}
      >
        <View style={styles.themeInfo}>
          <MaterialCommunityIcons name="palette" size={24} color="#2A9D8F" />
          <View style={{ marginLeft: 12, flex: 1, paddingRight: 8 }}>
            <Text style={[styles.optionLabel, { color: colors.textPrimary, fontFamily: typography.fontFamily.header, fontSize: typography.sizes.md }]}>
              CLASSIC DARK (CYAN HIGHLIGHT)
            </Text>
            <Text style={[styles.optionDesc, { color: colors.textSecondary, fontFamily: typography.fontFamily.body, fontSize: typography.sizes.xs }]}>
              Charcoal black shades with calm cyan tones.
            </Text>
          </View>
        </View>
        <MaterialCommunityIcons
          name={themeMode === 'classicDark' ? 'radiobox-marked' : 'radiobox-blank'}
          size={20}
          color={themeMode === 'classicDark' ? colors.accent : colors.textSecondary}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.themeOption,
          {
            backgroundColor: colors.surface,
            borderColor: themeMode === 'light' ? colors.accent : colors.border,
            borderWidth: 2,
            borderRadius: spacing.borderRadius.xs,
            padding: spacing.md,
          }
        ]}
        onPress={() => selectTheme('light')}
      >
        <View style={styles.themeInfo}>
          <MaterialCommunityIcons name="white-balance-sunny" size={24} color="#D49B00" />
          <View style={{ marginLeft: 12, flex: 1, paddingRight: 8 }}>
            <Text style={[styles.optionLabel, { color: colors.textPrimary, fontFamily: typography.fontFamily.header, fontSize: typography.sizes.md }]}>
              MAB LIGHT (GOLDEN AMBER)
            </Text>
            <Text style={[styles.optionDesc, { color: colors.textSecondary, fontFamily: typography.fontFamily.body, fontSize: typography.sizes.xs }]}>
              Clean white & soft grey surfaces with golden accents.
            </Text>
          </View>
        </View>
        <MaterialCommunityIcons
          name={themeMode === 'light' ? 'radiobox-marked' : 'radiobox-blank'}
          size={20}
          color={themeMode === 'light' ? colors.accent : colors.textSecondary}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    outlineStyle: 'none',
  },
  themeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionLabel: {
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  optionDesc: {
    marginTop: 2,
    lineHeight: 16,
  },
});
