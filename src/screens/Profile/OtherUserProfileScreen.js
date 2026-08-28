import React, { useState, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Platform } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { useToast } from '../../context/ToastContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Avatar from '../../components/common/Avatar';
import StreakBadge from '../../components/moodcheckin/StreakBadge';
import PostCard from '../../components/post/PostCard';
import EmptyState from '../../components/common/EmptyState';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MOODS } from '../../utils/constants';

const getBioForUser = (username) => {
  switch (username) {
    case 'Bruce_93':
      return 'Focus on your craft, block out the noise, and rise from the ashes. Here to support my brothers.';
    case 'SilentGideon':
      return 'Fatherhood and family. Finding strength in silence and leadership. Stronger together.';
    case 'Anonymous Bat':
      return 'Watching the city. Carrying weights in silence. There is always a way out.';
    case 'SolidGrit_45':
      return 'Consistent effort yields solid grit. Helping others push through their dark phases.';
    case 'SolidBrother':
      return 'Always here with an open ear. Brotherhood is about standing tall together.';
    case 'IronGrip_92':
      return 'Discipline, weights, and high standards. Keep pushing, never give up.';
    case 'MentorAurelius':
      return 'Stoic perspectives on modern challenges. Focus on what you can control.';
    default:
      return 'Pseudonymous member of Men Are Brave. Striving for mental resilience, discipline, and brotherhood.';
  }
};

export default function OtherUserProfileScreen({ route, navigation }) {
  const { username = 'Brother Knight', avatar = 'ninja' } = route.params || {};
  const { colors, typography, spacing } = useTheme();
  const { posts, toggleLikePost, toggleSavePost } = useUser();
  const toast = useToast();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState('posts'); // 'posts' or 'about'
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isReportVisible, setIsReportVisible] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);

  const getMoodIcon = (moodKey) => {
    const config = MOODS.find((m) => m.key === moodKey);
    return config || { icon: 'emoticon-neutral-outline', color: colors.textSecondary };
  };

  const getMockMoodHistoryForUser = () => {
    const history = [];
    const today = new Date();
    
    // Deterministic key based on username character codes
    const charSum = username.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    
    for (let i = 27; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const isLogged = (charSum + i * 7) % 10 < 7; // ~70% check-in rate
      let mood = null;
      let label = 'No Log';
      
      if (isLogged) {
        const moodIndex = (charSum + i * 3) % MOODS.length;
        const moodConfig = MOODS[moodIndex];
        mood = moodConfig.key;
        label = moodConfig.label;
      }

      history.push({
        date: dateStr,
        dateLabel: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        mood,
        label,
      });
    }
    return history;
  };

  const otherUserGridData = React.useMemo(() => getMockMoodHistoryForUser(), [username]);

  const getCellColor = (item) => {
    if (!item.mood) return colors.border;
    const config = MOODS.find((m) => m.key === item.mood);
    return config ? config.color : colors.textSecondary;
  };

  // Hide the default navigator header since we render a custom translucent one
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  // Filter posts belonging to this user
  const userPosts = posts.filter((p) => p.author === username);
  
  // Calculate stats
  const streak = username === 'Bruce_93' ? 8 : (username === 'SilentGideon' ? 5 : 3);
  const bio = getBioForUser(username);

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
            <Avatar type={avatar} size={80} />
          </View>
        </View>

        {/* Username, Role and Status Indicator */}
        <View style={{ marginTop: spacing.xs }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={[styles.username, { color: colors.textPrimary, fontFamily: typography.fontFamily.header, fontSize: typography.sizes.xl }]}>
              {username}
            </Text>
            <View style={[styles.roleBadge, { backgroundColor: colors.yellowMuted, borderColor: colors.accent }]}>
              <Text style={[styles.roleBadgeText, { color: colors.accent, fontFamily: typography.fontFamily.header }]}>
                BROTHER
              </Text>
            </View>
          </View>
          
          <Text style={[styles.handleText, { color: colors.textSecondary, fontFamily: typography.fontFamily.body, fontSize: 12, marginTop: 2 }]}>
            u/{username.toLowerCase().replace(/[^a-z0-9]/g, '')} • Shield Active
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
                {streak}
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
          title="Silence in the logs"
          message={`No posts broadcasted by ${username} yet.`}
        />
      );
    }

    // Render ABOUT Tab Contents
    return (
      <View style={[styles.aboutContainer, { paddingHorizontal: spacing.md }]}>
        {/* Biography Card */}
        <View style={[styles.aboutCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.aboutTitle, { color: colors.accent, fontFamily: typography.fontFamily.header, fontSize: 13, marginBottom: spacing.sm }]}>
            BIOGRAPHY
          </Text>
          <Text style={[styles.aboutText, { color: colors.textPrimary, fontFamily: typography.fontFamily.body, fontSize: 13, lineHeight: 20 }]}>
            "{bio}"
          </Text>
        </View>

        {/* 28-Day Mood Matrix Card */}
        <View style={[styles.aboutCard, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: spacing.md }]}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="grid" size={18} color={colors.accent} />
            <Text style={[styles.aboutTitle, { color: colors.accent, fontFamily: typography.fontFamily.header, fontSize: 13, marginLeft: 8 }]}>
              {username.toUpperCase()}'S MOOD MATRIX (LAST 28 DAYS)
            </Text>
          </View>
          <Text style={[styles.aboutText, { color: colors.textSecondary, fontFamily: typography.fontFamily.body, fontSize: 11, marginVertical: spacing.xs }]}>
            Consistency graph showing mood logs. Resilient minds build together.
          </Text>

          <View style={styles.grid}>
            {otherUserGridData.map((item, index) => {
              const isSelected = selectedCell?.date === item.date;
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.gridCell,
                    {
                      backgroundColor: getCellColor(item),
                      borderColor: isSelected ? colors.textPrimary : 'transparent',
                      borderWidth: isSelected ? 1.5 : 0,
                    }
                  ]}
                  onPress={() => setSelectedCell(item)}
                  activeOpacity={0.8}
                />
              );
            })}
          </View>

          <View style={[styles.tooltipContainer, { borderTopColor: colors.border, marginTop: spacing.md, paddingTop: spacing.xs }]}>
            {selectedCell ? (
              <View style={styles.tooltipContent}>
                <MaterialCommunityIcons 
                  name={selectedCell.mood ? getMoodIcon(selectedCell.mood).icon : 'calendar-blank'} 
                  size={16} 
                  color={selectedCell.mood ? getCellColor(selectedCell) : colors.textSecondary} 
                />
                <Text style={[styles.tooltipText, { color: colors.textPrimary, fontFamily: typography.fontFamily.header, fontSize: 11, marginLeft: 6 }]}>
                  {selectedCell.dateLabel}: <Text style={{ color: selectedCell.mood ? getCellColor(selectedCell) : colors.textSecondary }}>{selectedCell.label.toUpperCase()}</Text>
                </Text>
              </View>
            ) : (
              <Text style={[styles.tooltipPlaceholder, { color: colors.textSecondary, fontFamily: typography.fontFamily.body, fontSize: 11, textAlign: 'center' }]}>
                Tap any block to view details.
              </Text>
            )}
          </View>
        </View>

        {/* Security / Shield details */}
        <View style={[styles.aboutCard, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: spacing.md }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs }}>
            <MaterialCommunityIcons name="shield-check" size={18} color={colors.success} style={{ marginRight: 6 }} />
            <Text style={[styles.aboutTitle, { color: colors.success, fontFamily: typography.fontFamily.header, fontSize: 13 }]}>
              SANCTITY SHIELD ACTIVE
            </Text>
          </View>
          <Text style={[styles.aboutText, { color: colors.textSecondary, fontFamily: typography.fontFamily.body, fontSize: 12, lineHeight: 18 }]}>
            This member is browsing in pseudonymous shield mode. Complete IP logs, device details, and personal identity are encrypted and hidden to preserve the sanctity and privacy of the feed.
          </Text>
        </View>

        {/* Achievement Badges */}
        <View style={[styles.aboutCard, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: spacing.md, marginBottom: spacing.lg }]}>
          <Text style={[styles.aboutTitle, { color: colors.accent, fontFamily: typography.fontFamily.header, fontSize: 13, marginBottom: spacing.sm }]}>
            CIRCLES ACHIEVEMENTS
          </Text>
          <View style={styles.badgeRow}>
            <View style={[styles.badgeItem, { backgroundColor: colors.surfaceLight }]}>
              <MaterialCommunityIcons name="shield-crown" size={16} color={colors.accent} />
              <Text style={[styles.badgeText, { color: colors.textPrimary, fontFamily: typography.fontFamily.body }]}>
                Brave Protector
              </Text>
            </View>
            <View style={[styles.badgeItem, { backgroundColor: colors.surfaceLight }]}>
              <MaterialCommunityIcons name="fire" size={16} color="#FFD100" />
              <Text style={[styles.badgeText, { color: colors.textPrimary, fontFamily: typography.fontFamily.body }]}>
                Consistent Vibe
              </Text>
            </View>
            <View style={[styles.badgeItem, { backgroundColor: colors.surfaceLight }]}>
              <MaterialCommunityIcons name="heart-pulse" size={16} color={colors.danger} />
              <Text style={[styles.badgeText, { color: colors.textPrimary, fontFamily: typography.fontFamily.body }]}>
                Vibe Checker
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Overlaid Translucent Back & Options Button Header */}
      <View style={[styles.customHeader, { top: insets.top || 16 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerCircleBtn} activeOpacity={0.7}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#ffffff" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsMenuVisible(true)} style={styles.headerCircleBtn} activeOpacity={0.7}>
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

      {/* User Options Bottom Sheet Modal */}
      <Modal
        visible={isMenuVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsMenuVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setIsMenuVisible(false)} />
          <View style={[styles.menuContainer, { backgroundColor: colors.surface, borderColor: colors.border, paddingBottom: insets.bottom || 16 }]}>
            {/* Pull Handle */}
            <View style={styles.pullHandle} />

            <Text style={[styles.menuTitle, { color: colors.textPrimary, fontFamily: typography.fontFamily.header }]}>
              u/{username}
            </Text>
            
            <TouchableOpacity
              style={styles.menuOption}
              onPress={() => {
                setIsMenuVisible(false);
                navigation.navigate('ChatTab', {
                  screen: 'ChatRoom',
                  params: { name: username }
                });
              }}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="message-outline" size={20} color={colors.accent} style={{ marginRight: 12 }} />
              <Text style={[styles.menuOptionText, { color: colors.textPrimary, fontFamily: typography.fontFamily.body }]}>
                Send Message / Chat
              </Text>
              <MaterialCommunityIcons name="chevron-right" size={16} color={colors.textSecondary} style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuOption}
              onPress={() => {
                setIsMenuVisible(false);
                toast.success(`Copied u/${username}'s profile link to clipboard!`);
              }}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="share-variant" size={20} color={colors.accent} style={{ marginRight: 12 }} />
              <Text style={[styles.menuOptionText, { color: colors.textPrimary, fontFamily: typography.fontFamily.body }]}>
                Share Profile
              </Text>
              <MaterialCommunityIcons name="chevron-right" size={16} color={colors.textSecondary} style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuOption}
              onPress={() => {
                setIsMenuVisible(false);
                setIsReportVisible(true);
              }}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="alert-octagon-outline" size={20} color={colors.danger} style={{ marginRight: 12 }} />
              <Text style={[styles.menuOptionText, { color: colors.danger, fontFamily: typography.fontFamily.body }]}>
                Report User
              </Text>
              <MaterialCommunityIcons name="chevron-right" size={16} color={colors.danger} style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuOption}
              onPress={() => {
                setIsMenuVisible(false);
                toast.success(`Successfully blocked u/${username}.`);
              }}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="account-cancel" size={20} color={colors.danger} style={{ marginRight: 12 }} />
              <Text style={[styles.menuOptionText, { color: colors.danger, fontFamily: typography.fontFamily.body }]}>
                Block User
              </Text>
              <MaterialCommunityIcons name="chevron-right" size={16} color={colors.danger} style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.closeBtn, { borderColor: colors.border, backgroundColor: colors.background }]}
              onPress={() => setIsMenuVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={[styles.closeBtnText, { color: colors.textPrimary, fontFamily: typography.fontFamily.header }]}>
                CLOSE
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Report User Bottom Sheet Modal */}
      <Modal
        visible={isReportVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsReportVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setIsReportVisible(false)} />
          <View style={[styles.menuContainer, { backgroundColor: colors.surface, borderColor: colors.border, paddingBottom: insets.bottom || 16 }]}>
            {/* Pull Handle */}
            <View style={styles.pullHandle} />

            <Text style={[styles.menuTitle, { color: colors.textPrimary, fontFamily: typography.fontFamily.header }]}>
              REPORT u/{username}
            </Text>
            
            {['Harassment or Bullying', 'Spam or Deceptive', 'Inappropriate Username/Avatar', 'Abusive Behavior'].map((reason, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuOption}
                onPress={() => {
                  setIsReportVisible(false);
                  toast.success(`User report submitted for: ${reason}`);
                }}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="flag-outline" size={18} color={colors.textSecondary} style={{ marginRight: 12 }} />
                <Text style={[styles.menuOptionText, { color: colors.textPrimary, fontFamily: typography.fontFamily.body }]}>
                  {reason}
                </Text>
                <MaterialCommunityIcons name="chevron-right" size={16} color={colors.textSecondary} style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[styles.closeBtn, { borderColor: colors.border, backgroundColor: colors.background }]}
              onPress={() => setIsReportVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={[styles.closeBtnText, { color: colors.textPrimary, fontFamily: typography.fontFamily.header }]}>
                CANCEL
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
    justifyContent: 'space-between',
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
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 12,
    justifyContent: 'space-between',
  },
  gridCell: {
    width: '11%',
    aspectRatio: 1,
    borderRadius: 4,
  },
  tooltipContainer: {
    borderTopWidth: 1,
    height: 32,
    justifyContent: 'center',
  },
  tooltipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tooltipText: {
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tooltipPlaceholder: {
    fontStyle: 'italic',
  },
});
