import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, Dimensions, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';

export default function Toast({ message, type = 'info', duration = 3000, onHide }) {
  const { colors, typography } = useTheme();
  const insets = useSafeAreaInsets();

  const slideAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef(null);

  // Determine styles based on type
  const typeConfig = {
    success: {
      icon: 'checkbox-marked-circle',
      color: colors.success || '#2A9D8F',
      bgTint: colors.success ? `${colors.success}14` : 'rgba(42, 157, 143, 0.08)',
      title: 'SUCCESS',
      haptic: Haptics.NotificationFeedbackType.Success,
    },
    error: {
      icon: 'alert-circle',
      color: colors.danger || '#C1121F',
      bgTint: colors.danger ? `${colors.danger}14` : 'rgba(193, 18, 31, 0.08)',
      title: 'ERROR',
      haptic: Haptics.NotificationFeedbackType.Error,
    },
    warning: {
      icon: 'alert',
      color: colors.accent || '#FFD100',
      bgTint: colors.accent ? `${colors.accent}14` : 'rgba(255, 209, 0, 0.08)',
      title: 'ALERT',
      haptic: Haptics.NotificationFeedbackType.Warning,
    },
    info: {
      icon: 'information',
      color: colors.textSecondary || '#8A8A9E',
      bgTint: 'rgba(138, 138, 158, 0.08)',
      title: 'INFO',
      haptic: null,
    },
  }[type] || {
    icon: 'information',
    color: '#8A8A9E',
    bgTint: 'rgba(138, 138, 158, 0.08)',
    title: 'INFO',
    haptic: null,
  };

  const handleDismiss = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(progressAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: false,
      }),
    ]).start(() => {
      onHide();
    });
  };

  useEffect(() => {
    // 1. Trigger Haptic Feedback
    try {
      if (typeConfig.haptic) {
        Haptics.notificationAsync(typeConfig.haptic);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (e) {
      // Haptics might fail on web/unsupported environments, ignore silently
    }

    // 2. Animate Entry (spring slide down)
    Animated.spring(slideAnim, {
      toValue: 1,
      tension: 60,
      friction: 10,
      useNativeDriver: Platform.OS !== 'web',
    }).start();

    // 3. Animate Progress Bar from 1 to 0
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: duration - 220, // offset for smooth dismissal exit transition
      useNativeDriver: false,
    }).start();

    // 4. Auto Dismiss timer
    timerRef.current = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const topOffset = insets.top > 0 ? insets.top + 10 : 30;

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-150, 0],
  });

  const opacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View
      style={[
        styles.toastWrapper,
        {
          top: topOffset,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handleDismiss}
        style={[
          styles.container,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={[styles.innerBg, { backgroundColor: typeConfig.color, opacity: 0.05 }]} />
        <View style={[styles.leftAccentBar, { backgroundColor: typeConfig.color }]} />
        <View style={styles.contentRow}>
          <MaterialCommunityIcons name={typeConfig.icon} size={20} color={typeConfig.color} style={styles.icon} />
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: typeConfig.color, fontFamily: typography.fontFamily.header }]}>
              {typeConfig.title}
            </Text>
            <Text style={[styles.message, { color: colors.textPrimary, fontFamily: typography.fontFamily.body }]}>
              {message}
            </Text>
          </View>
          <TouchableOpacity onPress={handleDismiss} style={styles.closeBtn}>
            <MaterialCommunityIcons name="close" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <View style={styles.progressContainer}>
          <Animated.View style={[styles.progressBar, { width: progressWidth, backgroundColor: typeConfig.color }]} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toastWrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    ...Platform.select({
      web: {
        maxWidth: 568,
        alignSelf: 'center',
        left: 'auto',
        right: 'auto',
        width: '100%',
        boxShadow: '0px 6px 8px rgba(0, 0, 0, 0.35)',
      },
      default: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 8,
      },
    }),
  },
  container: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    minHeight: 56,
    justifyContent: 'center',
  },
  innerBg: {
    ...StyleSheet.absoluteFillObject,
  },
  leftAccentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    paddingLeft: 20,
  },
  icon: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  message: {
    fontSize: 12.5,
    fontWeight: '600',
    lineHeight: 16,
  },
  closeBtn: {
    padding: 4,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  progressBar: {
    height: '100%',
  },
});
