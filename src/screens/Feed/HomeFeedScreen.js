import React, { useState, useRef, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { useToast } from '../../context/ToastContext';
import PostCard from '../../components/post/PostCard';
import EmptyState from '../../components/common/EmptyState';
import StreakBadge from '../../components/moodcheckin/StreakBadge';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const HEADER_HEIGHT = 48;

export default function HomeFeedScreen({ navigation }) {
  const { colors, typography, spacing } = useTheme();
  const { posts, toggleLikePost, toggleSavePost, streakCount } = useUser();
  const toast = useToast();
  
  const [activeFilter, setActiveFilter] = useState('all'); // all, post, advice

  // Animated collapsible 5-streak header
  const headerHeight = useRef(new Animated.Value(HEADER_HEIGHT)).current;
  const headerOpacity = useRef(new Animated.Value(1)).current;
  const isHeaderVisible = useRef(true);
  const lastScrollY = useRef(0);
  const scrollStopTimer = useRef(null);

  const showHeader = () => {
    if (isHeaderVisible.current) return;
    isHeaderVisible.current = true;
    Animated.parallel([
      Animated.timing(headerHeight, {
        toValue: HEADER_HEIGHT,
        duration: 220,
        useNativeDriver: false,
      }),
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const hideHeader = () => {
    if (!isHeaderVisible.current) return;
    isHeaderVisible.current = false;
    Animated.parallel([
      Animated.timing(headerHeight, {
        toValue: 0,
        duration: 220,
        useNativeDriver: false,
      }),
      Animated.timing(headerOpacity, {
        toValue: 0,
        duration: 170,
        useNativeDriver: false,
      }),
    ]).start();
  };

  useEffect(() => {
    return () => {
      if (scrollStopTimer.current) {
        clearTimeout(scrollStopTimer.current);
      }
    };
  }, []);

  const handleScroll = (event) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const diff = currentScrollY - lastScrollY.current;

    if (scrollStopTimer.current) {
      clearTimeout(scrollStopTimer.current);
    }

    // Always visible at the very top
    if (currentScrollY <= 8) {
      showHeader();
      lastScrollY.current = currentScrollY;
      return;
    }

    // Scrolling up into the feed (finger up): hide streak bar
    if (diff > 6 && isHeaderVisible.current) {
      hideHeader();
    }
    // Scrolling down (finger down): show streak bar
    else if (diff < -8 && !isHeaderVisible.current) {
      showHeader();
    }

    // "bs ruke to dikhe" -> Reveal when user stops scrolling
    scrollStopTimer.current = setTimeout(() => {
      showHeader();
    }, 280);

    lastScrollY.current = currentScrollY;
  };

  const handleScrollEnd = () => {
    if (scrollStopTimer.current) {
      clearTimeout(scrollStopTimer.current);
    }
    showHeader();
  };

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
      {/* Top Banner: Streaks, Notifications, Search - Animated Collapsible */}
      <Animated.View
        style={[
          styles.headerWrapper,
          {
            height: headerHeight,
            opacity: headerOpacity,
          }
        ]}
      >
        <View style={[styles.header, { borderBottomColor: 'rgba(255, 255, 255, 0.06)' }]}>
          <StreakBadge
            count={streakCount}
            onPress={() => navigation.navigate('DailyStreak')}
          />
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
      </Animated.View>

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
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onScrollEndDrag={handleScrollEnd}
        onMomentumScrollEnd={handleScrollEnd}
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
  headerWrapper: {
    overflow: 'hidden',
  },
  header: {
    height: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingHorizontal: 14,
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
});
