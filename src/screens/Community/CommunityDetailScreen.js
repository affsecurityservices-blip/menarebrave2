import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ImageBackground, Modal } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { useToast } from '../../context/ToastContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PostCard from '../../components/post/PostCard';
import EmptyState from '../../components/common/EmptyState';
import { COMMUNITIES } from '../../utils/constants';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function CommunityDetailScreen({ route, navigation }) {
  const { communityId } = route.params || {};
  const { colors, typography, spacing } = useTheme();
  const { posts, toggleLikePost, toggleSavePost, joinedCommunityIds, toggleJoinCommunity } = useUser();
  const toast = useToast();
  const insets = useSafeAreaInsets();

  const [menuVisible, setMenuVisible] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' or 'about'

  const community = COMMUNITIES.find((c) => c.id === communityId);
  const isJoined = joinedCommunityIds.includes(communityId);

  // Filter posts belonging to this community
  const communityPosts = posts.filter(
    (p) => p.category?.toLowerCase() === community?.name.split(' ')[0].toLowerCase()
  );

  if (!community) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textPrimary }}>Community not found.</Text>
      </View>
    );
  }

  const getCoverImage = (name) => {
    const prefix = name?.split(' ')[0].toLowerCase();
    switch (prefix) {
      case 'career':
        return 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=640';
      case 'heartbreak':
        return 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=640';
      case 'fatherhood':
        return 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=640';
      case 'iron':
        return 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=640';
      default:
        return 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=640';
    }
  };

  const renderPost = ({ item }) => (
    <View style={{ paddingHorizontal: spacing.md }}>
      <PostCard
        post={item}
        onLike={() => toggleLikePost(item.id)}
        onSave={() => toggleSavePost(item.id)}
        onCommentPress={() => navigation.navigate('ThreadDetail', { postId: item.id })}
        onReportPress={() => toast.success('Post flagged.')}
        onCardPress={() => navigation.navigate('ThreadDetail', { postId: item.id })}
      />
    </View>
  );

  const renderHeader = () => (
    <View style={{ backgroundColor: colors.background }}>
      {/* Banner / Cover Photo */}
      <ImageBackground source={{ uri: getCoverImage(community.name) }} style={styles.coverImage} />

      {/* Profile Details area */}
      <View style={{ paddingHorizontal: spacing.md, paddingBottom: spacing.sm }}>
        {/* Avatar & Action Row */}
        <View style={styles.profileRow}>
          <View style={[styles.profileIconContainer, { backgroundColor: colors.surfaceLight, borderColor: colors.background }]}>
            {community.image ? (
              <Image source={{ uri: community.image }} style={styles.profileImage} />
            ) : (
              <MaterialCommunityIcons name={community.icon || 'chat'} size={40} color={colors.accent} />
            )}
          </View>
          
          <View style={styles.profileActions}>
            {!isJoined ? (
              <TouchableOpacity
                style={[styles.joinActionBtn, { backgroundColor: colors.accent }]}
                onPress={() => {
                  toggleJoinCommunity(communityId);
                  toast.success(`Joined ${community.name}`);
                }}
              >
                <MaterialCommunityIcons name="plus" size={16} color={colors.background} style={{ marginRight: 4 }} />
                <Text style={[styles.joinActionText, { color: colors.background, fontFamily: typography.fontFamily.header }]}>
                  JOIN
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.joinedActionBtn, { borderColor: colors.accent }]}
                onPress={() => {
                  toggleJoinCommunity(communityId);
                  toast.success(`Left ${community.name}`);
                }}
              >
                <MaterialCommunityIcons name="check" size={16} color={colors.accent} style={{ marginRight: 4 }} />
                <Text style={[styles.joinedActionText, { color: colors.accent, fontFamily: typography.fontFamily.header }]}>
                  JOINED
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Title, Handle, Description */}
        <Text style={[styles.title, { color: colors.textPrimary, fontFamily: typography.fontFamily.header, fontSize: 22, marginTop: spacing.sm }]}>
          {community.name}
        </Text>
        <Text style={[styles.handleText, { color: colors.textSecondary, fontFamily: typography.fontFamily.body, fontSize: 12, marginTop: 2 }]}>
          c/{community.name.toLowerCase().replace(/[^a-z0-9]/g, '')} • Official Circle
        </Text>
        
        <Text style={[styles.description, { color: colors.textSecondary, fontFamily: typography.fontFamily.body, fontSize: 13, marginTop: spacing.md }]}>
          {community.description}
        </Text>

        {/* Stats Grid */}
        <View style={[styles.statsContainer, { borderColor: colors.border }]}>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: colors.textPrimary, fontFamily: typography.fontFamily.header }]}>
              {community.memberCount}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary, fontFamily: typography.fontFamily.body }]}>
              Members
            </Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: colors.textPrimary, fontFamily: typography.fontFamily.header }]}>
              {communityPosts.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary, fontFamily: typography.fontFamily.body }]}>
              Posts
            </Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: colors.textPrimary, fontFamily: typography.fontFamily.header }]}>
              45
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary, fontFamily: typography.fontFamily.body }]}>
              Active
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
              ABOUT & RULES
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Contents rendered inside header to scroll seamlessly */}
      {activeTab === 'posts' && isJoined && (
        <TouchableOpacity
          style={[styles.writePostBanner, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => {
            const initialCategory = community.name.split(' ')[0];
            navigation.navigate('CreatePost', { initialCategory });
          }}
          activeOpacity={0.9}
        >
          <MaterialCommunityIcons name="pencil-outline" size={20} color={colors.textSecondary} style={{ marginRight: spacing.sm }} />
          <Text style={{ color: colors.textSecondary, fontFamily: typography.fontFamily.body, fontSize: 13 }}>
            Share something with this circle...
          </Text>
        </TouchableOpacity>
      )}

      {activeTab === 'about' && (
        <View style={[styles.aboutContainer, { paddingHorizontal: spacing.md, paddingBottom: spacing.md }]}>
          <View style={[styles.aboutCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.aboutTitle, { color: colors.accent, fontFamily: typography.fontFamily.header, fontSize: 14, marginBottom: spacing.sm }]}>
              CIRCLE LAWS
            </Text>
            <Text style={[styles.ruleText, { color: colors.textPrimary, fontFamily: typography.fontFamily.body, fontSize: 13, marginBottom: spacing.xs }]}>
              1. Respect confidentiality - what happens in the circle stays here.
            </Text>
            <Text style={[styles.ruleText, { color: colors.textPrimary, fontFamily: typography.fontFamily.body, fontSize: 13, marginBottom: spacing.xs }]}>
              2. Stay brave and supportive. No judgment, only growth.
            </Text>
            <Text style={[styles.ruleText, { color: colors.textPrimary, fontFamily: typography.fontFamily.body, fontSize: 13, marginBottom: spacing.xs }]}>
              3. Keep discussion constructive and related to {community.name}.
            </Text>
            <Text style={[styles.ruleText, { color: colors.textPrimary, fontFamily: typography.fontFamily.body, fontSize: 13 }]}>
              4. Strictly avoid advertising or self-promotion.
            </Text>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Overlaid Custom Header */}
      <View style={[styles.customHeader, { top: insets.top || 16 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerCircleBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.headerRightBtns}>
          <TouchableOpacity onPress={() => toast.success("Sharing Circle...")} style={styles.headerCircleBtn}>
            <MaterialCommunityIcons name="share-variant" size={18} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMenuVisible((prev) => !prev)} style={styles.headerCircleBtn}>
            <MaterialCommunityIcons name="dots-vertical" size={22} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Scroll Content */}
      <FlatList
        data={activeTab === 'posts' ? communityPosts : []}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        ListEmptyComponent={
          activeTab === 'posts' ? (
            <EmptyState
              icon="bulletin-board"
              title="Silence in the Circle"
              message="No posts broadcasted in this community yet."
            />
          ) : null
        }
      />

      {/* Circle Options Bottom Sheet Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setMenuVisible(false)} />
          <View style={[styles.menuContainer, { backgroundColor: colors.surface, borderColor: colors.border, paddingBottom: insets.bottom || 16 }]}>
            {/* Pull Handle */}
            <View style={styles.pullHandle} />

            <Text style={[styles.menuTitle, { color: colors.textPrimary, fontFamily: typography.fontFamily.header }]}>
              {community?.name || 'CIRCLE OPTIONS'}
            </Text>
            
            {isJoined ? (
              <TouchableOpacity
                style={styles.menuOption}
                onPress={() => {
                  setMenuVisible(false);
                  toggleJoinCommunity(communityId);
                  toast.success(`Left ${community.name}`);
                }}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="circle-off-outline" size={20} color={colors.danger} style={{ marginRight: 12 }} />
                <Text style={[styles.menuOptionText, { color: colors.danger, fontFamily: typography.fontFamily.body }]}>
                  LEAVE CIRCLE
                </Text>
                <MaterialCommunityIcons name="chevron-right" size={16} color={colors.danger} style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.menuOption}
                onPress={() => {
                  setMenuVisible(false);
                  toggleJoinCommunity(communityId);
                  toast.success(`Joined ${community.name}`);
                }}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="plus-circle-outline" size={20} color={colors.accent} style={{ marginRight: 12 }} />
                <Text style={[styles.menuOptionText, { color: colors.accent, fontFamily: typography.fontFamily.body }]}>
                  JOIN CIRCLE
                </Text>
                <MaterialCommunityIcons name="chevron-right" size={16} color={colors.accent} style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.menuOption}
              onPress={() => {
                setMenuVisible(false);
                setIsMuted(!isMuted);
                toast.success(isMuted ? 'Notifications unmuted' : 'Notifications muted');
              }}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name={isMuted ? 'bell-outline' : 'bell-off-outline'}
                size={20}
                color={colors.textPrimary}
                style={{ marginRight: 12 }}
              />
              <Text style={[styles.menuOptionText, { color: colors.textPrimary, fontFamily: typography.fontFamily.body }]}>
                {isMuted ? 'UNMUTE CIRCLE' : 'MUTE CIRCLE'}
              </Text>
              <MaterialCommunityIcons name="chevron-right" size={16} color={colors.textSecondary} style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuOption}
              onPress={() => {
                setMenuVisible(false);
                toast.success('Circle link copied to clipboard.');
              }}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="share-variant" size={20} color={colors.accent} style={{ marginRight: 12 }} />
              <Text style={[styles.menuOptionText, { color: colors.textPrimary, fontFamily: typography.fontFamily.body }]}>
                SHARE CIRCLE
              </Text>
              <MaterialCommunityIcons name="chevron-right" size={16} color={colors.textSecondary} style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuOption}
              onPress={() => {
                setMenuVisible(false);
                toast.success('Circle reported to moderators.');
              }}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="flag-outline" size={20} color={colors.danger} style={{ marginRight: 12 }} />
              <Text style={[styles.menuOptionText, { color: colors.danger, fontFamily: typography.fontFamily.body }]}>
                REPORT CIRCLE
              </Text>
              <MaterialCommunityIcons name="chevron-right" size={16} color={colors.danger} style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.closeBtn, { borderColor: colors.border, backgroundColor: colors.background }]}
              onPress={() => setMenuVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={[styles.closeBtnText, { color: colors.textPrimary, fontFamily: typography.fontFamily.header }]}>
                CLOSE
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverImage: {
    width: '100%',
    height: 150,
  },
  customHeader: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  headerCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRightBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    width: '100%',
    paddingHorizontal: 4,
  },
  profileIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginTop: -40,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  joinActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  joinActionText: {
    fontSize: 12,
    fontWeight: '800',
  },
  joinedActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  joinedActionText: {
    fontSize: 12,
    fontWeight: '800',
  },
  title: {
    fontWeight: '800',
  },
  handleText: {
    fontWeight: '500',
  },
  description: {
    lineHeight: 18,
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
  writePostBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  aboutContainer: {
    marginTop: 16,
    width: '100%',
    paddingBottom: 16,
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
  ruleText: {
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1.5,
    paddingTop: 12,
    paddingHorizontal: 20,
  },
  pullHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'center',
    marginBottom: 16,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 16,
    textAlign: 'center',
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  menuOptionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  closeBtn: {
    borderWidth: 1.5,
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  closeBtnText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
