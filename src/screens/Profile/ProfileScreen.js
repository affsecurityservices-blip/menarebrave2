import React, { useState, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useUser } from '../../context/UserContext';
import { useToast } from '../../context/ToastContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Avatar from '../../components/common/Avatar';
import StreakBadge from '../../components/moodcheckin/StreakBadge';
import PostCard from '../../components/post/PostCard';
import EmptyState from '../../components/common/EmptyState';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ProfileScreen({ navigation }) {
  const { colors, typography, spacing } = useTheme();
  const { user } = useAuth();
  const { streakCount, posts, toggleLikePost, toggleSavePost } = useUser();
  const toast = useToast();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState('posts'); // 'posts' or 'about'

  // Hide the default navigation stack header to render our premium custom translucent header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  // Filter posts written by the logged-in user
  const userPosts = posts.filter(
    (p) => p.author === (user?.username || 'Anonymous Member')
  );

  const renderHeader = () => (
    <View style={{ backgroundColor: colors.background }}>
      {/* Cover / Cover Banner (Reddit-style Gradient Cover) */}
      <LinearGradient
        colors={[colors.surfaceLight, colors.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.coverGradient}
      />

      {/* Profile Details Area */}
      <View style={{ paddingHorizontal: spacing.md, paddingBottom: spacing.sm }}>
        {/* Avatar Overlay */}
        <View style={styles.profileRow}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.background, borderColor: colors.background }]}>
            <Avatar type={user?.avatar || 'anonymous'} size={80} />
          </View>
        </View>

        {/* Username, Handle and Status Indicator */}
        <View style={{ marginTop: spacing.xs }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={[styles.username, { color: colors.textPrimary, fontFamily: typography.fontFamily.header, fontSize: typography.sizes.xl }]}>
              {user?.username || 'Anonymous Member'}
            </Text>
            <View style={[styles.roleBadge, { backgroundColor: colors.yellowMuted, borderColor: colors.accent }]}>
              <Text style={[styles.roleBadgeText, { color: colors.accent, fontFamily: typography.fontFamily.header }]}>
                YOU
              </Text>
            </View>
          </View>
          
          <Text style={[styles.handleText, { color: colors.textSecondary, fontFamily: typography.fontFamily.body, fontSize: 12, marginTop: 2 }]}>
            u/{(user?.username || 'anonymous').toLowerCase().replace(/[^a-z0-9]/g, '')} • Shield Active
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={[styles.statsContainer, { borderColor: colors.border }]}>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: colors.textPrimary, fontFamily: typography.fontFamily.header }]}>
              {userPosts.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary, fontFamily: typography.fontFamily.body }]}>
              Logs
            </Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statBox}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <MaterialCommunityIcons name="fire" size={18} color="#FFD100" />
              <Text style={[styles.statValue, { color: colors.textPrimary, fontFamily: typography.fontFamily.header }]}>
                {streakCount}
              </Text>
            </View>
            <Text style={[styles.statLabel, { color: colors.textSecondary, fontFamily: typography.fontFamily.body }]}>
              Day Streak
            </Text>
          </View>
        </View>

        {/* Custom Tabs Bar */}
        <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'posts' && { borderBottomColor: colors.accent, borderBottomWidth: 2 }]}
            onPress={() => setActiveTab('posts')}
          >
            <Text style={[styles.tabText, { color: activeTab === 'posts' ? colors.textPrimary : colors.textSecondary, fontFamily: typography.fontFamily.header }]}>
              POSTS
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'about' && { borderBottomColor: colors.accent, borderBottomWidth: 2 }]}
            onPress={() => setActiveTab('about')}
          >
            <Text style={[styles.tabText, { color: activeTab === 'about' ? colors.textPrimary : colors.textSecondary, fontFamily: typography.fontFamily.header }]}>
              ABOUT
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderEmptyOrAbout = () => {
    if (activeTab === 'posts') {
      return (
        <EmptyState
          icon="bulletin-board"
          title="No log broadcasts yet"
          message="Your personal stream is silent. Share advice or ask a question in the feed to begin your logs."
        />
      );
    }

    // Render ABOUT Tab Contents
    return (
      <View style={[styles.aboutContainer, { paddingHorizontal: spacing.md }]}>
        {/* Edit Profile Mask Button */}
        <TouchableOpacity
          style={[styles.editBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
          onPress={() => navigation.navigate('EditProfile')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="pencil-outline" size={16} color={colors.textPrimary} style={{ marginRight: 8 }} />
          <Text style={[styles.editBtnText, { color: colors.textPrimary, fontFamily: typography.fontFamily.header }]}>
            EDIT PROFILE MASK
          </Text>
        </TouchableOpacity>

        {/* Identity Details Card */}
        <View style={[styles.aboutCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.aboutTitle, { color: colors.accent, fontFamily: typography.fontFamily.header, fontSize: 13, marginBottom: spacing.sm }]}>
            IDENTITY DETAILS
          </Text>
          <Text style={[styles.aboutText, { color: colors.textPrimary, fontFamily: typography.fontFamily.body, fontSize: 13, lineHeight: 22 }]}>
            Username: <Text style={{ fontWeight: '700' }}>u/{user?.username || 'Anonymous Member'}</Text>{"\n"}
            Shelter Region: <Text style={{ color: colors.accent, fontWeight: '700' }}>{user?.country || 'India'} ({user?.countryCode || '+91'})</Text>{"\n"}
            Privacy Shield: <Text style={{ color: colors.success, fontWeight: '700' }}>100% Encrypted & Anonymous</Text>
          </Text>
        </View>

        {/* Security / Shield details */}
        <View style={[styles.aboutCard, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: spacing.md, marginBottom: spacing.lg }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs }}>
            <MaterialCommunityIcons name="shield-check" size={18} color={colors.success} style={{ marginRight: 6 }} />
            <Text style={[styles.aboutTitle, { color: colors.success, fontFamily: typography.fontFamily.header, fontSize: 13 }]}>
              SANCTITY SHIELD ACTIVE
            </Text>
          </View>
          <Text style={[styles.aboutText, { color: colors.textSecondary, fontFamily: typography.fontFamily.body, fontSize: 12, lineHeight: 18 }]}>
            Your identity is completely protected under the Sanctity Shield. Other circle members can only see your mask avatar, custom pseudonymous name, post logs, and streak. Personally identifiable details, email logs, and device configurations are fully encrypted.
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Overlaid Translucent Three Dots Options Button Header */}
      <View style={[styles.customHeader, { top: insets.top || 16 }]}>
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          onPress={() => navigation.navigate('ProfileMenu')}
          style={styles.headerCircleBtn}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="dots-vertical" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Main Scrollable Content */}
      <FlatList
        data={activeTab === 'posts' ? userPosts : []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: spacing.md, paddingBottom: spacing.sm }}>
            <PostCard
              post={item}
              onLike={() => toggleLikePost(item.id)}
              onSave={() => toggleSavePost(item.id)}
              onCommentPress={() => navigation.navigate('PostDetail', { postId: item.id })}
              onReportPress={() => toast.success('Post reported.')}
              onCardPress={() => navigation.navigate('PostDetail', { postId: item.id })}
            />
          </View>
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyOrAbout}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  coverGradient: {
    width: '100%',
    height: 120,
  },
  customHeader: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 10,
    flexDirection: 'row',
  },
  headerCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    width: '100%',
  },
  avatarContainer: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -43,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 3px rgba(0, 0, 0, 0.3)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 4,
      },
    }),
  },
  username: {
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  roleBadge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  roleBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  handleText: {
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 12,
    marginTop: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginTop: 16,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  aboutContainer: {
    marginTop: 16,
    width: '100%',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    paddingVertical: 12,
    borderRadius: 4,
    marginBottom: 16,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  aboutCard: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
  },
  aboutTitle: {
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  aboutText: {
    lineHeight: 18,
  },
});
