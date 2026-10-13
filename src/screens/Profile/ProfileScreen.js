import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useUser } from '../../context/UserContext';
import { useToast } from '../../context/ToastContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Avatar from '../../components/common/Avatar';
import StreakBadge from '../../components/moodcheckin/StreakBadge';
import PostCard from '../../components/post/PostCard';
import EmptyState from '../../components/common/EmptyState';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ProfileScreen({ navigation }) {
  const { colors, typography, spacing } = useTheme();
  const { user, toggleAnonymousMode, setProfileIdentity } = useAuth();
  const { streakCount, posts, toggleLikePost, toggleSavePost } = useUser();
  const toast = useToast();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState('posts'); // 'posts' or 'about'

  // Modal for first-time public profile configuration
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [isSavingIdentity, setIsSavingIdentity] = useState(false);
  const [setupErrors, setSetupErrors] = useState({});

  // Hide the default navigation stack header to render custom translucent header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  // Filter posts written by the logged-in user
  const userPosts = posts.filter(
    (p) => (user?.id && p.author_id === user.id) || (user?.username && p.author === user.username)
  );

  const isUserAnonymous = user?.isAnonymous ?? true;

  const handleToggleAnonymity = () => {
    if (isUserAnonymous) {
      // Switching to Public: Check if name and custom username are set
      const hasRealName = !!(user?.fullName && user.fullName.trim());
      const hasCustomUsername = !!(user?.username && user.username.trim() && user.username !== 'Anonymous Member');

      if (!hasRealName || !hasCustomUsername) {
        setNewFullName(user?.fullName || '');
        setNewUsername(user?.username && user.username !== 'Anonymous Member' ? user.username : '');
        setSetupErrors({});
        setShowSetupModal(true);
      } else {
        toggleAnonymousMode(false);
        toast.success(`Switched to Public Brotherhood profile (u/${user.username})`);
      }
    } else {
      // Switching to Anonymous
      toggleAnonymousMode(true);
      toast.info('Ghost Shield enabled. All upcoming interactions are anonymous.');
    }
  };

  const handleSavePublicProfile = async () => {
    const errs = {};
    if (!newFullName.trim()) {
      errs.fullName = 'Full Name is required for public profile';
    }
    if (!newUsername.trim()) {
      errs.username = 'Public Username is required';
    } else if (newUsername.trim().length < 3) {
      errs.username = 'Username must be at least 3 characters';
    }

    if (Object.keys(errs).length > 0) {
      setSetupErrors(errs);
      return;
    }

    try {
      setSetupErrors({});
      setIsSavingIdentity(true);

      await setProfileIdentity(newFullName.trim(), newUsername.trim(), false);

      setIsSavingIdentity(false);
      setShowSetupModal(false);
      toast.success(`Identity updated. You are now public as u/${newUsername.trim()}!`);
    } catch (err) {
      setIsSavingIdentity(false);
      toast.error(err.message || 'Failed to update public profile');
    }
  };

  const renderHeader = () => (
    <View style={{ backgroundColor: colors.background }}>
      {/* Cover Banner */}
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
            <Avatar type={user?.avatar || 'anonymous'} size={68} />
          </View>
        </View>

        {/* Username, Handle and Status Indicator */}
        <View style={{ marginTop: 6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={[styles.username, { color: colors.textPrimary, fontFamily: typography.fontFamily.header }]}>
              {user?.username || 'Anonymous Member'}
            </Text>
            <View style={[styles.roleBadge, { backgroundColor: colors.yellowMuted, borderColor: colors.accent }]}>
              <Text style={[styles.roleBadgeText, { color: colors.accent, fontFamily: typography.fontFamily.header }]}>
                YOU
              </Text>
            </View>
          </View>
          
          <Text style={[styles.handleText, { color: colors.textSecondary, fontFamily: typography.fontFamily.body }]}>
            u/{(user?.username || 'anonymous').toLowerCase().replace(/[^a-z0-9]/g, '')} • {isUserAnonymous ? 'Ghost Shield Active' : 'Public Profile Active'}
          </Text>
        </View>

        {/* Anonymity Switch Tactical Card */}
        <View style={[styles.anonymityCard, {
          backgroundColor: isUserAnonymous ? 'rgba(255, 209, 0, 0.05)' : 'rgba(42, 157, 143, 0.08)',
          borderColor: isUserAnonymous ? 'rgba(255, 209, 0, 0.28)' : 'rgba(42, 157, 143, 0.35)',
        }]}>
          <View style={styles.anonymityLeft}>
            <View style={[styles.anonymityIconBadge, {
              backgroundColor: isUserAnonymous ? 'rgba(255, 209, 0, 0.12)' : 'rgba(42, 157, 143, 0.18)',
            }]}>
              <MaterialCommunityIcons
                name={isUserAnonymous ? 'incognito' : 'account-check'}
                size={22}
                color={isUserAnonymous ? colors.accent : '#2A9D8F'}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[styles.anonymityTitle, {
                color: isUserAnonymous ? colors.accent : '#2A9D8F',
                fontFamily: typography.fontFamily.header,
              }]}>
                {isUserAnonymous ? 'GHOST ANONYMOUS' : 'PUBLIC BROTHERHOOD'}
              </Text>
              <Text style={[styles.anonymitySub, { color: colors.textSecondary, fontFamily: typography.fontFamily.body }]}>
                {isUserAnonymous
                  ? 'Mask active • All feeds & interactions are anonymous'
                  : `Posting openly as ${user?.fullName ? `${user.fullName} (u/${user.username})` : `u/${user.username}`}`}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.switchModeBtn, {
              backgroundColor: isUserAnonymous ? colors.accent : colors.surface,
              borderColor: isUserAnonymous ? colors.accent : colors.border,
            }]}
            onPress={handleToggleAnonymity}
            activeOpacity={0.8}
          >
            <Text style={[styles.switchModeBtnText, {
              color: isUserAnonymous ? '#000000' : colors.textPrimary,
              fontFamily: typography.fontFamily.header,
            }]}>
              {isUserAnonymous ? 'GO PUBLIC' : 'GO GHOST'}
            </Text>
          </TouchableOpacity>
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
            {user?.fullName ? (
              <>Full Name: <Text style={{ fontWeight: '700' }}>{user.fullName}</Text>{"\n"}</>
            ) : null}
            Shelter Region: <Text style={{ color: colors.accent, fontWeight: '700' }}>{user?.country || 'India'} ({user?.countryCode || '+91'})</Text>{"\n"}
            Privacy Shield: <Text style={{ color: isUserAnonymous ? colors.accent : colors.success, fontWeight: '700' }}>
              {isUserAnonymous ? '100% Encrypted & Anonymous (Ghost Mode)' : 'Public Brotherhood Profile'}
            </Text>
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
            Your identity is completely protected under the Sanctity Shield. Other circle members can only see your mask avatar, custom pseudonymous name, post logs, and streak. Personally identifiable details, phone numbers, and credentials are completely isolated and encrypted.
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

      {/* Setup Public Identity Modal */}
      <Modal
        visible={showSetupModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSetupModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: 'rgba(255, 209, 0, 0.45)' }]}>
            <View style={[styles.modalIconRing, { backgroundColor: 'rgba(255, 209, 0, 0.12)', borderColor: colors.accent }]}>
              <MaterialCommunityIcons name="shield-account" size={32} color={colors.accent} />
            </View>

            <Text style={[styles.modalTitle, { color: colors.textPrimary, fontFamily: typography.fontFamily.header }]}>
              ACTIVATE PUBLIC PROFILE
            </Text>

            <Text style={[styles.modalSubtitle, { color: colors.textSecondary, fontFamily: typography.fontFamily.body }]}>
              Set your real name and public handle to reveal your brotherhood profile across feeds.
            </Text>

            <InputField
              label="FULL NAME (REAL NAME)"
              placeholder="e.g. Aashutosh Mishra"
              value={newFullName}
              onChangeText={setNewFullName}
              error={setupErrors.fullName}
              autoCapitalize="words"
              containerStyle={{ width: '100%', marginBottom: 14 }}
            />

            <InputField
              label="PUBLIC USERNAME"
              placeholder="e.g. shadow_warrior"
              value={newUsername}
              onChangeText={(t) => setNewUsername(t.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              error={setupErrors.username}
              autoCapitalize="none"
              containerStyle={{ width: '100%', marginBottom: 20 }}
            />

            <Button
              title="CONFIRM & GO PUBLIC"
              variant="primary"
              onPress={handleSavePublicProfile}
              loading={isSavingIdentity}
              style={{ width: '100%', height: 48, borderRadius: 4 }}
              textStyle={{ fontSize: 13, fontWeight: '800', letterSpacing: 1 }}
            />

            <TouchableOpacity
              onPress={() => setShowSetupModal(false)}
              style={{ marginTop: 14, padding: 8 }}
            >
              <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '700' }}>
                STAY ANONYMOUS
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
    height: 100,
  },
  customHeader: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 10,
    flexDirection: 'row',
  },
  headerCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -37,
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
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  roleBadge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  roleBadgeText: {
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  handleText: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  anonymityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  anonymityLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  anonymityIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  anonymityTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  anonymitySub: {
    fontSize: 10.5,
    lineHeight: 14,
    marginTop: 1,
  },
  switchModeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchModeBtnText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 10,
    marginTop: 10,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 390,
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 22,
    alignItems: 'center',
  },
  modalIconRing: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 1,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
    marginTop: 4,
    marginBottom: 18,
    paddingHorizontal: 8,
  },
});
