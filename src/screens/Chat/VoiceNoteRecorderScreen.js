import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Button from '../../components/common/Button';

export default function VoiceNoteRecorderScreen({ navigation }) {
  const { colors, typography, spacing } = useTheme();
  const toast = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState('0:00');

  const handleRecord = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setDuration('0:14');
    } else {
      setDuration('0:00');
    }
  };

  const handleSend = () => {
    toast.success('Voice message disguised and dispatched.');
    navigation.navigate('ChatRoom', { voiceNoteDuration: duration });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, padding: spacing.lg }]}>
      <View style={styles.content}>
        <MaterialCommunityIcons
          name={isRecording ? 'microphone-settings' : 'microphone'}
          size={84}
          color={isRecording ? colors.danger : colors.accent}
          style={styles.icon}
        />
        
        <Text style={[styles.duration, {
          color: colors.textPrimary,
          fontFamily: typography.fontFamily.header,
          fontSize: typography.sizes.xxl,
          marginBottom: spacing.xs,
        }]}>
          {duration}
        </Text>

        <Text style={[styles.status, {
          color: colors.textSecondary,
          fontFamily: typography.fontFamily.body,
          fontSize: typography.sizes.sm,
          textAlign: 'center',
          marginBottom: spacing.xl,
        }]}>
          {isRecording ? 'DISGUISING VOICE METAPHOR ACTIVE...' : 'Tap record. Your voice pitch will be warped to protect identity.'}
        </Text>

        <TouchableOpacity
          style={[
            styles.recordBtn,
            {
              backgroundColor: isRecording ? colors.danger : colors.surface,
              borderColor: isRecording ? colors.danger : colors.accent,
              borderWidth: 2,
              borderRadius: spacing.borderRadius.round,
              width: 80,
              height: 80,
            }
          ]}
          onPress={handleRecord}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name={isRecording ? 'stop' : 'record'}
            size={40}
            color={isRecording ? colors.textPrimary : colors.accent}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Button
          title="DISPATCH VOICE LOG"
          variant="primary"
          onPress={handleSend}
          disabled={duration === '0:00'}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    marginBottom: 20,
  },
  duration: {
    fontWeight: '900',
  },
  status: {
    fontWeight: '500',
    maxWidth: '80%',
  },
  recordBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    width: '100%',
  },
});
