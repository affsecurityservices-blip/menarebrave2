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
  const [hasCopiedPin, setHasCopiedPin] = useState(false);

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
      setHasCopiedPin(false);
      setShowPinModal(true);
    } catch (err) {
      toast.error(err.message || 'Signup failed. Please try again.');
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

  const handleContinueAfterPin = () => {
    setShowPinModal(false);
    toast.success('Account created and logged in!');
    navigation.navigate('GenderOath');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Ambient Top Glow to eliminate void feeling */}
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
        {/* Sleek Tactical Shelter Card */}
        <View style={[styles.shelterCard, {
          backgroundColor: colors.surface,
          borderColor: 'rgba(255, 209, 0, 0.22)',
        }]}>
          {/* Top Vault Badge & Step Indicator */}
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

            {/* Tactical Status Pill */}
            <View style={[styles.stepPill, {
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              borderColor: colors.border,
            }]}>
              <View style={[styles.pulseDot, { backgroundColor: colors.accent }]} />
              <Text style={[styles.stepPillText, {
                color: colors.accent,
                fontFamily: typography.fontFamily.header,
              }]}>
                {step === 1 ? 'STEP 1 OF 2 • SECURE ACCESS' : 'STEP 2 OF 2 • RECOVERY KEY'}
              </Text>
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
                ? 'Enter your mobile number. A private 5-digit encrypted key will be generated for your shelter.'
                : 'Set a secret question so you can recover your 5-digit key if you ever switch or lose your device.'}
            </Text>
          </View>

          {/* Stepper Progress Bar */}
          <View style={styles.stepperContainer}>
            <View style={styles.stepperTrack}>
              <View style={[styles.stepperSegment, { backgroundColor: colors.accent }]} />
              <View style={[styles.stepperSegment, {
                backgroundColor: step === 2 ? colors.accent : 'rgba(255, 255, 255, 0.12)',
              }]} />
            </View>
            <View style={styles.stepperLabelsRow}>
              <Text style={[styles.stepperLabel, { color: colors.accent }]}>
                1. Mobile Key {step === 2 ? '✓' : ''}
              </Text>
              <Text style={[styles.stepperLabel, {
                color: step === 2 ? colors.accent : colors.textSecondary,
              }]}>
                2. Recovery Shield
              </Text>
            </View>
          </View>

          {step === 1 ? (
            <>
              {/* Step 1: Mobile Number Input with Live Country Detection */}
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

              {/* Privacy Helper Note */}
              <View style={styles.privacyNoticeRow}>
                <MaterialCommunityIcons name="shield-check-outline" size={15} color={colors.accent} />
                <Text style={[styles.privacyNoticeText, { color: colors.textSecondary }]}>
                  Your number is encrypted & used only for authentication. Never displayed publicly.
                </Text>
              </View>

              {/* Action Button */}
              <Button
                title="CONTINUE TO RECOVERY →"
                variant="primary"
                onPress={handleContinue}
                style={styles.actionButton}
                textStyle={styles.actionButtonText}
              />

              {/* Tactical Security Trust Badges Grid */}
              <View style={[styles.trustBox, {
                backgroundColor: 'rgba(255, 209, 0, 0.04)',
                borderColor: 'rgba(255, 209, 0, 0.15)',
              }]}>
                <View style={styles.trustItem}>
                  <MaterialCommunityIcons name="incognito" size={20} color={colors.accent} />
                  <Text style={[styles.trustItemTitle, { color: colors.textPrimary }]}>100% Anonymous</Text>
                  <Text style={[styles.trustItemSub, { color: colors.textSecondary }]}>Zero names or emails</Text>
                </View>
                <View style={[styles.trustDivider, { backgroundColor: colors.border }]} />
                <View style={styles.trustItem}>
                  <MaterialCommunityIcons name="key-wireless" size={20} color={colors.accent} />
                  <Text style={[styles.trustItemTitle, { color: colors.textPrimary }]}>Device-Only PIN</Text>
                  <Text style={[styles.trustItemSub, { color: colors.textSecondary }]}>Private shelter key</Text>
                </View>
                <View style={[styles.trustDivider, { backgroundColor: colors.border }]} />
                <View style={styles.trustItem}>
                  <MaterialCommunityIcons name="shield-lock-open-outline" size={20} color={colors.accent} />
                  <Text style={[styles.trustItemTitle, { color: colors.textPrimary }]}>No Passwords</Text>
                  <Text style={[styles.trustItemSub, { color: colors.textSecondary }]}>Zero breach risk</Text>
                </View>
              </View>
            </>
          ) : (
            <>
              {/* Step 2: Registered Mobile Confirmation Badge */}
              <View style={[styles.phoneBadgeBox, {
                backgroundColor: 'rgba(255, 209, 0, 0.05)',
                borderColor: 'rgba(255, 209, 0, 0.22)',
              }]}>
                <View style={styles.phoneBadgeLeft}>
                  <MaterialCommunityIcons name="cellphone-check" size={20} color={colors.accent} style={{ marginRight: 10 }} />
                  <View>
                    <Text style={[styles.phoneBadgeLabel, { color: colors.textSecondary }]}>
                      REGISTERED DEVICE KEY
                    </Text>
                    <Text style={[styles.phoneBadgeValue, { color: colors.textPrimary }]}>
                      {country?.flag} {dialCode} {phone}
                    </Text>
                  </View>
                </View>
                <View style={[styles.verifiedPill, {
                  backgroundColor: 'rgba(42, 157, 143, 0.18)',
                  borderColor: '#2A9D8F',
                }]}>
                  <MaterialCommunityIcons name="check-circle" size={13} color="#2A9D8F" />
                  <Text style={styles.verifiedPillText}>READY</Text>
                </View>
              </View>

              {/* Security Question Selector */}
              <Text style={[styles.inputLabel, {
                color: colors.textSecondary,
                fontFamily: typography.fontFamily.body,
                fontSize: typography.sizes.xs,
              }]}>
                SECURITY RECOVERY QUESTION
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
                label="SECURITY ANSWER (FOR RECOVERY)"
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
                style={[styles.actionButton, { marginTop: spacing.md }]}
                textStyle={styles.actionButtonText}
              />

              <TouchableOpacity
                onPress={() => setStep(1)}
                style={styles.backPhoneBtn}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="arrow-left" size={15} color={colors.textSecondary} style={{ marginRight: 6 }} />
                <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: '600' }}>
                  Change mobile number
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* Sign In Link at the bottom of the card */}
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

        {/* Brotherhood Security Tagline at bottom of page */}
        <View style={styles.brotherhoodBanner}>
          <MaterialCommunityIcons name="shield-lock" size={14} color={colors.accent} style={{ marginRight: 6 }} />
          <Text style={[styles.brotherhoodText, { color: colors.textSecondary }]}>
            Protected Brotherhood Sanctuary • Zero Logs Policy
          </Text>
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
              <MaterialCommunityIcons name="shield-key" size={40} color={colors.accent} />
            </View>

            <Text style={[styles.modalTitle, {
              color: colors.textPrimary,
              fontFamily: typography.fontFamily.header,
            }]}>
              YOUR 5-DIGIT SHELTER KEY
            </Text>

            <Text style={[styles.modalSubtitle, {
              color: colors.textSecondary,
              fontFamily: typography.fontFamily.body,
            }]}>
              Save this private PIN! You will need your Phone Number and this PIN to sign in again.
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
                  size={14}
                  color={colors.accent}
                />
                <Text style={[styles.copyText, { color: colors.accent }]}>
                  {hasCopiedPin ? 'COPIED TO CLIPBOARD' : 'TAP TO COPY PIN'}
                </Text>
              </View>
            </TouchableOpacity>

            <View style={[styles.pinWarningBox, { backgroundColor: 'rgba(255, 255, 255, 0.03)' }]}>
              <MaterialCommunityIcons name="information-outline" size={16} color={colors.accent} style={{ marginRight: 8, marginTop: 1 }} />
              <Text style={[styles.pinWarning, {
                color: colors.textSecondary,
                fontFamily: typography.fontFamily.body,
              }]}>
                Tip: If you forget this key, you can reset it anytime using your security question.
              </Text>
            </View>

            <Button
              title="I HAVE SAVED MY KEY • ENTER"
              variant="primary"
              onPress={handleContinueAfterPin}
              style={{ marginTop: 16, paddingVertical: 14 }}
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
    marginBottom: 18,
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
  stepPill: {
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
  stepPillText: {
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
  stepperContainer: {
    marginBottom: 20,
    marginTop: 4,
  },
  stepperTrack: {
    flexDirection: 'row',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    gap: 6,
    marginBottom: 6,
  },
  stepperSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  stepperLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  stepperLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  privacyNoticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  privacyNoticeText: {
    fontSize: 11,
    marginLeft: 6,
    lineHeight: 15,
    flex: 1,
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
  trustBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginTop: 20,
  },
  trustItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  trustItemTitle: {
    fontSize: 11,
    fontWeight: '800',
    marginTop: 5,
    textAlign: 'center',
  },
  trustItemSub: {
    fontSize: 9.5,
    marginTop: 2,
    textAlign: 'center',
  },
  trustDivider: {
    width: 1,
    height: 32,
    opacity: 0.4,
  },
  phoneBadgeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 18,
  },
  phoneBadgeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  phoneBadgeLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  phoneBadgeValue: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  verifiedPillText: {
    color: '#2A9D8F',
    fontSize: 10,
    fontWeight: '800',
    marginLeft: 3,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  cardFooter: {
    borderTopWidth: 1,
    marginTop: 18,
    paddingTop: 14,
    alignItems: 'center',
  },
  loginLink: {
    paddingVertical: 4,
  },
  loginText: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 390,
    borderRadius: 20,
    borderWidth: 2,
    padding: 26,
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
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
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
    paddingHorizontal: 8,
  },
  pinDisplayBox: {
    width: '100%',
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 16,
    marginVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinDisplayText: {
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: 10,
  },
  copyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  copyText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginLeft: 5,
  },
  pinWarningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 8,
    padding: 10,
    width: '100%',
  },
  pinWarning: {
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },
});

