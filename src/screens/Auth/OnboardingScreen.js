import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import Button from '../../components/common/Button';

export default function OnboardingScreen({ navigation }) {
  const { colors, typography, spacing } = useTheme();

  return (
    <View style={[styles.mainWrapper, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={['rgba(255, 209, 0, 0.08)', 'rgba(255, 209, 0, 0.01)', 'transparent']}
        style={styles.ambientGlow}
        pointerEvents="none"
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Bat emblem outline/signal metaphor using Text/Icons */}
          <View style={[styles.signalCircle, { borderColor: colors.accent }]}>
            <Text style={[styles.signalLogo, { color: colors.accent, fontFamily: typography.fontFamily.header }]}>
              MAB
            </Text>
            <Text style={[styles.signalSubText, { color: colors.accent, fontFamily: typography.fontFamily.header }]}>
              MEN ARE BRAVE
            </Text>
          </View>

          <Text style={[styles.title, {
            color: colors.textPrimary,
            fontFamily: typography.fontFamily.header,
            fontSize: typography.sizes.xxl || 24,
            lineHeight: (typography.sizes.xxl || 24) + 6,
          }]}>
            EVERY MAN HAS A VOICE.
          </Text>

          <Text style={[styles.tagline, {
            color: colors.accent,
            fontFamily: typography.fontFamily.header,
            fontSize: typography.sizes.md,
          }]}>
            "No cape needed. Just talk."
          </Text>

          <Text style={[styles.description, {
            color: colors.textSecondary,
            fontFamily: typography.fontFamily.body,
            fontSize: typography.sizes.sm,
            lineHeight: 22,
          }]}>
            A private, anonymous feed for men to post, seek guidance, and build true mental resilience without judgment.
          </Text>

          <View style={styles.footer}>
            <Button
              title="ENTER THE FEED"
              variant="primary"
              onPress={() => navigation.navigate('GenderOath')}
              style={styles.actionButton}
              textStyle={styles.actionButtonText}
            />
            <Button
              title="ALREADY RUNNING? SIGN IN"
              variant="secondary"
              onPress={() => navigation.navigate('Login')}
              style={styles.secondaryButton}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    position: 'relative',
  },
  ambientGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  scrollView: {
    width: '100%',
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 48,
    width: '100%',
  },
  content: {
    width: '100%',
    maxWidth: 390,
    alignSelf: 'center',
    alignItems: 'center',
  },
  signalCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 16px rgba(255, 209, 0, 0.25)',
      },
      default: {
        shadowColor: '#FFD100',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 8,
      },
    }),
  },
  signalLogo: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 2,
    lineHeight: 30,
  },
  signalSubText: {
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 2,
    textAlign: 'center',
  },
  title: {
    textAlign: 'center',
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 10,
  },
  tagline: {
    textAlign: 'center',
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 16,
  },
  description: {
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 12,
  },
  footer: {
    width: '100%',
    gap: 12,
  },
  actionButton: {
    paddingVertical: 14,
    borderRadius: 10,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 14px rgba(255, 209, 0, 0.25)',
      },
      default: {
        shadowColor: '#FFD100',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
      },
    }),
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  secondaryButton: {
    paddingVertical: 13,
    borderRadius: 10,
  },
});
