import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const REPORT_REASONS = [
  { id: 'harassment', label: 'Harassment or Bullying', icon: 'account-alert' },
  { id: 'spam', label: 'Spam or Deceptive Content', icon: 'email-alert' },
  { id: 'self_harm', label: 'Self-Harm or Crisis Concern', icon: 'heart-flash' },
  { id: 'hate_speech', label: 'Hate Speech or Abuse', icon: 'cancel' },
  { id: 'vibe_check', label: 'Not a Brave Vibe (Off-topic)', icon: 'image-filter-black-white' },
];

export default function ReportModal({ visible, onClose, onSubmit }) {
  const { colors, typography, spacing } = useTheme();
  const [selectedReason, setSelectedReason] = useState(null);
  const [additionalDetails, setAdditionalDetails] = useState('');

  const handleSubmit = () => {
    if (!selectedReason) return;
    onSubmit(selectedReason.label, additionalDetails);
    // Reset state after submitting
    setSelectedReason(null);
    setAdditionalDetails('');
  };

  const handleCancel = () => {
    setSelectedReason(null);
    setAdditionalDetails('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {/* Header */}
            <View style={styles.header}>
              <MaterialCommunityIcons name="alert-octagon" size={24} color={colors.accent} style={{ marginRight: 8 }} />
              <Text style={[styles.title, { color: colors.textPrimary, fontFamily: typography.fontFamily.header, fontSize: typography.sizes.md }]}>
                FLAG THIS LOG
              </Text>
            </View>

            <Text style={[styles.subTitle, { color: colors.textSecondary, fontFamily: typography.fontFamily.body }]}>
              Help us maintain the sanctity of the circle. Choose a reason for reporting:
            </Text>

            {/* Reasons List */}
            <View style={styles.reasonsContainer}>
              {REPORT_REASONS.map((reason) => {
                const isSelected = selectedReason?.id === reason.id;
                return (
                  <TouchableOpacity
                    key={reason.id}
                    style={[
                      styles.reasonItem,
                      {
                        backgroundColor: colors.background,
                        borderColor: isSelected ? colors.accent : colors.border,
                      },
                    ]}
                    onPress={() => setSelectedReason(reason)}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons
                      name={reason.icon}
                      size={18}
                      color={isSelected ? colors.accent : colors.textSecondary}
                      style={{ marginRight: 10 }}
                    />
                    <Text
                      style={[
                        styles.reasonLabel,
                        {
                          color: isSelected ? colors.textPrimary : colors.textSecondary,
                          fontFamily: typography.fontFamily.body,
                          fontWeight: isSelected ? '700' : '400',
                        },
                      ]}
                    >
                      {reason.label}
                    </Text>
                    {isSelected && (
                      <MaterialCommunityIcons name="check-circle" size={16} color={colors.accent} style={{ marginLeft: 'auto' }} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Additional Info Input */}
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                  fontFamily: typography.fontFamily.body,
                },
              ]}
              placeholder="Additional details (optional)..."
              placeholderTextColor={colors.textSecondary}
              value={additionalDetails}
              onChangeText={setAdditionalDetails}
              multiline
              numberOfLines={3}
            />

            {/* Footer Buttons */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.btn, styles.cancelBtn, { borderColor: colors.border }]}
                onPress={handleCancel}
              >
                <Text style={[styles.btnText, { color: colors.textSecondary, fontFamily: typography.fontFamily.header }]}>
                  CANCEL
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.btn,
                  styles.submitBtn,
                  {
                    backgroundColor: selectedReason ? colors.accent : 'rgba(255, 255, 255, 0.05)',
                  },
                ]}
                disabled={!selectedReason}
                onPress={handleSubmit}
              >
                <Text
                  style={[
                    styles.btnText,
                    {
                      color: selectedReason ? colors.background : colors.textSecondary,
                      fontFamily: typography.fontFamily.header,
                    },
                  ]}
                >
                  SUBMIT REPORT
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    width: '90%',
    maxWidth: 400,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '100%',
    borderWidth: 1.5,
    borderRadius: 8,
    padding: 20,
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 5px rgba(0, 0, 0, 0.5)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 8,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  subTitle: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 16,
  },
  reasonsContainer: {
    width: '100%',
    marginBottom: 14,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  reasonLabel: {
    fontSize: 13,
  },
  textInput: {
    width: '100%',
    borderWidth: 1.5,
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    height: 60,
    textAlignVertical: 'top',
    fontSize: 12,
    marginBottom: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  btn: {
    flex: 1,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  cancelBtn: {
    borderWidth: 1.5,
    marginRight: 10,
  },
  submitBtn: {
    marginLeft: 10,
  },
  btnText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
