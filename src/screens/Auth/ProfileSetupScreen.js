import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';
import InputField from '../../components/common/InputField';
import Avatar from '../../components/common/Avatar';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ProfileSetupScreen({ navigation }) {
  const { colors, typography, spacing } = useTheme();
  const { onboardingState, updateOnboarding, completeOnboarding, login } = useAuth();
  const toast = useToast();
  
  const [username, setUsername] = useState(onboardingState.anonymousMode ? 'Anonymous Member' : '');
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
    // Auto-login or navigate to Signup/Login
    await login(username ? `${username}@mab.com` : 'anonymous@mab.com', 'dummyPassword');
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background, padding: spacing.lg }]}>
      <View style={styles.content}>
        <Text style={[styles.title, {
          color: colors.textPrimary,
          fontFamily: typography.fontFamily.header,
          fontSize: typography.sizes.xl,
          marginBottom: spacing.xs,
          textAlign: 'center',
        }]}>
          CHOOSE YOUR MASK
        </Text>
        <Text style={[styles.subtitle, {
          color: colors.textSecondary,
          fontFamily: typography.fontFamily.body,
          fontSize: typography.sizes.sm,
          marginBottom: spacing.xl,
          textAlign: 'center',
        }]}>
          Choose an emblem and a pseudonym to complete your shield.
        </Text>

        <View style={styles.avatarSection}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary, fontFamily: typography.fontFamily.body, fontSize: typography.sizes.xs }]}>
            SELECT EMBLEM
          </Text>
          <View style={styles.avatarRow}>
            {avatarTypes.map((type) => {
              const isSelected = selectedAvatar === type;
              return (
                <TouchableOpacity
                  key={type}
                  onPress={() => setSelectedAvatar(type)}
                  style={[styles.avatarWrapper, {
                    borderColor: isSelected ? colors.accent : 'transparent',
                    borderWidth: 2,
                    borderRadius: spacing.borderRadius.round,
                    padding: 4,
                  }]}
                >
                  <Avatar type={type} size={64} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {!onboardingState.anonymousMode ? (
          <InputField
            label="NICKNAME / ALIAS"
            placeholder="e.g. SilentGideon, Bruce_93..."
            value={username}
            onChangeText={setUsername}
          />
        ) : (
          <View style={[styles.disabledInput, { backgroundColor: colors.surface, borderRadius: spacing.borderRadius.xs }]}>
            <MaterialCommunityIcons name="incognito" size={20} color={colors.textSecondary} />
            <Text style={[styles.disabledInputText, { color: colors.textSecondary, fontFamily: typography.fontFamily.body, fontSize: typography.sizes.md }]}>
              Anonymous Mode (Locked as Anonymous Member)
            </Text>
          </View>
        )}
      </View>

      <Button
        title="ENTER THE FEED"
        variant="primary"
        onPress={handleFinish}
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
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  subtitle: {
    fontWeight: '500',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  sectionLabel: {
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  avatarRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  avatarWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledInput: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  disabledInputText: {
    fontWeight: '500',
  },
});
