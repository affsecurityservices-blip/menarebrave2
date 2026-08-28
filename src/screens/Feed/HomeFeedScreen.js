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
  const { posts, toggleLikePost, toggleSavePost, streakCount } = useUser();
  const toast = useToast();
  
  const [activeFilter, setActiveFilter] = useState('all'); // all, post, advice

  const filteredPosts = posts.filter((post) => {
    if (activeFilter === 'all') return true;
    return post.type === activeFilter;
  });

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
});
