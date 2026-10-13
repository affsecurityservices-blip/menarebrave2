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

export default function UpdatePasswordScreen({ navigation }) {
  const { colors, typography, spacing } = useTheme();
  const { getMySecurityQuestion, updatePasswordWithQuestion } = useAuth();
  const toast = useToast();

  const [question, setQuestion] = useState('');
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(true);

  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
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
        const q = await getMySecurityQuestion();
        if (mounted) {
          setQuestion(q || 'What was the name of your first school?');
          setIsLoadingQuestion(false);
        }
      } catch (err) {
        if (mounted) {
          setQuestion('What was the name of your first school?');
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

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setErrors({});
      setIsSubmitting(true);

      const res = await updatePasswordWithQuestion(securityAnswer.trim(), cleanNewPin);
      setIsSubmitting(false);

      if (res && res.success) {
        setSavedPin(cleanNewPin);
        setHasCopiedPin(false);
        setShowSuccessModal(true);
        toast.success('Security PIN updated successfully!');
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
              Verify your security question to rotate your shelter sign-in key.
            </Text>
          </View>

          {/* Tactical Card */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {/* Question Display Box */}
            <View style={[styles.questionBox, { backgroundColor: 'rgba(255, 209, 0, 0.05)', borderColor: 'rgba(255, 209, 0, 0.22)' }]}>
              <View style={styles.questionHeaderRow}>
                <MaterialCommunityIcons name="shield-lock-outline" size={16} color={colors.accent} />
                <Text style={[styles.questionBadge, { color: colors.accent, fontFamily: typography.fontFamily.header }]}>
                  IDENTITY VERIFICATION
                </Text>
              </View>
              {isLoadingQuestion ? (
                <ActivityIndicator size="small" color={colors.accent} style={{ marginVertical: 8 }} />
              ) : (
                <Text style={[styles.questionText, { color: colors.textPrimary, fontFamily: typography.fontFamily.body }]}>
                  {question}
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
              containerStyle={{ marginBottom: 20 }}
            />

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
