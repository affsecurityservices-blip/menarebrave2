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
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';
import InputField from '../../components/common/InputField';
import Avatar from '../../components/common/Avatar';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ProfileSetupScreen({ navigation }) {
  const { colors, typography, spacing } = useTheme();
  const { onboardingState, updateOnboarding, completeOnboarding } = useAuth();
  const toast = useToast();

  const [username, setUsername] = useState(
    onboardingState.anonymousMode ? 'Anonymous Member' : ''
  );
  const [selectedAvatar, setSelectedAvatar] = useState('batman');

  const avatarTypes = ['batman', 'knight', 'ninja', 'anonymous'];

  const handleFinish = async () => {
    if (!onboardingState.anonymousMode && !username.trim()) {
      toast.warning('Please choose a nickname or go anonymous.');
      return;
    }
    updateOnboarding({
      username: username || 'Anonymous Member',
      avatar: selectedAvatar,
    });
    completeOnboarding();
    navigation.navigate('Signup');
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
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.iconBadge, {
              backgroundColor: colors.yellowMuted,
              borderColor: 'rgba(255, 209, 0, 0.35)',
            }]}>
              <MaterialCommunityIcons
                name="shield-account"
                size={26}
                color={colors.accent}
              />
            </View>

            <Text style={[styles.title, {
              color: colors.textPrimary,
              fontFamily: typography.fontFamily.header,
            }]}>
              CHOOSE YOUR MASK
            </Text>

            <Text style={[styles.subtitle, {
              color: colors.textSecondary,
              fontFamily: typography.fontFamily.body,
            }]}>
              Choose an emblem and a pseudonym to complete your shield.
            </Text>
          </View>

          {/* Emblem Selection Section */}
          <View style={styles.avatarSection}>
            <Text style={[styles.sectionLabel, {
              color: colors.textSecondary,
              fontFamily: typography.fontFamily.body,
              fontSize: typography.sizes.xs,
            }]}>
              SELECT EMBLEM
            </Text>

            <View style={styles.avatarRow}>
              {avatarTypes.map((type) => {
                const isSelected = selectedAvatar === type;
                return (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setSelectedAvatar(type)}
                    activeOpacity={0.8}
                    style={[styles.avatarWrapper, {
                      borderColor: isSelected ? colors.accent : 'transparent',
                      borderWidth: 2,
                      backgroundColor: isSelected ? colors.yellowMuted : 'transparent',
                    }]}
                  >
                    <Avatar type={type} size={52} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Alias / Nickname Section */}
          {!onboardingState.anonymousMode ? (
            <InputField
              label="NICKNAME / ALIAS"
              placeholder="e.g. SilentGideon, Bruce_93..."
              value={username}
              onChangeText={setUsername}
              containerStyle={{ marginBottom: 12 }}
            />
          ) : (
            <View style={[styles.disabledInput, {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }]}>
              <MaterialCommunityIcons name="incognito" size={20} color={colors.accent} style={{ marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.disabledInputLabel, { color: colors.accent }]}>
                  ANONYMOUS MODE
                </Text>
                <Text style={[styles.disabledInputText, { color: colors.textSecondary, fontFamily: typography.fontFamily.body }]}>
                  Locked as Anonymous Member
                </Text>
              </View>
            </View>
          )}

          {/* Action Button */}
          <Button
            title="ENTER THE FEED →"
            variant="primary"
            onPress={handleFinish}
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
    paddingBottom: 48, // Guarantees bottom button never touches border or gets cut off
    width: '100%',
  },
  content: {
    width: '100%',
    maxWidth: 380, // Safe bounding box that never overflows on any viewport
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
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  sectionLabel: {
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 14,
    textTransform: 'uppercase',
  },
  avatarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    maxWidth: 290, // Exactly 290px max, leaving over 45px margin on each side of 380px container
    alignSelf: 'center',
  },
  avatarWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
    borderRadius: 999,
  },
  disabledInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  disabledInputLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  disabledInputText: {
    fontSize: 13,
    fontWeight: '500',
  },
  actionButton: {
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 14,
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
