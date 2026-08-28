import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { useToast } from '../../context/ToastContext';
import PostCard from '../../components/post/PostCard';
import EmptyState from '../../components/common/EmptyState';
import StreakBadge from '../../components/moodcheckin/StreakBadge';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function HomeFeedScreen({ navigation }) {
  const { colors, typography, spacing } = useTheme();
  const { posts, toggleLikePost, toggleSavePost, streakCount, hasCompletedResolveToday, completeResolve } = useUser();
  const toast = useToast();
  
  const [activeFilter, setActiveFilter] = useState('all'); // all, post, advice

  const filteredPosts = posts.filter((post) => {
    if (activeFilter === 'all') return true;
    return post.type === activeFilter;
  });

  const renderDailyResolve = () => {
    const challenges = [
      "Dedicate 10 minutes to silent meditation & deep breathing.",
      "List 1 victory (no matter how small) you secured yesterday.",
      "Browse the breakup circle & leave a supportive reply to a brother.",
      "Write down 3 things you can control today, and let go of the rest.",
      "Do 20 bodyweight squats or pushups to activate physical grit.",
      "De-clutter your workspace or phone for 15 minutes to clear your mind.",
      "Check in on a friend or sibling to show brotherhood support."
    ];
    const todayIndex = new Date().getDay();
    const activeChallenge = challenges[todayIndex];

    return (
      <View style={[styles.resolveCard, { backgroundColor: colors.surface, borderColor: colors.border, padding: spacing.md, borderRadius: spacing.borderRadius.xs, marginBottom: spacing.md }]}>
        <View style={styles.resolveHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name="sword" size={18} color={colors.accent} />
            <Text style={[styles.resolveTitle, { color: colors.textPrimary, fontFamily: typography.fontFamily.header, fontSize: typography.sizes.sm, marginLeft: 8 }]}>
              DAILY RESOLVE CHALLENGE
            </Text>
          </View>
          {hasCompletedResolveToday && (
            <View style={[styles.resolvedBadge, { backgroundColor: colors.yellowMuted, borderColor: colors.accent, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, flexDirection: 'row', alignItems: 'center' }]}>
              <MaterialCommunityIcons name="check" size={10} color={colors.accent} />
              <Text style={[styles.resolvedBadgeText, { color: colors.accent, fontFamily: typography.fontFamily.header, fontSize: 8, marginLeft: 2 }]}>
                COMPLETE
              </Text>
            </View>
          )}
        </View>
        <Text style={[styles.resolveContent, { color: colors.textPrimary, fontFamily: typography.fontFamily.body, fontSize: typography.sizes.sm, marginVertical: spacing.sm, lineHeight: 18 }]}>
          "{activeChallenge}"
        </Text>
        
        {hasCompletedResolveToday ? (
          <View style={[styles.claimSuccessBox, { borderColor: colors.success, borderWidth: 1.5, borderStyle: 'dashed', borderRadius: 4, paddingVertical: spacing.xs + 2, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }]}>
            <MaterialCommunityIcons name="check-circle" size={16} color={colors.success} />
            <Text style={[styles.claimSuccessText, { color: colors.success, fontFamily: typography.fontFamily.header, fontSize: 11, marginLeft: 6, fontWeight: '800', letterSpacing: 0.5 }]}>
              STREAK SECURED (+1 DAY)
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.resolveBtn, { backgroundColor: colors.accent, paddingVertical: 10, borderRadius: 4, alignItems: 'center', justifyContent: 'center' }]}
            onPress={() => {
              completeResolve();
              toast.success('Grit affirmed. Daily Resolve Secured!');
            }}
            activeOpacity={0.8}
          >
            <Text style={[styles.resolveBtnText, { color: colors.background, fontFamily: typography.fontFamily.header, fontSize: 11, fontWeight: '800', letterSpacing: 0.5 }]}>
              AFFIRM & RESOLVE
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderPost = ({ item }) => (
    <PostCard
      post={item}
      onLike={() => toggleLikePost(item.id)}
      onSave={() => toggleSavePost(item.id)}
      onCommentPress={() => navigation.navigate('PostDetail', { postId: item.id })}
      onReportPress={() => toast.success('Post reported to moderators.')}
      onCardPress={() => navigation.navigate('PostDetail', { postId: item.id })}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Banner: Streaks, Notifications, Search */}
      <View style={[styles.header, { borderBottomColor: colors.border, paddingHorizontal: spacing.md, paddingVertical: spacing.sm }]}>
        <StreakBadge count={streakCount} />
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Notifications')}
            style={styles.actionBtn}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="bell-outline" size={24} color={colors.accent} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('ProfileTab', { screen: 'DailyCheckIn' })}
            style={styles.actionBtn}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="emoticon-outline" size={24} color={colors.accent} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Chips */}
      <View style={[styles.filterBar, { paddingHorizontal: spacing.md, paddingVertical: spacing.sm }]}>
        {['all', 'post', 'advice'].map((filter) => {
          const isActive = activeFilter === filter;
          return (
            <TouchableOpacity
              key={filter}
              style={[
                styles.chip,
                {
                  backgroundColor: isActive ? colors.accent : colors.surface,
                  borderRadius: spacing.borderRadius.xs - 2,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.xs,
                }
              ]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[
                styles.chipText,
                {
                  color: isActive ? colors.background : colors.textSecondary,
                  fontFamily: typography.fontFamily.header,
                  fontSize: 12,
                }
              ]}>
                {filter.toUpperCase()}S
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Feed List */}
      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        ListHeaderComponent={renderDailyResolve}
        contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: spacing.xl }}
        ListEmptyComponent={
          <EmptyState
            icon="ghost"
            title="No Posts Here Yet"
            message="Be the first to leave your thoughts in the feed."
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionBtn: {
    padding: 4,
  },
  filterBar: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  resolveCard: {
    borderWidth: 1.5,
  },
  resolveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resolveTitle: {
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  resolveContent: {
    lineHeight: 18,
    fontStyle: 'italic',
  },
  resolveBtn: {
    marginTop: 4,
  },
  resolveBtnText: {
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  claimSuccessBox: {
    marginTop: 4,
  },
  claimSuccessText: {
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
