import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
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
import { validateLocalPhone } from '../../utils/validators';
import { DEFAULT_COUNTRY } from '../../utils/countries';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const SECURITY_QUESTIONS = [
  'What was the name of your first school?',
  'What city were you born in?',
  'What was your childhood nickname?',
  'What was the name of your first pet?',
  'What was the model of your first vehicle?',
];

export default function SignupScreen({ navigation }) {
  const { colors, typography, spacing } = useTheme();
  const { signupWithPhone, loginWithPhone, checkPhoneExists, isLoading } = useAuth();
  const toast = useToast();

  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [dialCode, setDialCode] = useState('+91');
  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  const [selectedQuestion, setSelectedQuestion] = useState(SECURITY_QUESTIONS[0]);
  const [isQuestionDropdownOpen, setIsQuestionDropdownOpen] = useState(false);
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [errors, setErrors] = useState({});
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);

  // Generated PIN Modal State
  const [generatedPin, setGeneratedPin] = useState(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [hasCopiedPin, setHasCopiedPin] = useState(false);
  const [isEntering, setIsEntering] = useState(false);

  const handleContinue = async () => {
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

    // Check if phone number is already registered
    try {
      setIsCheckingPhone(true);
      const exists = await checkPhoneExists(phone, dialCode);
      setIsCheckingPhone(false);

      if (exists) {
        toast.info('Account already exists! Please sign in with your PIN.');
        setErrors({ phone: 'Account already exists. Please sign in.' });
        return;
      }
    } catch {
      setIsCheckingPhone(false);
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
      setHasCopiedPin(false);
      setShowPinModal(true);
    } catch (err) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('already exists') || msg.toLowerCase().includes('already registered')) {
        toast.info('Account already exists! Redirecting to Sign In...');
        setTimeout(() => {
          navigation.navigate('Login');
        }, 1200);
      } else {
        toast.error(msg || 'Signup failed. Please try again.');
      }
    }
  };

  const handleCopyPin = async () => {
    if (!generatedPin) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(generatedPin);
        setHasCopiedPin(true);
        toast.success('PIN copied to clipboard!');
      } else {
        toast.info(`PIN: ${generatedPin}`);
      }
    } catch {
      toast.info(`PIN: ${generatedPin}`);
    }
  };

  const handleContinueAfterPin = async () => {
    try {
      setIsEntering(true);
      await loginWithPhone(phone, generatedPin, dialCode);
      setShowPinModal(false);
      setIsEntering(false);
      toast.success('Shield verified. Welcome to the feed.');
    } catch (err) {
      setIsEntering(false);
      setShowPinModal(false);
      toast.info('Account created! Please sign in with your PIN.');
      navigation.navigate('Login');
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
          {/* Glowing Emblem */}
          <View style={styles.header}>
            <View style={[styles.iconBadge, {
              backgroundColor: colors.yellowMuted,
              borderColor: 'rgba(255, 209, 0, 0.35)',
            }]}>
              <MaterialCommunityIcons
                name={step === 1 ? 'shield-key' : 'shield-account-outline'}
                size={28}
                color={colors.accent}
              />
            </View>

            <Text style={[styles.title, {
              color: colors.textPrimary,
              fontFamily: typography.fontFamily.header,
            }]}>
              {step === 1 ? 'CREATE SHELTER KEYS' : 'RECOVERY CHALLENGE'}
            </Text>

            <Text style={[styles.subtitle, {
              color: colors.textSecondary,
              fontFamily: typography.fontFamily.body,
            }]}>
              {step === 1
                ? 'Generate your private 5-digit encrypted key'
                : 'Set a secret answer to restore your key anytime'}
            </Text>

            {/* Ultra-minimal step bar */}
            <View style={styles.stepperTrack}>
              <View style={[styles.stepperSegment, { backgroundColor: colors.accent }]} />
              <View style={[styles.stepperSegment, {
                backgroundColor: step === 2 ? colors.accent : 'rgba(255, 255, 255, 0.12)',
              }]} />
            </View>
          </View>

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
                containerStyle={{ marginBottom: 16 }}
              />

              <Button
                title="CONTINUE"
                variant="primary"
                onPress={handleContinue}
                loading={isCheckingPhone}
                style={styles.actionButton}
                textStyle={styles.actionButtonText}
              />
            </>
          ) : (
            <>
              {/* Confirmed Mobile Badge */}
              <View style={[styles.phoneBadgeBox, {
                backgroundColor: 'rgba(255, 209, 0, 0.05)',
                borderColor: 'rgba(255, 209, 0, 0.22)',
              }]}>
                <Text style={{ color: colors.textPrimary, fontWeight: '700', fontSize: 13 }}>
                  {country?.flag} {dialCode} {phone}
                </Text>
                <MaterialCommunityIcons name="check-circle" size={16} color="#2A9D8F" />
              </View>

              {/* Security Question Selector */}
              <Text style={[styles.inputLabel, {
                color: colors.textSecondary,
                fontFamily: typography.fontFamily.body,
                fontSize: typography.sizes.xs,
              }]}>
                SECURITY QUESTION
              </Text>

              <TouchableOpacity
                style={[styles.dropdownButton, {
                  backgroundColor: colors.surfaceLight || '#22222E',
                  borderColor: colors.border,
                  padding: spacing.md,
                  borderRadius: spacing.borderRadius.xs,
                  marginBottom: isQuestionDropdownOpen ? spacing.xs : spacing.md,
                }]}
                onPress={() => setIsQuestionDropdownOpen(!isQuestionDropdownOpen)}
                activeOpacity={0.8}
              >
                <Text style={{
                  color: colors.textPrimary,
                  fontFamily: typography.fontFamily.body,
                  fontSize: 13,
                  flex: 1,
                }}>
                  {selectedQuestion}
                </Text>
                <MaterialCommunityIcons
                  name={isQuestionDropdownOpen ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={colors.accent}
                />
              </TouchableOpacity>

              {isQuestionDropdownOpen && (
                <View style={[styles.dropdownList, {
                  backgroundColor: colors.surfaceLight || '#22222E',
                  borderColor: colors.border,
                  marginBottom: spacing.md,
                }]}>
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
                      <Text style={{
                        color: selectedQuestion === q ? colors.accent : colors.textPrimary,
                        fontSize: 12,
                        fontWeight: selectedQuestion === q ? '700' : '400',
                      }}>
                        {q}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <InputField
                label="SECRET ANSWER"
                placeholder="Your answer..."
                value={securityAnswer}
                onChangeText={setSecurityAnswer}
                error={errors.securityAnswer}
                autoCapitalize="none"
              />

              <Button
                title="GENERATE KEY"
                variant="primary"
                onPress={handleSignup}
                loading={isLoading}
                style={[styles.actionButton, { marginTop: spacing.md }]}
                textStyle={styles.actionButtonText}
              />

              <TouchableOpacity
                onPress={() => setStep(1)}
                style={styles.backPhoneBtn}
                activeOpacity={0.7}
              >
                <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '600' }}>
                  ← Change number
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* Sign In Link */}
          <View style={[styles.cardFooter, { borderTopColor: 'rgba(255, 255, 255, 0.06)' }]}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              style={styles.loginLink}
              activeOpacity={0.8}
            >
              <Text style={[styles.loginText, {
                color: colors.textSecondary,
                fontFamily: typography.fontFamily.body,
                fontSize: 13,
              }]}>
                Already running? <Text style={{ color: colors.accent, fontWeight: '800' }}>SIGN IN</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Generated 5-digit PIN Reveal Modal */}
      <Modal
        visible={showPinModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, {
            backgroundColor: colors.surface,
            borderColor: colors.accent,
          }]}>
            <View style={[styles.modalBadge, { backgroundColor: colors.yellowMuted }]}>
              <MaterialCommunityIcons name="shield-key" size={36} color={colors.accent} />
            </View>

            <Text style={[styles.modalTitle, {
              color: colors.textPrimary,
              fontFamily: typography.fontFamily.header,
            }]}>
              YOUR 5-DIGIT KEY
            </Text>

            <Text style={[styles.modalSubtitle, {
              color: colors.textSecondary,
              fontFamily: typography.fontFamily.body,
            }]}>
              Save this PIN to sign into your shelter.
            </Text>

            <TouchableOpacity
              style={[styles.pinDisplayBox, {
                backgroundColor: colors.yellowMuted,
                borderColor: colors.accent,
              }]}
              onPress={handleCopyPin}
              activeOpacity={0.85}
            >
              <Text style={[styles.pinDisplayText, {
                color: colors.accent,
                fontFamily: typography.fontFamily.header,
              }]}>
                {generatedPin}
              </Text>
              <View style={styles.copyRow}>
                <MaterialCommunityIcons
                  name={hasCopiedPin ? 'check' : 'content-copy'}
                  size={13}
                  color={colors.accent}
                />
                <Text style={[styles.copyText, { color: colors.accent }]}>
                  {hasCopiedPin ? 'COPIED' : 'TAP TO COPY'}
                </Text>
              </View>
            </TouchableOpacity>

            <Button
              title="I HAVE SAVED MY KEY • ENTER"
              variant="primary"
              onPress={handleContinueAfterPin}
              loading={isEntering}
              style={{ marginTop: 12, paddingVertical: 14, width: '100%' }}
              textStyle={{ fontSize: 13, letterSpacing: 0.8, fontWeight: '800' }}
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
    marginBottom: 14,
  },
  stepperTrack: {
    flexDirection: 'row',
    width: 70,
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
    gap: 4,
  },
  stepperSegment: {
    flex: 1,
    height: 3,
    borderRadius: 2,
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
  phoneBadgeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
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
    borderRadius: 8,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  backPhoneBtn: {
    alignSelf: 'center',
    paddingVertical: 10,
    marginTop: 6,
  },
  cardFooter: {
    borderTopWidth: 1,
    marginTop: 18,
    paddingTop: 12,
    alignItems: 'center',
  },
  loginLink: {
    paddingVertical: 4,
  },
  loginText: {
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 20,
    borderWidth: 2,
    padding: 22,
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
      },
      default: {
        elevation: 10,
      },
    }),
  },
  modalBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 1,
  },
  modalSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  pinDisplayBox: {
    width: '100%',
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 14,
    marginVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinDisplayText: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 8,
  },
  copyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  copyText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginLeft: 4,
  },
});
