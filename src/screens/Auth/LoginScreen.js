import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';
import InputField from '../../components/common/InputField';
import PhoneInputWithCountry from '../../components/common/PhoneInputWithCountry';
import { validateLocalPhone, validatePin } from '../../utils/validators';
import { DEFAULT_COUNTRY } from '../../utils/countries';

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
      <View style={styles.form}>
        <Text style={[styles.title, {
          color: colors.textPrimary,
          fontFamily: typography.fontFamily.header,
          fontSize: 20,
          marginBottom: 4,
          textAlign: 'center',
        }]}>
          RE-ENTER THE FEED
        </Text>
        <Text style={{
          color: colors.textSecondary,
          fontFamily: typography.fontFamily.body,
          fontSize: 12,
          marginBottom: 14,
          textAlign: 'center',
          lineHeight: 17,
        }}>
          Sign in using your mobile number and 5-digit key
        </Text>

        <PhoneInputWithCountry
          label="PHONE NUMBER"
          phone={phone}
          onChangePhone={setPhone}
          dialCode={dialCode}
          onChangeDialCode={setDialCode}
          country={country}
          onChangeCountry={setCountry}
          error={errors.phone}
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
          style={{ marginTop: 8, paddingVertical: 12 }}
          textStyle={{ fontSize: 13, letterSpacing: 0.5 }}
        />
      </View>

      <TouchableOpacity
        onPress={() => navigation.navigate('Signup')}
        style={styles.signupLink}
      >
        <Text style={[styles.signupText, { color: colors.textSecondary, fontFamily: typography.fontFamily.body, fontSize: 12 }]}>
          Don't have a shelter? <Text style={{ color: colors.accent, fontWeight: '700' }}>SIGN UP</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 14,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  form: {
    width: '100%',
    maxWidth: 350,
    alignSelf: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 14,
  },
  forgotText: {
    fontWeight: '700',
  },
  signupLink: {
    alignSelf: 'center',
    paddingVertical: 8,
  },
  signupText: {
    fontWeight: '500',
  },
});
