import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function AnonymousModeScreen({ navigation }) {
  const { colors, typography, spacing } = useTheme();
  const { updateOnboarding } = useAuth();
  const [isAnon, setIsAnon] = useState(true);

  const handleNext = () => {
    updateOnboarding({ anonymousMode: isAnon });
    navigation.navigate('ProfileSetup');
  };

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
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={[styles.iconBadge, {
              backgroundColor: colors.yellowMuted,
              borderColor: 'rgba(255, 209, 0, 0.35)',
            }]}>
              <MaterialCommunityIcons name="incognito" size={26} color={colors.accent} />
            </View>

            <Text style={[styles.title, {
              color: colors.textPrimary,
              fontFamily: typography.fontFamily.header,
            }]}>
              IDENTITY MODE
            </Text>

            <Text style={[styles.subtitle, {
              color: colors.textSecondary,
              fontFamily: typography.fontFamily.body,
            }]}>
              Choose how you want to be seen in the brotherhood.
            </Text>
          </View>

          <View style={styles.options}>
            <TouchableOpacity
              style={[
                styles.optionCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: isAnon ? colors.accent : colors.border,
                  borderWidth: 2,
                },
              ]}
              onPress={() => setIsAnon(true)}
              activeOpacity={0.8}
            >
              <View style={styles.optionHeader}>
                <MaterialCommunityIcons
                  name="ghost"
                  size={22}
                  color={isAnon ? colors.accent : colors.textSecondary}
                />
                <Text style={[
                  styles.optionTitle,
                  {
                    color: isAnon ? colors.accent : colors.textPrimary,
                    fontFamily: typography.fontFamily.header,
                  },
                ]}>
                  GHOST MODE (ANONYMOUS)
                </Text>
              </View>
              <Text style={[
                styles.optionDesc,
                {
                  color: colors.textSecondary,
                  fontFamily: typography.fontFamily.body,
                },
              ]}>
                All comments and posts are shared as 'Anonymous Member'. Zero identity traces.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: !isAnon ? colors.accent : colors.border,
                  borderWidth: 2,
                },
              ]}
              onPress={() => setIsAnon(false)}
              activeOpacity={0.8}
            >
              <View style={styles.optionHeader}>
                <MaterialCommunityIcons
                  name="shield-half-full"
                  size={22}
                  color={!isAnon ? colors.accent : colors.textSecondary}
                />
                <Text style={[
                  styles.optionTitle,
                  {
                    color: !isAnon ? colors.accent : colors.textPrimary,
                    fontFamily: typography.fontFamily.header,
                  },
                ]}>
                  NICKNAME MODE (CUSTOM MASK)
                </Text>
              </View>
              <Text style={[
                styles.optionDesc,
                {
                  color: colors.textSecondary,
                  fontFamily: typography.fontFamily.body,
                },
              ]}>
                Choose a custom alias (e.g. 'DarkKnight_01') and select a retro emblem.
              </Text>
            </TouchableOpacity>
          </View>

          <Button
            title="CONTINUE →"
            variant="primary"
            onPress={handleNext}
            style={styles.actionButton}
            textStyle={styles.actionButtonText}
          />
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
    maxWidth: 380,
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    ...Platform.select({
      web: {
        boxShadow: '0 0 16px rgba(255, 209, 0, 0.25)',
      },
      default: {},
    }),
  },
  title: {
    fontSize: 21,
    fontWeight: '900',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  options: {
    width: '100%',
    marginBottom: 20,
  },
  optionCard: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 14,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginLeft: 10,
  },
  optionDesc: {
    fontSize: 12,
    lineHeight: 18,
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
});
