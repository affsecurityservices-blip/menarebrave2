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
import PhoneInputWithCountry from '../../components/common/PhoneInputWithCountry';
import { validateLocalPhone, validatePin } from '../../utils/validators';
import { DEFAULT_COUNTRY } from '../../utils/countries';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function LoginScreen({ navigation }) {
  const { colors, typography, spacing } = useTheme();
  const { loginWithPhone, isLoading } = useAuth();
  const toast = useToast();

  const [phone, setPhone] = useState('');
  const [dialCode, setDialCode] = useState('+91');
  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  const [pin, setPin] = useState('');
  const [errors, setErrors] = useState({});

  const handleLogin = async () => {
    const newErrors = {};
    if (!validateLocalPhone(phone, country)) {
      newErrors.phone = country?.dialCode === '+91'
        ? 'Enter a valid 10-digit mobile number'
        : 'Enter a valid mobile number for selected country';
    }
    if (!validatePin(pin)) newErrors.pin = 'Enter your 5-digit shelter PIN';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setErrors({});
      await loginWithPhone(phone, pin, dialCode);
      toast.success('Shield verified. Welcome back.');
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check phone number and 5-digit PIN.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Ambient Top Glow */}
      <LinearGradient
        colors={['rgba(255, 209, 0, 0.10)', 'rgba(255, 209, 0, 0.02)', 'transparent']}
        style={styles.ambientGlow}
        pointerEvents="none"
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Tactical Shelter Vault Card */}
        <View style={[styles.shelterCard, {
          backgroundColor: colors.surface,
          borderColor: 'rgba(255, 209, 0, 0.22)',
        }]}>
          {/* Header & Emblem */}
          <View style={styles.header}>
            <View style={[styles.iconBadge, {
              backgroundColor: colors.yellowMuted,
              borderColor: 'rgba(255, 209, 0, 0.35)',
            }]}>
              <MaterialCommunityIcons
                name="shield-lock"
                size={28}
                color={colors.accent}
              />
            </View>

            {/* Tactical Status Pill */}
            <View style={[styles.statusPill, {
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              borderColor: colors.border,
            }]}>
              <View style={[styles.pulseDot, { backgroundColor: '#10B981' }]} />
              <Text style={[styles.statusPillText, {
                color: colors.accent,
                fontFamily: typography.fontFamily.header,
              }]}>
                ENCRYPTED SANCTUARY • SIGN IN
              </Text>
            </View>

            <Text style={[styles.title, {
              color: colors.textPrimary,
              fontFamily: typography.fontFamily.header,
            }]}>
              RE-ENTER THE FEED
            </Text>

            <Text style={[styles.subtitle, {
              color: colors.textSecondary,
              fontFamily: typography.fontFamily.body,
            }]}>
              Authenticate using your registered mobile number and private 5-digit shelter PIN.
            </Text>
          </View>

          {/* Form Fields */}
          <PhoneInputWithCountry
            label="REGISTERED MOBILE NUMBER"
            phone={phone}
            onChangePhone={setPhone}
            dialCode={dialCode}
            onChangeDialCode={setDialCode}
            country={country}
            onChangeCountry={setCountry}
            error={errors.phone}
            containerStyle={{ marginBottom: 14 }}
          />

          <InputField
            label="5-DIGIT SHELTER PIN"
            placeholder="•••••"
            value={pin}
            onChangeText={(val) => setPin(val.replace(/[^0-9]/g, ''))}
            secureTextEntry
            error={errors.pin}
            keyboardType="numeric"
            maxLength={5}
          />

          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotBtn}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="key-change" size={14} color={colors.accent} style={{ marginRight: 5 }} />
            <Text style={[styles.forgotText, {
              color: colors.accent,
              fontFamily: typography.fontFamily.header,
              fontSize: typography.sizes.xs,
            }]}>
              FORGOT 5-DIGIT PIN?
            </Text>
          </TouchableOpacity>

          <Button
            title="UNLOCK SHELTER →"
            variant="primary"
            onPress={handleLogin}
            loading={isLoading}
            style={styles.actionButton}
            textStyle={styles.actionButtonText}
          />

          {/* Privacy & Security Trust Notice */}
          <View style={[styles.securityNoticeBox, {
            backgroundColor: 'rgba(255, 209, 0, 0.04)',
            borderColor: 'rgba(255, 209, 0, 0.12)',
          }]}>
            <MaterialCommunityIcons name="incognito" size={16} color={colors.accent} style={{ marginRight: 8 }} />
            <Text style={[styles.securityNoticeText, { color: colors.textSecondary }]}>
              Zero logs. Zero passwords stored. Only your 5-digit PIN verifies identity.
            </Text>
          </View>

          {/* Sign Up Link Footer */}
          <View style={[styles.cardFooter, { borderTopColor: 'rgba(255, 255, 255, 0.06)' }]}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Signup')}
              style={styles.signupLink}
              activeOpacity={0.8}
            >
              <Text style={[styles.signupText, {
                color: colors.textSecondary,
                fontFamily: typography.fontFamily.body,
                fontSize: 13,
              }]}>
                Don't have a shelter key yet?{' '}
                <Text style={{ color: colors.accent, fontWeight: '800' }}>SIGN UP</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer Brotherhood Tag */}
        <View style={styles.brotherhoodBanner}>
          <MaterialCommunityIcons name="shield-check" size={14} color={colors.accent} style={{ marginRight: 6 }} />
          <Text style={[styles.brotherhoodText, { color: colors.textSecondary }]}>
            Men Are Brave • Private Anonymous Network
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  ambientGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 320,
  },
  scrollView: {
    width: '100%',
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  shelterCard: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    borderRadius: 20,
    borderWidth: 1.5,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 20,
    ...Platform.select({
      web: {
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.65), 0 0 25px rgba(255, 209, 0, 0.06)',
      },
      default: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 18,
        elevation: 8,
      },
    }),
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconBadge: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    ...Platform.select({
      web: {
        boxShadow: '0 0 16px rgba(255, 209, 0, 0.25)',
      },
      default: {},
    }),
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 7,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  forgotBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: -4,
    marginBottom: 16,
    paddingVertical: 4,
  },
  forgotText: {
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  actionButton: {
    paddingVertical: 14,
    borderRadius: 10,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 14px rgba(255, 209, 0, 0.3)',
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
  securityNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 18,
  },
  securityNoticeText: {
    fontSize: 11,
    lineHeight: 15,
    flex: 1,
  },
  cardFooter: {
    borderTopWidth: 1,
    marginTop: 18,
    paddingTop: 14,
    alignItems: 'center',
  },
  signupLink: {
    paddingVertical: 4,
  },
  signupText: {
    fontWeight: '500',
  },
  brotherhoodBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    opacity: 0.75,
  },
  brotherhoodText: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});

