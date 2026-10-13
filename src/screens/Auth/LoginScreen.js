import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';
import InputField from '../../components/common/InputField';
import { validatePhone, validatePin } from '../../utils/validators';

export default function LoginScreen({ navigation }) {
  const { colors, typography, spacing } = useTheme();
  const { loginWithPhone, isLoading } = useAuth();
  const toast = useToast();

  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [errors, setErrors] = useState({});

  const handleLogin = async () => {
    const newErrors = {};
    if (!validatePhone(phone)) newErrors.phone = 'Enter a valid 10-digit mobile number';
    if (!validatePin(pin)) newErrors.pin = 'Enter your 5-digit shelter PIN';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setErrors({});
      await loginWithPhone(phone, pin);
      toast.success('Shield verified. Welcome back.');
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check phone number and 5-digit PIN.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, padding: spacing.lg }]}>
      <View style={styles.form}>
        <Text style={[styles.title, {
          color: colors.textPrimary,
          fontFamily: typography.fontFamily.header,
          fontSize: typography.sizes.xxl,
          marginBottom: spacing.xs,
          textAlign: 'center',
        }]}>
          RE-ENTER THE FEED
        </Text>
        <Text style={{
          color: colors.textSecondary,
          fontFamily: typography.fontFamily.body,
          fontSize: typography.sizes.sm,
          marginBottom: spacing.lg,
          textAlign: 'center',
        }}>
          Sign in using your mobile number and 5-digit key
        </Text>

        <InputField
          label="PHONE NUMBER"
          placeholder="10-digit mobile number"
          value={phone}
          onChangeText={(val) => setPhone(val.replace(/[^0-9]/g, ''))}
          error={errors.phone}
          keyboardType="phone-pad"
          maxLength={10}
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
        >
          <Text style={[styles.forgotText, { color: colors.accent, fontFamily: typography.fontFamily.body, fontSize: typography.sizes.xs }]}>
            FORGOT 5-DIGIT PIN?
          </Text>
        </TouchableOpacity>

        <Button
          title="SIGN IN"
          variant="primary"
          onPress={handleLogin}
          loading={isLoading}
          style={{ marginTop: spacing.md }}
        />
      </View>

      <TouchableOpacity
        onPress={() => navigation.navigate('Signup')}
        style={styles.signupLink}
      >
        <Text style={[styles.signupText, { color: colors.textSecondary, fontFamily: typography.fontFamily.body, fontSize: typography.sizes.sm }]}>
          Don't have a shelter? <Text style={{ color: colors.accent, fontWeight: '700' }}>SIGN UP</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  form: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotText: {
    fontWeight: '700',
  },
  signupLink: {
    alignSelf: 'center',
    paddingVertical: 12,
  },
  signupText: {
    fontWeight: '500',
  },
});
