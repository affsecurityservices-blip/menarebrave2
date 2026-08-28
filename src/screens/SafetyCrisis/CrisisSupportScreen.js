import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Button from '../../components/common/Button';

export default function CrisisSupportScreen() {
  const { colors, typography, spacing } = useTheme();
  const toast = useToast();

  const resources = [
    { name: 'National Suicide Prevention Helpline', phone: '988', desc: 'Free, confidential support available 24/7. Text or call.' },
    { name: 'Vandrevala Foundation', phone: '+919999666555', desc: 'Mental health counsel and immediate support in India.' },
    { name: 'Kiran Mental Health Helpline', phone: '18005990019', desc: 'Government of India toll-free mental health support.' },
  ];

  const handleCall = (phone) => {
    Linking.openURL(`tel:${phone}`).catch(() => {
      toast.error(`Could not make a call. Dial: ${phone}`);
    });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background, padding: spacing.md }]}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="lifebuoy" size={64} color={colors.danger} />
        <Text style={[styles.title, {
          color: colors.textPrimary,
          fontFamily: typography.fontFamily.header,
          fontSize: typography.sizes.xl,
          marginTop: spacing.md,
          textAlign: 'center',
        }]}>
          EMERGENCY SUPPORT CENTER
        </Text>
        <Text style={[styles.subtitle, {
          color: colors.textSecondary,
          fontFamily: typography.fontFamily.body,
          fontSize: typography.sizes.sm,
          textAlign: 'center',
          marginTop: spacing.xs,
          marginBottom: spacing.xl,
        }]}>
          If you are in immediate danger or feeling overwhelmed, please contact these free, anonymous services immediately. You are not alone.
        </Text>
      </View>

      <View style={[styles.list, { gap: spacing.md }]}>
        {resources.map((item, index) => (
          <View key={index} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.danger, padding: spacing.md, borderRadius: spacing.borderRadius.xs }]}>
            <Text style={[styles.cardName, { color: colors.textPrimary, fontFamily: typography.fontFamily.header, fontSize: typography.sizes.md }]}>
              {item.name}
            </Text>
            <Text style={[styles.cardDesc, { color: colors.textSecondary, fontFamily: typography.fontFamily.body, fontSize: typography.sizes.xs, marginVertical: spacing.xs }]}>
              {item.desc}
            </Text>
            
            <Button
              title={`CALL ${item.phone}`}
              variant="danger"
              onPress={() => handleCall(item.phone)}
              style={{ marginTop: spacing.sm }}
            />
          </View>
        ))}
      </View>

      <View style={[styles.notice, { backgroundColor: colors.surfaceLight, padding: spacing.md, borderRadius: spacing.borderRadius.xs, marginVertical: spacing.xl }]}>
        <Text style={[styles.noticeText, { color: colors.textSecondary, fontFamily: typography.fontFamily.body, fontSize: typography.sizes.xs, textAlign: 'center', lineHeight: 18 }]}>
          "Men Are Brave (MAB) is a peer-support platform, not a medical or clinical crisis provider. If you are experiencing a life-threatening crisis, call emergency services directly."
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
  },
  title: {
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  subtitle: {
    fontWeight: '500',
    lineHeight: 20,
  },
  list: {
    width: '100%',
  },
  card: {
    borderWidth: 1.5,
  },
  cardName: {
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardDesc: {
    lineHeight: 18,
  },
  notice: {
    width: '100%',
  },
  noticeText: {
    fontWeight: '500',
  },
});
