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
      <View style={[styles.resolveCard, { backgroundColor: colors.surface, borderColor: 'rgba(255, 209, 0, 0.25)' }]}>
        <View style={styles.resolveHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name="sword" size={15} color={colors.accent} />
            <Text style={[styles.resolveTitle, { color: colors.textPrimary, fontFamily: typography.fontFamily.header, marginLeft: 6 }]}>
              DAILY RESOLVE CHALLENGE
            </Text>
          </View>
          {hasCompletedResolveToday && (
            <View style={[styles.resolvedBadge, { backgroundColor: colors.yellowMuted, borderColor: colors.accent }]}>
              <MaterialCommunityIcons name="check" size={9} color={colors.accent} />
              <Text style={[styles.resolvedBadgeText, { color: colors.accent, fontFamily: typography.fontFamily.header }]}>
                COMPLETE
              </Text>
            </View>
          )}
        </View>
        <Text style={[styles.resolveContent, { color: colors.textPrimary, fontFamily: typography.fontFamily.body }]}>
          "{activeChallenge}"
        </Text>
        
        {hasCompletedResolveToday ? (
          <View style={[styles.claimSuccessBox, { borderColor: colors.success }]}>
            <MaterialCommunityIcons name="check-circle" size={14} color={colors.success} />
            <Text style={[styles.claimSuccessText, { color: colors.success, fontFamily: typography.fontFamily.header }]}>
              STREAK SECURED (+1 DAY)
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.resolveBtn, { backgroundColor: colors.accent }]}
            onPress={() => {
              completeResolve();
              toast.success('Grit affirmed. Daily Resolve Secured!');
            }}
            activeOpacity={0.8}
          >
            <Text style={[styles.resolveBtnText, { color: colors.background, fontFamily: typography.fontFamily.header }]}>
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
      <View style={[styles.header, { borderBottomColor: 'rgba(255, 255, 255, 0.06)' }]}>
        <StreakBadge count={streakCount} />
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Notifications')}
            style={styles.actionBtn}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="bell-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('ProfileTab', { screen: 'DailyCheckIn' })}
            style={styles.actionBtn}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="emoticon-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterBar}>
        {[
          { key: 'all', label: 'ALL' },
          { key: 'post', label: 'POSTS' },
          { key: 'advice', label: 'ADVICE' },
        ].map((item) => {
          const isActive = activeFilter === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.chip,
                {
                  backgroundColor: isActive ? colors.accent : 'rgba(255, 255, 255, 0.04)',
                  borderColor: isActive ? colors.accent : 'rgba(255, 255, 255, 0.08)',
                }
              ]}
              onPress={() => setActiveFilter(item.key)}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.chipText,
                {
                  color: isActive ? '#000000' : colors.textSecondary,
                  fontFamily: typography.fontFamily.header,
                }
              ]}>
                {item.label}
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
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 24, paddingTop: 4 }}
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
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionBtn: {
    padding: 6,
    borderRadius: 8,
  },
  filterBar: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  resolveCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  resolveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resolveTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  resolvedBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 3,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  resolvedBadgeText: {
    fontSize: 7.5,
    fontWeight: '800',
    letterSpacing: 0.3,
    marginLeft: 2,
  },
  resolveContent: {
    fontSize: 12.5,
    lineHeight: 17,
    fontStyle: 'italic',
    marginVertical: 6,
  },
  resolveBtn: {
    paddingVertical: 7,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  resolveBtnText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  claimSuccessBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 4,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 2,
  },
  claimSuccessText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginLeft: 5,
  },
});
