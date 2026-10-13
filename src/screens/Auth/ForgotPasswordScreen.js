import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';
import InputField from '../../components/common/InputField';
import PhoneInputWithCountry from '../../components/common/PhoneInputWithCountry';
import { validateLocalPhone } from '../../utils/validators';
import { DEFAULT_COUNTRY } from '../../utils/countries';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ForgotPasswordScreen({ navigation }) {
  const { colors, typography, spacing } = useTheme();
  const { fetchSecurityQuestion, resetPasswordWithAnswer, loginWithPhone } = useAuth();
  const toast = useToast();

  const [step, setStep] = useState(1); // 1: Enter Phone, 2: Answer Question
  const [phone, setPhone] = useState('');
  const [dialCode, setDialCode] = useState('+91');
  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Reset PIN Result Modal
  const [newPin, setNewPin] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Step 1: Lookup Security Question
  const handleLookupQuestion = async () => {
    if (!validateLocalPhone(phone, country)) {
      setErrors({
        phone: country?.dialCode === '+91'
          ? 'Enter a valid 10-digit mobile number'
          : 'Enter a valid mobile number for selected country'
      });
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const res = await fetchSecurityQuestion(phone, dialCode);
      setLoading(false);
      if (res?.success && res?.question) {
        setSecurityQuestion(res.question);
        setStep(2);
      } else {
        toast.error(res?.error || 'No shelter found for this phone number.');
      }
    } catch (err) {
      setLoading(false);
      toast.error(err.message || 'Error looking up security question.');
    }
  };

  // Step 2: Verify Answer and Reset Password
  const handleVerifyAndReset = async () => {
    if (!answer.trim()) {
      setErrors({ answer: 'Please enter your secret answer' });
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const res = await resetPasswordWithAnswer(phone, answer, dialCode);
      setLoading(false);
      if (res?.success && res?.new_password) {
        setNewPin(res.new_password);
        setShowResultModal(true);
      } else {
        toast.error(res?.error || 'Incorrect security answer. Please try again.');
      }
    } catch (err) {
      setLoading(false);
      toast.error(err.message || 'Error verifying answer.');
    }
  };

  // Direct login with new PIN
  const handleSignInWithNewPin = async () => {
    if (!newPin) return;
    setIsLoggingIn(true);
    try {
      await loginWithPhone(phone, newPin, dialCode);
      setShowResultModal(false);
      toast.success('Access restored! Welcome back.');
    } catch (err) {
      setIsLoggingIn(false);
      toast.error(err.message || 'Auto sign-in failed. Please login manually.');
      navigation.navigate('Login');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, padding: spacing.lg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.form}>
          <Text style={[styles.title, {
            color: colors.textPrimary,
            fontFamily: typography.fontFamily.header,
            fontSize: typography.sizes.xxl,
            marginBottom: spacing.xs,
            textAlign: 'center',
          }]}>
            RECOVER KEYS
          </Text>

          <Text style={[styles.subtitle, {
            color: colors.textSecondary,
            fontFamily: typography.fontFamily.body,
            fontSize: typography.sizes.sm,
            lineHeight: 20,
            marginBottom: spacing.lg,
            textAlign: 'center',
          }]}>
            {step === 1
              ? 'Enter your mobile number to retrieve your registered security challenge.'
              : 'Answer the question you set during registration to generate a new 5-digit key.'}
          </Text>

          {step === 1 ? (
            <>
              <PhoneInputWithCountry
                label="MOBILE NUMBER"
                phone={phone}
                onChangePhone={setPhone}
                dialCode={dialCode}
                onChangeDialCode={setDialCode}
                country={country}
                onChangeCountry={setCountry}
                error={errors.phone}
              />

              <Button
                title="RETRIEVE SECURITY QUESTION"
                variant="primary"
                onPress={handleLookupQuestion}
                loading={loading}
                style={{ marginTop: spacing.md }}
              />
            </>
          ) : (
            <>
              {/* Question display card */}
              <View style={[styles.questionCard, { backgroundColor: colors.surface, borderColor: colors.accent }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                  <MaterialCommunityIcons name="help-circle" size={18} color={colors.accent} />
                  <Text style={[styles.questionLabel, { color: colors.accent, fontFamily: typography.fontFamily.header, marginLeft: 6 }]}>
                    YOUR SECURITY CHALLENGE
                  </Text>
                </View>
                <Text style={[styles.questionText, { color: colors.textPrimary, fontFamily: typography.fontFamily.body }]}>
                  {securityQuestion}
                </Text>
              </View>

              <InputField
                label="SECRET ANSWER"
                placeholder="Enter your registered answer..."
                value={answer}
                onChangeText={setAnswer}
                error={errors.answer}
                autoCapitalize="none"
              />

              <Button
                title="VERIFY & GENERATE NEW KEY"
                variant="primary"
                onPress={handleVerifyAndReset}
                loading={loading}
                style={{ marginTop: spacing.md }}
              />

              <TouchableOpacity
                onPress={() => setStep(1)}
                style={styles.changePhoneBtn}
              >
                <Text style={{ color: colors.textSecondary, fontSize: 12, textAlign: 'center' }}>
                  Use a different phone number
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={styles.backLink}
        >
          <Text style={[styles.backText, { color: colors.accent, fontFamily: typography.fontFamily.body, fontSize: typography.sizes.sm }]}>
            ← BACK TO SIGN IN
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* New PIN Result Modal */}
      <Modal
        visible={showResultModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.accent }]}>
            <MaterialCommunityIcons name="check-decagram" size={50} color={colors.accent} style={{ alignSelf: 'center', marginBottom: 12 }} />
            
            <Text style={[styles.modalTitle, { color: colors.textPrimary, fontFamily: typography.fontFamily.header }]}>
              NEW 5-DIGIT KEY GENERATED
            </Text>
            
            <Text style={[styles.modalSubtitle, { color: colors.textSecondary, fontFamily: typography.fontFamily.body }]}>
              Verification successful. Your new access PIN for {phone} has been hashed and updated.
            </Text>

            <View style={[styles.pinDisplayBox, { backgroundColor: colors.yellowMuted, borderColor: colors.accent }]}>
              <Text style={[styles.pinDisplayText, { color: colors.accent, fontFamily: typography.fontFamily.header }]}>
                {newPin}
              </Text>
            </View>

            <Text style={[styles.pinWarning, { color: colors.textSecondary, fontFamily: typography.fontFamily.body }]}>
              Please note this PIN down. You can now use it anytime to log in.
            </Text>

            <Button
              title="SIGN IN NOW WITH NEW KEY"
              variant="primary"
              onPress={handleSignInWithNewPin}
              loading={isLoggingIn}
              style={{ marginTop: 16 }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
  subtitle: {
    fontWeight: '500',
  },
  questionCard: {
    borderWidth: 1.5,
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
  },
  questionLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  questionText: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  changePhoneBtn: {
    alignSelf: 'center',
    paddingVertical: 12,
  },
  backLink: {
    alignSelf: 'center',
    paddingVertical: 14,
  },
  backText: {
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 16,
    borderWidth: 2,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 1,
  },
  modalSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  pinDisplayBox: {
    borderWidth: 2,
    borderRadius: 8,
    paddingVertical: 16,
    marginVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinDisplayText: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 8,
  },
  pinWarning: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
});
