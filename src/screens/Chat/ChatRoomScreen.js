import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';
import { MaterialCommunityIcons } from '@expo/vector-icons';

function VoiceMessagePlayer({ duration, colors, spacing, typography }) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <View style={styles.voicePlayer}>
      <TouchableOpacity
        onPress={() => setIsPlaying(!isPlaying)}
        style={[styles.playBtn, { backgroundColor: colors.accent }]}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons
          name={isPlaying ? 'pause' : 'play'}
          size={18}
          color={colors.background}
        />
      </TouchableOpacity>
      
      <View style={styles.voiceDetails}>
        <View style={styles.waveform}>
          {[4, 12, 8, 16, 10, 6, 14, 8, 12, 4].map((h, i) => (
            <View
              key={i}
              style={[
                styles.waveBar,
                {
                  height: h,
                  backgroundColor: isPlaying ? colors.accent : colors.textSecondary,
                  opacity: isPlaying ? 1 : 0.6,
                }
              ]}
            />
          ))}
        </View>
        <Text style={[styles.voiceMeta, { color: colors.textSecondary, fontFamily: typography.fontFamily.body, fontSize: 10 }]}>
          {duration} • DISGUISED PITCH
        </Text>
      </View>
    </View>
  );
}

export default function ChatRoomScreen({ route, navigation }) {
  const { name = 'Room', voiceNoteDuration } = route.params || {};
  const { colors, typography, spacing } = useTheme();

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: '1', text: 'Welcome, brother. Feel free to talk.', sender: 'other', time: '10:00 AM' },
    { id: '2', text: 'Thanks. Carrying some weight.', sender: 'me', time: '10:05 AM' },
  ]);

  React.useEffect(() => {
    if (voiceNoteDuration) {
      const newMsg = {
        id: `voice_${Date.now()}`,
        text: `Voice Metaphor (${voiceNoteDuration})`,
        type: 'voice',
        duration: voiceNoteDuration,
        sender: 'me',
        time: 'Just now',
      };
      setMessages((prev) => [...prev, newMsg]);
      
      // Clear parameter to avoid duplicating on focus/re-render
      navigation.setParams({ voiceNoteDuration: undefined });
    }
  }, [voiceNoteDuration]);

  const handleSend = () => {
    if (!message.trim()) return;
    const newMsg = {
      id: Date.now().toString(),
      text: message,
      sender: 'me',
      time: 'Just now',
    };
    setMessages((prev) => [...prev, newMsg]);
    setMessage('');
  };

  const renderItem = ({ item }) => {
    const isMe = item.sender === 'me';
    const isVoice = item.type === 'voice';
    return (
      <View style={[
        styles.messageBubble,
        {
          alignSelf: isMe ? 'flex-end' : 'flex-start',
          backgroundColor: isMe ? colors.yellowMuted : colors.surface,
          borderColor: isMe ? colors.accent : colors.border,
          borderWidth: 1,
          borderRadius: spacing.borderRadius.xs,
          padding: spacing.md,
          marginBottom: spacing.sm,
          maxWidth: '80%',
          minWidth: isVoice ? 200 : 0,
        }
      ]}>
        {isVoice ? (
          <VoiceMessagePlayer duration={item.duration} colors={colors} spacing={spacing} typography={typography} />
        ) : (
          <Text style={[styles.messageText, { color: colors.textPrimary, fontFamily: typography.fontFamily.body, fontSize: typography.sizes.sm }]}>
            {item.text}
          </Text>
        )}
        <Text style={[styles.time, { color: colors.textSecondary, fontFamily: typography.fontFamily.body, fontSize: 10, alignSelf: 'flex-end', marginTop: 4 }]}>
          {item.time}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
      keyboardVerticalOffset={90}
    >
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: spacing.md, flexGrow: 1, justifyContent: 'flex-end' }}
      />

      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border, padding: spacing.md }]}>
        <InputField
          placeholder="Speak without fear..."
          value={message}
          onChangeText={setMessage}
          containerStyle={{ flex: 1, marginBottom: 0 }}
        />

        {message.trim() === '' ? (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.surface, borderRadius: spacing.borderRadius.xs }]}
            onPress={() => navigation.navigate('VoiceNoteRecorder')}
          >
            <MaterialCommunityIcons name="microphone" size={24} color={colors.accent} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.accent, borderRadius: spacing.borderRadius.xs }]}
            onPress={handleSend}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="send" size={22} color={colors.background} />
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messageBubble: {
    ...Platform.select({
      web: {
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
      },
    }),
  },
  messageText: {
    lineHeight: 20,
  },
  time: {
    fontWeight: '400',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    gap: 8,
  },
  actionBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtn: {
    height: 48,
    paddingHorizontal: 16,
  },
  voicePlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 4,
  },
  playBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceDetails: {
    flex: 1,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 20,
    marginBottom: 2,
  },
  waveBar: {
    width: 3,
    borderRadius: 1.5,
  },
  voiceMeta: {
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
