import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { useToast } from '../../context/ToastContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function DailyStreakScreen({ navigation }) {
  const { colors, typography } = useTheme();
  const { streakCount, hasCompletedResolveToday, completeResolve, hasCheckedInToday } = useUser();
  const toast = useToast();

  const challenges = [
    "Dedicate 10 minutes to silent meditation & deep breathing.",
    "List 1 victory (no matter how small) you secured yesterday.",
    "Browse the breakup circle & leave a supportive reply to a brother.",
    "Write down 3 things you can control today, and let go of the rest.",
    "Do 20 bodyweight squats or pushups to activate physical grit.",
    "De-clutter your workspace or phone for 15 minutes to clear your mind.",
    "Check in on a friend or sibling to show brotherhood support."
  ];

  const todayDayIndex = new Date().getDay(); // 0 is Sunday, 1 is Monday ...
  const activeChallenge = challenges[todayDayIndex];

  // 7-day tracker data (Mon to Sun)
  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  // Convert JS Sunday=0 to Monday=0 index
  const adjustedToday = (todayDayIndex + 6) % 7;

  const handleAffirmResolve = () => {
    completeResolve();
    toast.success('Grit affirmed. Daily Resolve Secured!');
  };

  const nextMilestone = streakCount >= 30 ? 60 : streakCount >= 14 ? 30 : streakCount >= 7 ? 14 : 7;
  const daysRemaining = Math.max(0, nextMilestone - streakCount);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Streak Card */}
      <Animated.View
        entering={FadeInDown.duration(350)}
        style={[
          styles.heroCard,
          {
            backgroundColor: colors.surface,
            borderColor: 'rgba(255, 209, 0, 0.35)',
          }
        ]}
      >
        <View style={[styles.flameIconWrapper, { backgroundColor: colors.yellowMuted }]}>
          <MaterialCommunityIcons name="fire" size={40} color={colors.accent} />
        </View>

        <Text style={[styles.streakCountNumber, { color: colors.accent, fontFamily: typography.fontFamily.header }]}>
          {streakCount}
        </Text>
        <Text style={[styles.streakCountLabel, { color: colors.textPrimary, fontFamily: typography.fontFamily.header }]}>
          DAYS OF DISCIPLINE
        </Text>
        <Text style={[styles.streakSubtitle, { color: colors.textSecondary, fontFamily: typography.fontFamily.body }]}>
          {streakCount > 0 ? "You're forging consistency day by day. Keep the fire burning." : "Start your journey today. Never back down."}
        </Text>

        {/* 7-Day Consistency Tracker */}
        <View style={styles.trackerContainer}>
          <Text style={[styles.trackerTitle, { color: colors.textSecondary, fontFamily: typography.fontFamily.header }]}>
            THIS WEEK'S TRACK
          </Text>
          <View style={styles.daysRow}>
            {daysOfWeek.map((day, idx) => {
              const isPast = idx < adjustedToday;
              const isToday = idx === adjustedToday;
              const isCompleted = isPast || (isToday && (hasCompletedResolveToday || hasCheckedInToday));

              return (
                <View key={idx} style={styles.dayCol}>
                  <Text style={[styles.dayLetter, { color: isToday ? colors.accent : colors.textSecondary }]}>
                    {day}
                  </Text>
                  <View
                    style={[
                      styles.dayDot,
                      {
                        backgroundColor: isCompleted ? colors.accent : 'rgba(255, 255, 255, 0.05)',
                        borderColor: isToday ? colors.accent : 'rgba(255, 255, 255, 0.1)',
                        borderWidth: isToday ? 2 : 1,
                      }
                    ]}
                  >
                    {isCompleted ? (
                      <MaterialCommunityIcons name="check" size={11} color="#000000" />
                    ) : isToday ? (
                      <View style={[styles.todayInnerDot, { backgroundColor: colors.accent }]} />
                    ) : null}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Next Milestone Banner */}
        <View style={[styles.milestoneBanner, { backgroundColor: 'rgba(255, 255, 255, 0.03)', borderColor: 'rgba(255, 255, 255, 0.08)' }]}>
          <MaterialCommunityIcons name="trophy-award" size={18} color={colors.accent} style={{ flexShrink: 0 }} />
          <Text style={[styles.milestoneText, { color: colors.textPrimary, fontFamily: typography.fontFamily.body }]}>
            {daysRemaining === 0 ? (
              `Milestone Achieved! Level ${nextMilestone} Master.`
            ) : (
              <>Next milestone in <Text style={{ color: colors.accent, fontWeight: '800' }}>{daysRemaining} days</Text> ({nextMilestone}-Day Honor Shield)</>
            )}
          </Text>
        </View>
      </Animated.View>

      {/* Daily Resolve Challenge Card */}
      <Animated.View
        entering={FadeInDown.duration(400).delay(100)}
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: hasCompletedResolveToday ? 'rgba(74, 222, 128, 0.35)' : 'rgba(255, 209, 0, 0.3)',
          }
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.headerLeftCol}>
            <View style={[styles.headerIconCircle, { backgroundColor: colors.yellowMuted }]}>
              <MaterialCommunityIcons name="sword" size={15} color={colors.accent} />
            </View>
            <View style={styles.headerTitleWrap}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontFamily: typography.fontFamily.header }]} numberOfLines={1}>
                DAILY RESOLVE CHALLENGE
              </Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                Today's stoic discipline challenge
              </Text>
            </View>
          </View>

          {hasCompletedResolveToday && (
            <View style={[styles.resolvedBadge, { backgroundColor: 'rgba(74, 222, 128, 0.15)', borderColor: colors.success }]}>
              <MaterialCommunityIcons name="check" size={10} color={colors.success} />
              <Text style={[styles.resolvedBadgeText, { color: colors.success, fontFamily: typography.fontFamily.header }]}>
                COMPLETED
              </Text>
            </View>
          )}
        </View>

        <View style={[styles.quoteBox, { backgroundColor: 'rgba(255, 255, 255, 0.02)', borderColor: 'rgba(255, 255, 255, 0.06)' }]}>
          <Text style={[styles.quoteText, { color: colors.textPrimary, fontFamily: typography.fontFamily.body }]}>
            "{activeChallenge}"
          </Text>
        </View>

        {hasCompletedResolveToday ? (
          <View style={[styles.completedStatusBox, { borderColor: colors.success, backgroundColor: 'rgba(74, 222, 128, 0.08)' }]}>
            <MaterialCommunityIcons name="shield-check" size={20} color={colors.success} style={{ flexShrink: 0 }} />
            <View style={styles.completedStatusTextWrap}>
              <Text style={[styles.completedStatusTitle, { color: colors.success, fontFamily: typography.fontFamily.header }]}>
                STREAK SECURED (+1 DAY)
              </Text>
              <Text style={[styles.completedStatusSub, { color: colors.textSecondary }]}>
                Daily resolve affirmed. Great job keeping your commitment.
              </Text>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.primaryActionBtn, { backgroundColor: colors.accent }]}
            onPress={handleAffirmResolve}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="check-decagram" size={17} color="#000000" style={{ marginRight: 8 }} />
            <Text style={[styles.primaryActionBtnText, { color: '#000000', fontFamily: typography.fontFamily.header }]}>
              AFFIRM & SECURE RESOLVE
            </Text>
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* Daily Mood / Vibe Check-In Companion */}
      <Animated.View
        entering={FadeInDown.duration(400).delay(200)}
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: 'rgba(255, 255, 255, 0.08)',
          }
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.headerLeftCol}>
            <View style={[styles.headerIconCircle, { backgroundColor: 'rgba(255, 255, 255, 0.05)' }]}>
              <MaterialCommunityIcons name="emoticon-happy-outline" size={15} color={colors.accent} />
            </View>
            <View style={styles.headerTitleWrap}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontFamily: typography.fontFamily.header }]} numberOfLines={1}>
                DAILY ENERGY & VIBE
              </Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                Calibrate your mental state
              </Text>
            </View>
          </View>

          {hasCheckedInToday && (
            <View style={[styles.resolvedBadge, { backgroundColor: colors.yellowMuted, borderColor: colors.accent }]}>
              <MaterialCommunityIcons name="check" size={10} color={colors.accent} />
              <Text style={[styles.resolvedBadgeText, { color: colors.accent, fontFamily: typography.fontFamily.header }]}>
                LOGGED
              </Text>
            </View>
          )}
        </View>

        <Text style={[styles.cardDescription, { color: colors.textSecondary, fontFamily: typography.fontFamily.body }]}>
          Checking in with yourself daily increases self-awareness and emotional strength.
        </Text>

        <TouchableOpacity
          style={[styles.secondaryActionBtn, { borderColor: colors.accent }]}
          onPress={() => navigation.navigate('ProfileTab', { screen: 'DailyCheckIn' })}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name={hasCheckedInToday ? "history" : "pencil-outline"}
            size={16}
            color={colors.accent}
            style={{ marginRight: 6 }}
          />
          <Text style={[styles.secondaryActionBtnText, { color: colors.accent, fontFamily: typography.fontFamily.header }]}>
            {hasCheckedInToday ? "VIEW MOOD MATRIX & LOG" : "CHECK IN TODAY'S VIBE"}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Brotherhood Streak Rules */}
      <Animated.View
        entering={FadeInDown.duration(400).delay(300)}
        style={[
          styles.rulesCard,
          {
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderColor: 'rgba(255, 255, 255, 0.06)',
          }
        ]}
      >
        <View style={styles.rulesHeader}>
          <MaterialCommunityIcons name="shield-star-outline" size={16} color={colors.accent} />
          <Text style={[styles.rulesHeaderTitle, { color: colors.accent, fontFamily: typography.fontFamily.header, marginLeft: 8 }]}>
            THE CODE OF CONSISTENCY
          </Text>
        </View>

        <View style={styles.ruleItem}>
          <MaterialCommunityIcons name="clock-outline" size={14} color={colors.textSecondary} style={styles.ruleIcon} />
          <Text style={[styles.ruleItemText, { color: colors.textSecondary }]}>
            Streaks update every 24 hours. Affirm your resolve or log your vibe before midnight.
          </Text>
        </View>

        <View style={styles.ruleItem}>
          <MaterialCommunityIcons name="fire" size={14} color={colors.textSecondary} style={styles.ruleIcon} />
          <Text style={[styles.ruleItemText, { color: colors.textSecondary }]}>
            Every 7 consecutive days unlocks a new tier of brotherhood standing and badge honors.
          </Text>
        </View>

        <View style={styles.ruleItem}>
          <MaterialCommunityIcons name="account-group-outline" size={14} color={colors.textSecondary} style={styles.ruleIcon} />
          <Text style={[styles.ruleItemText, { color: colors.textSecondary }]}>
            Never quit when the fire gets tough. Discipline is doing what needs to be done.
          </Text>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    paddingBottom: 36,
    width: '100%',
    maxWidth: 540,
    alignSelf: 'center',
  },
  heroCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginBottom: 14,
  },
  flameIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  streakCountNumber: {
    fontSize: 42,
    fontWeight: '900',
    lineHeight: 46,
    letterSpacing: 1,
  },
  streakCountLabel: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.1,
    marginTop: 2,
    marginBottom: 6,
  },
  streakSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
    paddingHorizontal: 10,
    marginBottom: 14,
  },
  trackerContainer: {
    width: '100%',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
  },
  trackerTitle: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.9,
    marginBottom: 10,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 6,
  },
  dayCol: {
    alignItems: 'center',
    gap: 6,
  },
  dayLetter: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  dayDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayInnerDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  milestoneBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginTop: 14,
    width: '100%',
    gap: 8,
  },
  milestoneText: {
    fontSize: 11,
    flex: 1,
    lineHeight: 16,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  headerLeftCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 6,
  },
  headerIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  headerTitleWrap: {
    flex: 1,
    marginLeft: 9,
  },
  sectionTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    fontSize: 9.5,
    marginTop: 1,
  },
  resolvedBadge: {
    flexShrink: 0,
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 4,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  resolvedBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  quoteBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  quoteText: {
    fontSize: 12.5,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 7,
  },
  primaryActionBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  completedStatusBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedStatusTextWrap: {
    flex: 1,
    marginLeft: 9,
  },
  completedStatusTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  completedStatusSub: {
    fontSize: 10,
    lineHeight: 14,
    marginTop: 2,
  },
  cardDescription: {
    fontSize: 11.5,
    lineHeight: 16,
    marginBottom: 12,
  },
  secondaryActionBtn: {
    borderWidth: 1,
    borderRadius: 7,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActionBtnText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  rulesCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  rulesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  rulesHeaderTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  ruleItem: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  ruleIcon: {
    marginTop: 2,
    flexShrink: 0,
  },
  ruleItemText: {
    fontSize: 11,
    lineHeight: 15,
    flex: 1,
  },
});
