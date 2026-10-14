import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';
import InputField from '../../components/common/InputField';
import {
  SECURITY_QUESTIONS,
  DEFAULT_PRIMARY_QUESTION,
  DEFAULT_BACKUP_QUESTION,
} from '../../utils/securityQuestions';

export default function UpdatePasswordScreen({ navigation }) {
  const { colors, typography, spacing } = useTheme();
  const { getMySecurityQuestion, updatePasswordWithQuestion } = useAuth();
  const toast = useToast();

  // Current stored questions
  const [question, setQuestion] = useState('');
  const [question2, setQuestion2] = useState(null);
  const [activeVerifyQuestion, setActiveVerifyQuestion] = useState(1);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(true);

  // Identity verification answer
  const [securityAnswer, setSecurityAnswer] = useState('');
  
  // New PIN
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  // Rotate / Update Security Questions State
  const [enableChangeQuestions, setEnableChangeQuestions] = useState(false);
  const [newQuestion1, setNewQuestion1] = useState(DEFAULT_PRIMARY_QUESTION);
  const [isQ1DropdownOpen, setIsQ1DropdownOpen] = useState(false);
  const [newAnswer1, setNewAnswer1] = useState('');
  const [enableBackupQuestion, setEnableBackupQuestion] = useState(false);
  const [newQuestion2, setNewQuestion2] = useState(DEFAULT_BACKUP_QUESTION);
  const [isQ2DropdownOpen, setIsQ2DropdownOpen] = useState(false);
  const [newAnswer2, setNewAnswer2] = useState('');

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [savedPin, setSavedPin] = useState('');
  const [hasCopiedPin, setHasCopiedPin] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadQuestion() {
      try {
        setIsLoadingQuestion(true);
        const qData = await getMySecurityQuestion();
        if (mounted) {
          const q1 = qData?.question || 'Your favorite movie of all time?';
          const q2 = qData?.question_2 || null;
          setQuestion(q1);
          setQuestion2(q2);
          setNewQuestion1(q1);
          if (q2) {
            setNewQuestion2(q2);
            setEnableBackupQuestion(true);
          }
          setIsLoadingQuestion(false);
        }
      } catch {
        if (mounted) {
          setQuestion('Your favorite movie of all time?');
          setIsLoadingQuestion(false);
        }
      }
    }
    loadQuestion();
    return () => {
      mounted = false;
    };
  }, []);

  const handleUpdate = async () => {
    const newErrors = {};

    if (!securityAnswer.trim()) {
      newErrors.securityAnswer = 'Answer is required to verify identity';
    }

    const cleanNewPin = newPin.trim();
    if (!cleanNewPin || cleanNewPin.length !== 5 || !/^\d+$/.test(cleanNewPin)) {
      newErrors.newPin = 'Enter a valid 5-digit numeric PIN';
    }

    if (cleanNewPin !== confirmPin.trim()) {
      newErrors.confirmPin = 'PINs do not match';
    }

    if (enableChangeQuestions) {
      if (!newAnswer1.trim()) {
        newErrors.newAnswer1 = 'New answer is required for Question #1';
      }
      if (enableBackupQuestion) {
        if (!newAnswer2.trim()) {
          newErrors.newAnswer2 = 'Backup answer is required when enabled';
        }
        if (newQuestion1 === newQuestion2) {
          newErrors.newQuestion2 = 'Backup question must be different from Question #1';
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setErrors({});
      setIsSubmitting(true);

      const res = await updatePasswordWithQuestion(
        securityAnswer.trim(),
        cleanNewPin,
        enableChangeQuestions ? newQuestion1 : null,
        enableChangeQuestions ? newAnswer1.trim() : null,
        enableChangeQuestions && enableBackupQuestion ? newQuestion2 : null,
        enableChangeQuestions && enableBackupQuestion ? newAnswer2.trim() : null
      );
      setIsSubmitting(false);

      if (res && res.success) {
        setSavedPin(cleanNewPin);
        setHasCopiedPin(false);
        if (enableChangeQuestions) {
          setQuestion(newQuestion1);
          if (enableBackupQuestion) setQuestion2(newQuestion2);
        }
        setShowSuccessModal(true);
        toast.success('Security credentials updated successfully!');
      } else {
        toast.error(res?.error || 'Verification failed. Check your answer.');
      }
    } catch (err) {
      setIsSubmitting(false);
      toast.error(err.message || 'Verification failed. Check your answer.');
    }
  };

  const handleCopyPin = async () => {
    if (!savedPin) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(savedPin);
        setHasCopiedPin(true);
        toast.success('PIN copied to clipboard!');
      } else {
        toast.info(`PIN: ${savedPin}`);
      }
    } catch {
      toast.info(`PIN: ${savedPin}`);
    }
  };

  const handleFinish = () => {
    setShowSuccessModal(false);
    navigation.goBack();
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
        <View style={styles.contentWrap}>
          {/* Header Title & Subtitle */}
          <View style={styles.headerBlock}>
            <View style={[styles.shieldIconRing, { borderColor: 'rgba(255, 209, 0, 0.35)', backgroundColor: 'rgba(255, 209, 0, 0.08)' }]}>
              <MaterialCommunityIcons name="key-change" size={28} color={colors.accent} />
            </View>
            <Text style={[styles.title, { color: colors.textPrimary, fontFamily: typography.fontFamily.header }]}>
              UPDATE SECURITY PIN
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary, fontFamily: typography.fontFamily.body }]}>
              Verify your security question to rotate your shelter sign-in key and security settings.
            </Text>
          </View>

          {/* Tactical Card */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {/* Identity Verification Question Switcher if multiple questions exist */}
            {question && question2 ? (
              <View style={{ marginBottom: 12 }}>
                <Text style={{
                  color: colors.textSecondary,
                  fontSize: 11,
                  fontWeight: '700',
                  letterSpacing: 0.5,
                  marginBottom: 6,
                }}>
                  VERIFY WITH EITHER QUESTION:
                </Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      paddingVertical: 8,
                      borderRadius: 8,
                      borderWidth: 1.5,
                      borderColor: activeVerifyQuestion === 1 ? colors.accent : 'rgba(255, 255, 255, 0.12)',
                      backgroundColor: activeVerifyQuestion === 1 ? 'rgba(255, 209, 0, 0.14)' : 'rgba(255, 255, 255, 0.03)',
                      alignItems: 'center',
                    }}
                    onPress={() => {
                      setActiveVerifyQuestion(1);
                      setSecurityAnswer('');
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={{
                      color: activeVerifyQuestion === 1 ? colors.accent : colors.textSecondary,
                      fontSize: 12,
                      fontWeight: activeVerifyQuestion === 1 ? '800' : '600',
                    }}>
                      Question #1
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      flex: 1,
                      paddingVertical: 8,
                      borderRadius: 8,
                      borderWidth: 1.5,
                      borderColor: activeVerifyQuestion === 2 ? colors.accent : 'rgba(255, 255, 255, 0.12)',
                      backgroundColor: activeVerifyQuestion === 2 ? 'rgba(255, 209, 0, 0.14)' : 'rgba(255, 255, 255, 0.03)',
                      alignItems: 'center',
                    }}
                    onPress={() => {
                      setActiveVerifyQuestion(2);
                      setSecurityAnswer('');
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={{
                      color: activeVerifyQuestion === 2 ? colors.accent : colors.textSecondary,
                      fontSize: 12,
                      fontWeight: activeVerifyQuestion === 2 ? '800' : '600',
                    }}>
                      Backup Question #2
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}

            {/* Question Display Box */}
            <View style={[styles.questionBox, { backgroundColor: 'rgba(255, 209, 0, 0.05)', borderColor: 'rgba(255, 209, 0, 0.22)' }]}>
              <View style={styles.questionHeaderRow}>
                <MaterialCommunityIcons name="shield-lock-outline" size={16} color={colors.accent} />
                <Text style={[styles.questionBadge, { color: colors.accent, fontFamily: typography.fontFamily.header }]}>
                  IDENTITY VERIFICATION {question2 ? `(${activeVerifyQuestion === 1 ? 'QUESTION 1' : 'BACKUP QUESTION'})` : ''}
                </Text>
              </View>
              {isLoadingQuestion ? (
                <ActivityIndicator size="small" color={colors.accent} style={{ marginVertical: 8 }} />
              ) : (
                <Text style={[styles.questionText, { color: colors.textPrimary, fontFamily: typography.fontFamily.body }]}>
                  {activeVerifyQuestion === 2 && question2 ? question2 : question}
                </Text>
              )}
            </View>

            {/* Answer Input */}
            <InputField
              label="SECRET ANSWER"
              placeholder="Enter your security answer..."
              value={securityAnswer}
              onChangeText={setSecurityAnswer}
              error={errors.securityAnswer}
              autoCapitalize="none"
              containerStyle={{ marginBottom: 16 }}
            />

            {/* New PIN */}
            <InputField
              label="NEW 5-DIGIT PIN"
              placeholder="e.g. 84920"
              value={newPin}
              onChangeText={(val) => setNewPin(val.replace(/[^0-9]/g, '').slice(0, 5))}
              error={errors.newPin}
              keyboardType="numeric"
              maxLength={5}
              secureTextEntry
              containerStyle={{ marginBottom: 16 }}
            />

            {/* Confirm New PIN */}
            <InputField
              label="CONFIRM NEW PIN"
              placeholder="Re-enter 5-digit PIN"
              value={confirmPin}
              onChangeText={(val) => setConfirmPin(val.replace(/[^0-9]/g, '').slice(0, 5))}
              error={errors.confirmPin}
              keyboardType="numeric"
              maxLength={5}
              secureTextEntry
              containerStyle={{ marginBottom: 16 }}
            />

            {/* Rotate / Change Security Questions Toggle */}
            <TouchableOpacity
              style={{
                borderWidth: 1.5,
                borderColor: enableChangeQuestions ? colors.accent : 'rgba(255, 255, 255, 0.12)',
                borderRadius: 10,
                padding: 12,
                marginBottom: 16,
                backgroundColor: enableChangeQuestions ? 'rgba(255, 209, 0, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
              onPress={() => setEnableChangeQuestions(!enableChangeQuestions)}
              activeOpacity={0.8}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 }}>
                <MaterialCommunityIcons
                  name={enableChangeQuestions ? 'shield-refresh' : 'shield-edit-outline'}
                  size={22}
                  color={enableChangeQuestions ? colors.accent : colors.textSecondary}
                />
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Text style={{ color: colors.textPrimary, fontSize: 13, fontWeight: '700' }}>
                    Rotate / Update Security Questions
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>
                    Pick new questions from 16+ options & add backup safety
                  </Text>
                </View>
              </View>
              <MaterialCommunityIcons
                name={enableChangeQuestions ? 'chevron-up' : 'chevron-down'}
                size={22}
                color={enableChangeQuestions ? colors.accent : colors.textSecondary}
              />
            </TouchableOpacity>

            {/* Change Questions Section */}
            {enableChangeQuestions && (
              <View style={{
                padding: 14,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: 'rgba(255, 209, 0, 0.25)',
                backgroundColor: 'rgba(255, 209, 0, 0.03)',
                marginBottom: 18,
              }}>
                <Text style={{
                  color: colors.accent,
                  fontSize: 11,
                  fontWeight: '800',
                  letterSpacing: 0.5,
                  marginBottom: 8,
                }}>
                  NEW PRIMARY QUESTION
                </Text>

                <TouchableOpacity
                  style={{
                    backgroundColor: colors.surfaceLight || '#22222E',
                    borderColor: isQ1DropdownOpen ? colors.accent : colors.border,
                    borderWidth: 1,
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: isQ1DropdownOpen ? 4 : 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                  onPress={() => {
                    setIsQ1DropdownOpen(!isQ1DropdownOpen);
                    setIsQ2DropdownOpen(false);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={{ color: colors.textPrimary, fontSize: 13, flex: 1, marginRight: 8 }}>
                    {newQuestion1}
                  </Text>
                  <MaterialCommunityIcons
                    name={isQ1DropdownOpen ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={colors.accent}
                  />
                </TouchableOpacity>

                {isQ1DropdownOpen && (
                  <ScrollView
                    nestedScrollEnabled
                    style={{
                      maxHeight: 180,
                      borderWidth: 1,
                      borderColor: colors.accent,
                      borderRadius: 8,
                      backgroundColor: colors.surfaceLight || '#22222E',
                      marginBottom: 12,
                    }}
                  >
                    {SECURITY_QUESTIONS.map((q, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={{
                          padding: 10,
                          backgroundColor: newQuestion1 === q ? 'rgba(255, 209, 0, 0.15)' : 'transparent',
                          borderBottomWidth: idx < SECURITY_QUESTIONS.length - 1 ? 1 : 0,
                          borderBottomColor: colors.border,
                        }}
                        onPress={() => {
                          setNewQuestion1(q);
                          setIsQ1DropdownOpen(false);
                        }}
                      >
                        <Text style={{
                          color: newQuestion1 === q ? colors.accent : colors.textPrimary,
                          fontSize: 12,
                          fontWeight: newQuestion1 === q ? '700' : '400',
                        }}>
                          {q}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}

                <InputField
                  label="NEW SECRET ANSWER #1"
                  placeholder="Your new primary secret answer..."
                  value={newAnswer1}
                  onChangeText={setNewAnswer1}
                  error={errors.newAnswer1}
                  autoCapitalize="none"
                  containerStyle={{ marginBottom: 14 }}
                />

                {/* Backup Question Toggle */}
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 8,
                    marginBottom: 10,
                  }}
                  onPress={() => setEnableBackupQuestion(!enableBackupQuestion)}
                  activeOpacity={0.8}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons
                      name={enableBackupQuestion ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
                      size={20}
                      color={enableBackupQuestion ? colors.accent : colors.textSecondary}
                    />
                    <Text style={{ color: colors.textPrimary, fontSize: 12, fontWeight: '700', marginLeft: 8 }}>
                      Add Backup Question (Extra Recovery Chance)
                    </Text>
                  </View>
                </TouchableOpacity>

                {enableBackupQuestion && (
                  <View style={{
                    marginTop: 6,
                    paddingTop: 10,
                    borderTopWidth: 1,
                    borderTopColor: 'rgba(255, 255, 255, 0.08)',
                  }}>
                    <Text style={{
                      color: colors.accent,
                      fontSize: 11,
                      fontWeight: '800',
                      letterSpacing: 0.5,
                      marginBottom: 8,
                    }}>
                      NEW BACKUP QUESTION
                    </Text>

                    <TouchableOpacity
                      style={{
                        backgroundColor: colors.surfaceLight || '#22222E',
                        borderColor: isQ2DropdownOpen ? colors.accent : colors.border,
                        borderWidth: 1,
                        padding: 12,
                        borderRadius: 8,
                        marginBottom: isQ2DropdownOpen ? 4 : 12,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                      onPress={() => {
                        setIsQ2DropdownOpen(!isQ2DropdownOpen);
                        setIsQ1DropdownOpen(false);
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={{ color: colors.textPrimary, fontSize: 13, flex: 1, marginRight: 8 }}>
                        {newQuestion2}
                      </Text>
                      <MaterialCommunityIcons
                        name={isQ2DropdownOpen ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color={colors.accent}
                      />
                    </TouchableOpacity>

                    {isQ2DropdownOpen && (
                      <ScrollView
                        nestedScrollEnabled
                        style={{
                          maxHeight: 180,
                          borderWidth: 1,
                          borderColor: colors.accent,
                          borderRadius: 8,
                          backgroundColor: colors.surfaceLight || '#22222E',
                          marginBottom: 12,
                        }}
                      >
                        {SECURITY_QUESTIONS.filter(q => q !== newQuestion1).map((q, idx) => (
                          <TouchableOpacity
                            key={idx}
                            style={{
                              padding: 10,
                              backgroundColor: newQuestion2 === q ? 'rgba(255, 209, 0, 0.15)' : 'transparent',
                              borderBottomWidth: idx < SECURITY_QUESTIONS.length - 2 ? 1 : 0,
                              borderBottomColor: colors.border,
                            }}
                            onPress={() => {
                              setNewQuestion2(q);
                              setIsQ2DropdownOpen(false);
                            }}
                          >
                            <Text style={{
                              color: newQuestion2 === q ? colors.accent : colors.textPrimary,
                              fontSize: 12,
                              fontWeight: newQuestion2 === q ? '700' : '400',
                            }}>
                              {q}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    )}

                    {errors.newQuestion2 && (
                      <Text style={{ color: colors.error, fontSize: 11, marginBottom: 8 }}>
                        {errors.newQuestion2}
                      </Text>
                    )}

                    <InputField
                      label="NEW BACKUP SECRET ANSWER"
                      placeholder="Your new backup secret answer..."
                      value={newAnswer2}
                      onChangeText={setNewAnswer2}
                      error={errors.newAnswer2}
                      autoCapitalize="none"
                      containerStyle={{ marginBottom: 6 }}
                    />
                  </View>
                )}
              </View>
            )}

            {/* Submit Button */}
            <Button
              title="VERIFY & UPDATE KEY"
              variant="primary"
              onPress={handleUpdate}
              loading={isSubmitting}
              style={styles.actionButton}
              textStyle={styles.actionButtonText}
            />
          </View>
        </View>
      </ScrollView>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={handleFinish}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: 'rgba(255, 209, 0, 0.45)' }]}>
            <View style={[styles.modalIconRing, { backgroundColor: 'rgba(42, 157, 143, 0.15)', borderColor: '#2A9D8F' }]}>
              <MaterialCommunityIcons name="check-decagram" size={36} color="#2A9D8F" />
            </View>

            <Text style={[styles.modalTitle, { color: colors.textPrimary, fontFamily: typography.fontFamily.header }]}>
              SECURITY PIN UPDATED
            </Text>

            <Text style={[styles.modalSubtitle, { color: colors.textSecondary, fontFamily: typography.fontFamily.body }]}>
              Your sign-in key has been successfully rotated. Memorize or save this key securely.
            </Text>

            {/* PIN Vault Box */}
            <View style={[styles.pinVaultBox, { backgroundColor: 'rgba(0, 0, 0, 0.45)', borderColor: colors.accent }]}>
              <Text style={[styles.pinVaultLabel, { color: colors.textSecondary }]}>
                NEW SIGN-IN PIN
              </Text>
              <Text style={[styles.pinDigits, { color: colors.accent }]}>
                {savedPin}
              </Text>

              <TouchableOpacity
                style={[styles.copyButton, { backgroundColor: hasCopiedPin ? '#2A9D8F' : colors.yellowMuted, borderColor: colors.accent }]}
                onPress={handleCopyPin}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name={hasCopiedPin ? 'check' : 'content-copy'}
                  size={16}
                  color={hasCopiedPin ? '#FFFFFF' : colors.accent}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.copyButtonText, { color: hasCopiedPin ? '#FFFFFF' : colors.accent }]}>
                  {hasCopiedPin ? 'KEY COPIED' : 'COPY PIN'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Return Button */}
            <Button
              title="RETURN TO SETTINGS"
              variant="primary"
              onPress={handleFinish}
              style={[styles.modalActionButton, { marginTop: 18 }]}
              textStyle={styles.actionButtonText}
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
  ambientGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 240,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 48,
    alignItems: 'center',
  },
  contentWrap: {
    width: '100%',
    maxWidth: 420,
  },
  headerBlock: {
    alignItems: 'center',
    marginBottom: 20,
  },
  shieldIconRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  card: {
    borderWidth: 1.5,
    borderRadius: 8,
    padding: 20,
  },
  questionBox: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 14,
    marginBottom: 18,
  },
  questionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  questionBadge: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginLeft: 6,
  },
  questionText: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  actionButton: {
    height: 48,
    borderRadius: 4,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 390,
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  modalIconRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 6,
    marginBottom: 18,
    paddingHorizontal: 10,
  },
  pinVaultBox: {
    width: '100%',
    borderWidth: 1.5,
    borderRadius: 8,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  pinVaultLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  pinDigits: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 8,
    marginVertical: 4,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    borderWidth: 1,
    marginTop: 12,
  },
  copyButtonText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  modalActionButton: {
    width: '100%',
    height: 48,
    borderRadius: 4,
  },
});
