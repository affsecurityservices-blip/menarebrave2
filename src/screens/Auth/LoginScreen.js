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
  const { colors, typography } = useTheme();
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
    if (!validatePin(pin)) newErrors.pin = 'Enter your 5-digit PIN';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setErrors({});
      await loginWithPhone(phone, pin, dialCode);
      toast.success('Access verified. Welcome back.');
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check phone number and PIN.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
        <View style={[styles.card, {
          backgroundColor: colors.surface,
          borderColor: 'rgba(255, 209, 0, 0.22)',
        }]}>
          {/* Header */}
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

            <Text style={[styles.title, {
              color: colors.textPrimary,
              fontFamily: typography.fontFamily.header,
            }]}>
              SIGN IN
            </Text>

            <Text style={[styles.subtitle, {
              color: colors.textSecondary,
              fontFamily: typography.fontFamily.body,
            }]}>
              Enter your mobile number and 5-digit key
            </Text>
          </View>

          {/* Form Fields */}
          <PhoneInputWithCountry
            label="MOBILE NUMBER"
            phone={phone}
            onChangePhone={setPhone}
            dialCode={dialCode}
            onChangeDialCode={setDialCode}
            country={country}
            onChangeCountry={setCountry}
            error={errors.phone}
            containerStyle={{ marginBottom: 12 }}
          />

          <InputField
            label="5-DIGIT PIN"
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
            <Text style={[styles.forgotText, { color: colors.accent }]}>
              FORGOT PIN?
            </Text>
          </TouchableOpacity>

          <Button
            title="SIGN IN"
            variant="primary"
            onPress={handleLogin}
            loading={isLoading}
            style={styles.actionButton}
            textStyle={styles.actionButtonText}
          />

          {/* Sign Up Link */}
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
                Don't have a key? <Text style={{ color: colors.accent, fontWeight: '800' }}>SIGN UP</Text>
              </Text>
            </TouchableOpacity>
          </View>
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
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    borderRadius: 20,
    borderWidth: 1.5,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 16,
    ...Platform.select({
      web: {
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.65), 0 0 25px rgba(255, 209, 0, 0.05)',
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
    width: 56,
    height: 56,
    borderRadius: 28,
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
    letterSpacing: 0.8,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: -4,
    marginBottom: 16,
    paddingVertical: 4,
  },
  forgotText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  actionButton: {
    paddingVertical: 13,
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
  cardFooter: {
    borderTopWidth: 1,
    marginTop: 18,
    paddingTop: 12,
    alignItems: 'center',
  },
  signupLink: {
    paddingVertical: 4,
  },
  signupText: {
    fontWeight: '500',
  },
});
