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

export default function InterestSelectScreen({ navigation }) {
  const { colors, typography } = useTheme();
  const { updateOnboarding } = useAuth();
  const [selectedInterests, setSelectedInterests] = useState([]);

  const topics = [
    { id: 'career', name: 'Work & Career', icon: 'briefcase-outline' },
    { id: 'breakup', name: 'Breakup & Divorce', icon: 'heart-broken-outline' },
    { id: 'fitness', name: 'Physical Fitness', icon: 'dumbbell' },
    { id: 'fatherhood', name: 'Fatherhood & Kids', icon: 'baby-carriage' },
    { id: 'finances', name: 'Wealth & Debt', icon: 'cash' },
    { id: 'addiction', name: 'Overcoming Habits', icon: 'water-off' },
    { id: 'mental_health', name: 'Anxiety & Moods', icon: 'brain' },
    { id: 'brotherhood', name: 'Just Brotherhood', icon: 'handshake' },
  ];

  const handleToggle = (id) => {
    setSelectedInterests((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleNext = () => {
    if (selectedInterests.length > 0) {
      updateOnboarding({ interests: selectedInterests });
      navigation.navigate('AnonymousMode');
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
              <MaterialCommunityIcons name="target" size={26} color={colors.accent} />
            </View>

            <Text style={[styles.title, {
              color: colors.textPrimary,
              fontFamily: typography.fontFamily.header,
            }]}>
              CHOOSE INTERESTS
            </Text>

            <Text style={[styles.subtitle, {
              color: colors.textSecondary,
              fontFamily: typography.fontFamily.body,
            }]}>
              Select at least 1 topic that matters to you right now.
            </Text>
          </View>

          <View style={styles.grid}>
            {topics.map((topic) => {
              const isSelected = selectedInterests.includes(topic.id);
              return (
                <TouchableOpacity
                  key={topic.id}
                  style={[
                    styles.topicBtn,
                    {
                      backgroundColor: colors.surface,
                      borderColor: isSelected ? colors.accent : colors.border,
                      borderWidth: 2,
                    },
                  ]}
                  onPress={() => handleToggle(topic.id)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons
                    name={topic.icon}
                    size={22}
                    color={isSelected ? colors.accent : colors.textSecondary}
                  />
                  <Text style={[
                    styles.topicText,
                    {
                      color: isSelected ? colors.textPrimary : colors.textSecondary,
                      fontFamily: typography.fontFamily.body,
                    },
                  ]}>
                    {topic.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Button
            title="PROCEED →"
            variant={selectedInterests.length > 0 ? 'primary' : 'secondary'}
            onPress={handleNext}
            disabled={selectedInterests.length === 0}
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
    marginBottom: 20,
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 20,
    width: '100%',
  },
  topicBtn: {
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  topicText: {
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 12,
    marginTop: 6,
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
