import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';
import InputField from '../../components/common/InputField';
import PhoneInputWithCountry from '../../components/common/PhoneInputWithCountry';
import { validateLocalPhone } from '../../utils/validators';
import { DEFAULT_COUNTRY } from '../../utils/countries';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const SECURITY_QUESTIONS = [
  'What is your secret brotherhood code phrase?',
  'What city were you born in?',
  'What was your childhood nickname?',
  'What was your first pet or mentor name?',
  'What was the model of your first vehicle?',
];

export default function SignupScreen({ navigation }) {
  const { colors, typography, spacing } = useTheme();
  const { signupWithPhone, isLoading } = useAuth();
  const toast = useToast();

  const [step, setStep] = useState(1); // 1: Phone number, 2: Security recovery challenge
  const [phone, setPhone] = useState('');
  const [dialCode, setDialCode] = useState('+91');
  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  const [selectedQuestion, setSelectedQuestion] = useState(SECURITY_QUESTIONS[0]);
  const [isQuestionDropdownOpen, setIsQuestionDropdownOpen] = useState(false);
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [errors, setErrors] = useState({});

  // Generated PIN Modal State
  const [generatedPin, setGeneratedPin] = useState(null);
  const [showPinModal, setShowPinModal] = useState(false);

  const handleContinue = () => {
    const newErrors = {};
    if (!validateLocalPhone(phone, country)) {
      newErrors.phone = country?.dialCode === '+91'
        ? 'Enter a valid 10-digit mobile number'
        : 'Enter a valid mobile number for selected country';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setStep(2);
  };

  const handleSignup = async () => {
    const newErrors = {};
    if (!securityAnswer.trim()) {
      newErrors.securityAnswer = 'Answer is required for recovery';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setErrors({});
      // Generate a random 5-digit PIN
      const randomPin = Math.floor(10000 + Math.random() * 90000).toString();
      
      const result = await signupWithPhone(
        phone,
        randomPin,
        selectedQuestion,
        securityAnswer,
        country?.name || 'India',
        dialCode || '+91'
      );
      setGeneratedPin(result.pin);
      setShowPinModal(true);
    } catch (err) {
      toast.error(err.message || 'Signup failed. Please try again.');
    }
  };

  const handleContinueAfterPin = () => {
    setShowPinModal(false);
    toast.success('Account created and logged in!');
    navigation.navigate('GenderOath');
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
            {step === 1 ? 'CREATE SHELTER KEYS' : 'RECOVERY CHALLENGE'}
          </Text>
          <Text style={{
            color: colors.textSecondary,
            fontFamily: typography.fontFamily.body,
            fontSize: typography.sizes.sm,
            marginBottom: spacing.lg,
            textAlign: 'center',
            lineHeight: 20,
          }}>
            {step === 1
              ? 'Enter your mobile number. A private 5-digit key will be generated for you.'
              : 'Set a secret question so you can recover your 5-digit key if ever forgotten.'}
          </Text>

          {step === 1 ? (
            <>
              {/* Step 1: Only Phone Number with Country Code & Live Region Banner */}
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
                title="CONTINUE"
                variant="primary"
                onPress={handleContinue}
                style={{ marginTop: spacing.md }}
              />
            </>
          ) : (
            <>
              {/* Step 2: Selected Mobile Confirmation Badge */}
              <View style={[styles.phoneBadgeBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Registered Key:</Text>
                <Text style={{ color: colors.accent, fontWeight: '700', fontSize: 13, marginLeft: 8 }}>
                  {country?.flag} {dialCode} {phone}
                </Text>
              </View>

              {/* Security Question Selector */}
              <Text style={[styles.inputLabel, { color: colors.textSecondary, fontFamily: typography.fontFamily.body, fontSize: typography.sizes.xs }]}>
                SECURITY RECOVERY QUESTION
              </Text>
              <TouchableOpacity
                style={[styles.dropdownButton, {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  padding: spacing.md,
                  borderRadius: spacing.borderRadius.xs,
                  marginBottom: isQuestionDropdownOpen ? spacing.xs : spacing.md,
                }]}
                onPress={() => setIsQuestionDropdownOpen(!isQuestionDropdownOpen)}
                activeOpacity={0.8}
              >
                <Text style={{ color: colors.textPrimary, fontFamily: typography.fontFamily.body, fontSize: 13, flex: 1 }}>
                  {selectedQuestion}
                </Text>
                <MaterialCommunityIcons
                  name={isQuestionDropdownOpen ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={colors.accent}
                />
              </TouchableOpacity>

              {isQuestionDropdownOpen && (
                <View style={[styles.dropdownList, { backgroundColor: colors.surface, borderColor: colors.border, marginBottom: spacing.md }]}>
                  {SECURITY_QUESTIONS.map((q, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.dropdownItem, {
                        backgroundColor: selectedQuestion === q ? colors.yellowMuted : 'transparent',
                        borderBottomColor: colors.border,
                        borderBottomWidth: idx < SECURITY_QUESTIONS.length - 1 ? 1 : 0,
                        padding: spacing.sm,
                      }]}
                      onPress={() => {
                        setSelectedQuestion(q);
                        setIsQuestionDropdownOpen(false);
                      }}
                    >
                      <Text style={{ color: selectedQuestion === q ? colors.accent : colors.textPrimary, fontSize: 12 }}>
                        {q}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <InputField
                label="SECURITY ANSWER (FOR FORGOT PASSWORD)"
                placeholder="Your secret answer..."
                value={securityAnswer}
                onChangeText={setSecurityAnswer}
                error={errors.securityAnswer}
                autoCapitalize="none"
              />

              <Button
                title="GENERATE 5-DIGIT KEY & SIGN UP"
                variant="primary"
                onPress={handleSignup}
                loading={isLoading}
                style={{ marginTop: spacing.md }}
              />

              <TouchableOpacity
                onPress={() => setStep(1)}
                style={styles.backPhoneBtn}
              >
                <Text style={{ color: colors.textSecondary, fontSize: 12, textAlign: 'center' }}>
                  ← Change mobile number
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={styles.loginLink}
        >
          <Text style={[styles.loginText, { color: colors.textSecondary, fontFamily: typography.fontFamily.body, fontSize: typography.sizes.sm }]}>
            Already running? <Text style={{ color: colors.accent, fontWeight: '700' }}>SIGN IN</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Generated 5-digit PIN Reveal Modal */}
      <Modal
        visible={showPinModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.accent }]}>
            <MaterialCommunityIcons name="shield-key" size={48} color={colors.accent} style={{ alignSelf: 'center', marginBottom: 12 }} />
            <Text style={[styles.modalTitle, { color: colors.textPrimary, fontFamily: typography.fontFamily.header }]}>
              YOUR 5-DIGIT SHELTER KEY
            </Text>
            <Text style={[styles.modalSubtitle, { color: colors.textSecondary, fontFamily: typography.fontFamily.body }]}>
              Save this PIN! You will need your Phone Number and this PIN to sign in again.
            </Text>

            <View style={[styles.pinDisplayBox, { backgroundColor: colors.yellowMuted, borderColor: colors.accent }]}>
              <Text style={[styles.pinDisplayText, { color: colors.accent, fontFamily: typography.fontFamily.header }]}>
                {generatedPin}
              </Text>
            </View>

            <Text style={[styles.pinWarning, { color: colors.textSecondary, fontFamily: typography.fontFamily.body }]}>
              Tip: If you forget this key, you can reset it anytime using your security question.
            </Text>

            <Button
              title="I HAVE SAVED MY KEY • ENTER"
              variant="primary"
              onPress={handleContinueAfterPin}
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
  inputLabel: {
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
  },
  dropdownList: {
    borderWidth: 1,
    borderRadius: 6,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  loginLink: {
    alignSelf: 'center',
    paddingVertical: 12,
  },
  loginText: {
    fontWeight: '500',
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
  phoneBadgeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  backPhoneBtn: {
    alignSelf: 'center',
    paddingVertical: 14,
  },
});
