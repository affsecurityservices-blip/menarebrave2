import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function GenderOathScreen({ navigation }) {
  const { colors, typography, spacing } = useTheme();
  const { updateOnboarding } = useAuth();
  const [accepted, setAccepted] = useState(false);

  const handleAccept = () => {
    if (accepted) {
      updateOnboarding({ oathAccepted: true });
      navigation.navigate('AgeSelect');
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background, padding: spacing.lg }]}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="shield-alert" size={48} color={colors.accent} />
        <Text style={[styles.title, {
          color: colors.textPrimary,
          fontFamily: typography.fontFamily.header,
          fontSize: typography.sizes.xl,
          marginTop: spacing.md,
        }]}>
          THE CODE OF COGNIZANCE
        </Text>
      </View>

      <View style={[styles.oathCard, { backgroundColor: colors.surface, borderColor: colors.border, padding: spacing.md }]}>
        <Text style={[styles.oathTitle, { color: colors.accent, fontFamily: typography.fontFamily.header, fontSize: typography.sizes.md, marginBottom: spacing.sm }]}>
          I HEREBY AFFIRM:
        </Text>
        <Text style={[styles.oathText, { color: colors.textPrimary, fontFamily: typography.fontFamily.body, fontSize: typography.sizes.md, lineHeight: 24 }]}>
          1. I am here to seek genuine support, post, or offer constructive strength to my brothers.{'\n\n'}
          2. I will protect the anonymity of this feed. What is spoken here, stays here.{'\n\n'}
          3. I will not troll, abuse, or demean any member. We carry enough weight; we do not add to it.{'\n\n'}
          4. I understand that vulnerability is courage, not weakness.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() => setAccepted(!accepted)}
        activeOpacity={0.8}
      >
        <View style={[styles.checkbox, {
          borderColor: accepted ? colors.accent : colors.textSecondary,
          backgroundColor: accepted ? colors.yellowMuted : 'transparent',
        }]}>
          {accepted && <MaterialCommunityIcons name="check" size={16} color={colors.accent} />}
        </View>
        <Text style={[styles.checkboxText, { color: colors.textPrimary, fontFamily: typography.fontFamily.body, fontSize: spacing.md }]}>
          I swear to uphold this oath of brotherhood.
        </Text>
      </TouchableOpacity>

      <Button
        title="PROCEED"
        variant={accepted ? 'primary' : 'secondary'}
        onPress={handleAccept}
        disabled={!accepted}
        style={{ marginTop: spacing.lg }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontWeight: '900',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  oathCard: {
    borderWidth: 1,
    borderRadius: 12,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      },
    }),
    marginBottom: 30,
  },
  oathTitle: {
    fontWeight: '800',
    letterSpacing: 1,
  },
  oathText: {
    fontWeight: '500',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderRadius: 6,
  },
  checkboxText: {
    flex: 1,
    fontWeight: '600',
  },
});
