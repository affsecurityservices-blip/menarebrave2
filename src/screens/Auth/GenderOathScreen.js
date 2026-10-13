import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
              <MaterialCommunityIcons name="shield-alert" size={26} color={colors.accent} />
            </View>

            <Text style={[styles.title, {
              color: colors.textPrimary,
              fontFamily: typography.fontFamily.header,
            }]}>
              CODE OF BROTHERHOOD
            </Text>

            <Text style={[styles.subtitle, {
              color: colors.textSecondary,
              fontFamily: typography.fontFamily.body,
            }]}>
              Sacred principles of our anonymous safe haven.
            </Text>
          </View>

          <View style={[styles.oathCard, {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }]}>
            <Text style={[styles.oathTitle, {
              color: colors.accent,
              fontFamily: typography.fontFamily.header,
            }]}>
              I HEREBY AFFIRM:
            </Text>
            <Text style={[styles.oathText, {
              color: colors.textPrimary,
              fontFamily: typography.fontFamily.body,
            }]}>
              1. I am here to seek support and offer genuine strength to my brothers.{'\n\n'}
              2. I will guard the anonymity of this sanctuary. What is spoken here, stays here.{'\n\n'}
              3. No trolling, abuse, or judgment. We carry enough weight; we do not add to it.{'\n\n'}
              4. Vulnerability is courage, not weakness.
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
            <Text style={[styles.checkboxText, {
              color: colors.textPrimary,
              fontFamily: typography.fontFamily.body,
            }]}>
              I swear to uphold this oath of brotherhood.
            </Text>
          </TouchableOpacity>

          <Button
            title="ACCEPT & PROCEED →"
            variant={accepted ? 'primary' : 'secondary'}
            onPress={handleAccept}
            disabled={!accepted}
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
    maxWidth: 390,
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
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
  oathCard: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
  },
  oathTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  oathText: {
    fontSize: 13,
    lineHeight: 21,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderRadius: 6,
  },
  checkboxText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
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
