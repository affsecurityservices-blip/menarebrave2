import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function AgeSelectScreen({ navigation }) {
  const { colors, typography, spacing } = useTheme();
  const { updateOnboarding } = useAuth();
  const [selectedRange, setSelectedRange] = useState(null);

  const ageRanges = [
    { key: '18-24', label: '18 - 24' },
    { key: '25-34', label: '25 - 34' },
    { key: '35-44', label: '35 - 44' },
    { key: '45+', label: '45 and above' },
  ];

  const handleNext = () => {
    if (selectedRange) {
      updateOnboarding({ ageRange: selectedRange });
      navigation.navigate('InterestSelect');
    }
  };

  return (
    <View style={[styles.mainWrapper, { backgroundColor: colors.background }]}>
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
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={[styles.iconBadge, {
              backgroundColor: colors.yellowMuted,
              borderColor: 'rgba(255, 209, 0, 0.35)',
            }]}>
              <MaterialCommunityIcons name="calendar-account" size={26} color={colors.accent} />
            </View>

            <Text style={[styles.title, {
              color: colors.textPrimary,
              fontFamily: typography.fontFamily.header,
            }]}>
              AGE GROUP
            </Text>

            <Text style={[styles.subtitle, {
              color: colors.textSecondary,
              fontFamily: typography.fontFamily.body,
            }]}>
              Connect with brothers in similar phases of life.
            </Text>
          </View>

          <View style={styles.grid}>
            {ageRanges.map((range) => {
              const isSelected = selectedRange === range.key;
              return (
                <TouchableOpacity
                  key={range.key}
                  style={[
                    styles.option,
                    {
                      backgroundColor: colors.surface,
                      borderColor: isSelected ? colors.accent : colors.border,
                      borderWidth: 2,
                    },
                  ]}
                  onPress={() => setSelectedRange(range.key)}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.optionText,
                    {
                      color: isSelected ? colors.accent : colors.textPrimary,
                      fontFamily: typography.fontFamily.header,
                    },
                  ]}>
                    {range.label}
                  </Text>
                  <MaterialCommunityIcons
                    name={isSelected ? 'radiobox-marked' : 'radiobox-blank'}
                    size={20}
                    color={isSelected ? colors.accent : colors.textSecondary}
                  />
                </TouchableOpacity>
              );
            })}
          </View>

          <Button
            title="PROCEED →"
            variant={selectedRange ? 'primary' : 'secondary'}
            onPress={handleNext}
            disabled={!selectedRange}
            style={styles.actionButton}
            textStyle={styles.actionButtonText}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: {
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
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 48,
    width: '100%',
  },
  content: {
    width: '100%',
    maxWidth: 380,
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
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
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  grid: {
    gap: 12,
    marginBottom: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  optionText: {
    fontWeight: '800',
    letterSpacing: 0.5,
    fontSize: 14,
  },
  actionButton: {
    paddingVertical: 14,
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
});
