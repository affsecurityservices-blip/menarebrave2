import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
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

export default function ForgotPasswordScreen({ navigation }) {
  const { colors, typography, spacing } = useTheme();
  const { fetchSecurityQuestion, resetPasswordWithAnswer, loginWithPhone } = useAuth();
  const toast = useToast();

  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [dialCode, setDialCode] = useState('+91');
  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityQuestion2, setSecurityQuestion2] = useState('');
  const [activeQuestionTab, setActiveQuestionTab] = useState(1);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Reset PIN Result Modal
  const [newPin, setNewPin] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [hasCopiedPin, setHasCopiedPin] = useState(false);

  const handleLookupQuestion = async () => {
    if (!validateLocalPhone(phone, country)) {
      setErrors({
        phone: country?.dialCode === '+91'
          ? 'Enter a valid 10-digit mobile number'
          : 'Enter a valid mobile number for selected country',
      });
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const res = await fetchSecurityQuestion(phone, dialCode);
      setLoading(false);
      if (res?.success && (res?.question || res?.question_2)) {
        setSecurityQuestion(res.question || '');
        setSecurityQuestion2(res.question_2 || '');
        setActiveQuestionTab(res.question ? 1 : 2);
        setStep(2);
      } else {
        toast.error(res?.error || 'No account found for this mobile number.');
      }
    } catch (err) {
      setLoading(false);
      toast.error(err.message || 'Error looking up security question.');
    }
  };

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
        setHasCopiedPin(false);
        setShowResultModal(true);
      } else {
        toast.error(res?.error || 'Incorrect answer. Please try again.');
      }
    } catch (err) {
      setLoading(false);
      toast.error(err.message || 'Error verifying answer.');
    }
  };

  const handleSignInWithNewPin = async () => {
    if (!newPin) return;
    setIsLoggingIn(true);
    try {
      await loginWithPhone(phone, newPin, dialCode);
      setShowResultModal(false);
      toast.success('Access restored! Welcome back.');
    } catch (err) {
      setIsLoggingIn(false);
      toast.error(err.message || 'Sign in failed. Please login manually.');
      navigation.navigate('Login');
    }
  };

  const handleCopyPin = async () => {
    if (!newPin) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(newPin);
        setHasCopiedPin(true);
        toast.success('PIN copied!');
      } else {
        toast.info(`PIN: ${newPin}`);
      }
    } catch {
      toast.info(`PIN: ${newPin}`);
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
                name={step === 1 ? 'key-wireless' : 'shield-sync'}
                size={28}
                color={colors.accent}
              />
            </View>

            <Text style={[styles.title, {
              color: colors.textPrimary,
              fontFamily: typography.fontFamily.header,
            }]}>
              RECOVER KEYS
            </Text>

            <Text style={[styles.subtitle, {
              color: colors.textSecondary,
              fontFamily: typography.fontFamily.body,
            }]}>
              {step === 1
                ? 'Enter mobile number to find security challenge'
                : 'Answer your question to generate a new key'}
            </Text>

            {/* Step line */}
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
                onPress={handleLookupQuestion}
                loading={loading}
                style={styles.actionButton}
                textStyle={styles.actionButtonText}
              />
            </>
          ) : (
            <>
              {/* Dual Question Switcher if backup exists */}
              {securityQuestion && securityQuestion2 ? (
                <View style={{ marginBottom: 14 }}>
                  <Text style={{
                    color: colors.textSecondary,
                    fontSize: 11,
                    fontWeight: '700',
                    letterSpacing: 0.5,
                    marginBottom: 8,
                  }}>
                    CHOOSE QUESTION TO ANSWER (EXTRA RECOVERY CHANCE)
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        paddingVertical: 9,
                        paddingHorizontal: 8,
                        borderRadius: 8,
                        borderWidth: 1.5,
                        borderColor: activeQuestionTab === 1 ? colors.accent : 'rgba(255, 255, 255, 0.12)',
                        backgroundColor: activeQuestionTab === 1 ? 'rgba(255, 209, 0, 0.14)' : 'rgba(255, 255, 255, 0.03)',
                        alignItems: 'center',
                      }}
                      onPress={() => {
                        setActiveQuestionTab(1);
                        setAnswer('');
                        setErrors({});
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={{
                        color: activeQuestionTab === 1 ? colors.accent : colors.textSecondary,
                        fontSize: 12,
                        fontWeight: activeQuestionTab === 1 ? '800' : '600',
                      }}>
                        Question #1
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={{
                        flex: 1,
                        paddingVertical: 9,
                        paddingHorizontal: 8,
                        borderRadius: 8,
                        borderWidth: 1.5,
                        borderColor: activeQuestionTab === 2 ? colors.accent : 'rgba(255, 255, 255, 0.12)',
                        backgroundColor: activeQuestionTab === 2 ? 'rgba(255, 209, 0, 0.14)' : 'rgba(255, 255, 255, 0.03)',
                        alignItems: 'center',
                      }}
                      onPress={() => {
                        setActiveQuestionTab(2);
                        setAnswer('');
                        setErrors({});
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={{
                        color: activeQuestionTab === 2 ? colors.accent : colors.textSecondary,
                        fontSize: 12,
                        fontWeight: activeQuestionTab === 2 ? '800' : '600',
                      }}>
                        Backup Question #2
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null}

              {/* Question display card */}
              <View style={[styles.questionCard, {
                backgroundColor: 'rgba(255, 209, 0, 0.06)',
                borderColor: 'rgba(255, 209, 0, 0.22)',
              }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={[styles.questionLabel, { color: colors.accent }]}>
                    {activeQuestionTab === 2 ? 'BACKUP QUESTION' : 'SECURITY QUESTION'}
                  </Text>
                  {securityQuestion2 && (
                    <Text style={{ color: colors.textSecondary, fontSize: 10, fontWeight: '700' }}>
                      TAB {activeQuestionTab} OF 2
                    </Text>
                  )}
                </View>
                <Text style={[styles.questionText, { color: colors.textPrimary }]}>
                  {activeQuestionTab === 2 ? securityQuestion2 : securityQuestion}
                </Text>
              </View>

              <InputField
                label="SECRET ANSWER"
                placeholder={activeQuestionTab === 2 ? "Enter backup question answer..." : "Enter your secret answer..."}
                value={answer}
                onChangeText={setAnswer}
                error={errors.answer}
                autoCapitalize="none"
              />

              <Button
                title="RESET KEY"
                variant="primary"
                onPress={handleVerifyAndReset}
                loading={loading}
                style={[styles.actionButton, { marginTop: spacing.md }]}
                textStyle={styles.actionButtonText}
              />

              <TouchableOpacity
                onPress={() => setStep(1)}
                style={styles.changePhoneBtn}
                activeOpacity={0.7}
              >
                <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '600' }}>
                  ← Change number
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* Back link */}
          <View style={[styles.cardFooter, { borderTopColor: 'rgba(255, 255, 255, 0.06)' }]}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              style={styles.backLink}
              activeOpacity={0.8}
            >
              <Text style={[styles.backText, { color: colors.accent }]}>
                ← BACK TO SIGN IN
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* New PIN Result Modal */}
      <Modal
        visible={showResultModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, {
            backgroundColor: colors.surface,
            borderColor: colors.accent,
          }]}>
            <View style={[styles.modalBadge, { backgroundColor: colors.yellowMuted }]}>
              <MaterialCommunityIcons name="check-decagram" size={36} color={colors.accent} />
            </View>

            <Text style={[styles.modalTitle, {
              color: colors.textPrimary,
              fontFamily: typography.fontFamily.header,
            }]}>
              NEW 5-DIGIT KEY
            </Text>

            <Text style={[styles.modalSubtitle, {
              color: colors.textSecondary,
              fontFamily: typography.fontFamily.body,
            }]}>
              Your access PIN has been updated.
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
                {newPin}
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
              title="SIGN IN WITH NEW KEY"
              variant="primary"
              onPress={handleSignInWithNewPin}
              loading={isLoggingIn}
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
  questionCard: {
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  questionLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  questionText: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  changePhoneBtn: {
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
  backLink: {
    paddingVertical: 4,
  },
  backText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
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
