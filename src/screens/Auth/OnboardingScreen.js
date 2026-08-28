import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Button from '../../components/common/Button';

const { width } = Dimensions.get('window');

export default function OnboardingScreen({ navigation }) {
  const { colors, typography, spacing } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, padding: spacing.lg }]}>
      <View style={styles.content}>
        {/* Bat emblem outline/signal metaphor using Text/Icons */}
        <View style={[styles.signalCircle, { borderColor: colors.accent }]}>
          <Text style={[styles.signalLogo, { color: colors.accent, fontFamily: typography.fontFamily.header }]}>
            MAB
          </Text>
        </View>

        <Text style={[styles.title, {
          color: colors.textPrimary,
          fontFamily: typography.fontFamily.header,
          fontSize: typography.sizes.xxxl,
          lineHeight: typography.sizes.xxxl + 6,
        }]}>
          EVERY MAN HAS A VOICE.
        </Text>

        <Text style={[styles.tagline, {
          color: colors.accent,
          fontFamily: typography.fontFamily.header,
          fontSize: typography.sizes.lg,
        }]}>
          "No cape needed. Just talk."
        </Text>

        <Text style={[styles.description, {
          color: colors.textSecondary,
          fontFamily: typography.fontFamily.body,
          fontSize: typography.sizes.md,
          lineHeight: 24,
        }]}>
          A private, anonymous feed for men to post, seek guidance, and build true mental resilience without judgment.
        </Text>
      </View>

      <View style={[styles.footer, { gap: spacing.md }]}>
        <Button
          title="ENTER THE FEED"
          variant="primary"
          onPress={() => navigation.navigate('GenderOath')}
        />
        <Button
          title="ALREADY RUNNING? LOGIN"
          variant="secondary"
          onPress={() => navigation.navigate('Login')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signalCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    shadowColor: '#FFD100',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  signalLogo: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 2,
  },
  title: {
    textAlign: 'center',
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  tagline: {
    textAlign: 'center',
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 20,
  },
  description: {
    textAlign: 'center',
    fontWeight: '400',
    maxWidth: '85%',
  },
  footer: {
    width: '100%',
  },
});
