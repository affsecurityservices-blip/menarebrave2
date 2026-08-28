import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { useToast } from '../../context/ToastContext';
import Avatar from '../common/Avatar';
import PostActions from './PostActions';
import ReportModal from '../common/ReportModal';
import { moderationService } from '../../services/moderationService';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getBadgeAndTitle } from '../../utils/constants';

export default function PostCard({ post, onLike, onSave, onCommentPress, onReportPress, onCardPress }) {
  const { colors, typography, spacing } = useTheme();
  const navigation = useNavigation();
  const toast = useToast();
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);

  const handleReportSubmit = async (reason, details) => {
    setIsReportModalVisible(false);
    try {
      const response = await moderationService.reportContent('post', post.id, reason);
      if (response.success) {
        toast.success(`Post reported successfully: ${reason}`);
        if (onReportPress) {
          onReportPress();
        }
      } else {
        toast.error('Failed to submit report. Please try again.');
      }
    } catch (error) {
      toast.error('Failed to submit report. Please try again.');
    }
  };

  const handleProfilePress = () => {
    if (!post.author || post.author === 'Anonymous Member' || post.avatar === 'anonymous') {
      toast.info('Anonymous profiles are shielded to protect privacy.');
    } else {
      navigation.navigate('OtherUserProfile', { username: post.author, avatar: post.avatar });
    }
  };

  return (
    <Animated.View entering={FadeInDown.duration(400)}>
      <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderRadius: spacing.borderRadius.sm,
          borderColor: post.type === 'post' ? colors.yellowMuted : colors.border,
          borderWidth: post.type === 'post' ? 1.5 : 1,
          padding: spacing.md,
          marginBottom: spacing.md,
        },
      ]}
      onPress={onCardPress}
      activeOpacity={0.9}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerLeft}
          onPress={handleProfilePress}
          activeOpacity={0.7}
        >
          <Avatar type={post.avatar} size={40} />
          <View style={styles.headerInfo}>
            <View style={styles.authorContainer}>
              <Text style={[styles.author, { color: colors.textPrimary, fontFamily: typography.fontFamily.body, fontSize: typography.sizes.md }]}>
                {post.author}
              </Text>
              {getBadgeAndTitle(post.author) && (
                <View style={[styles.badgeContainer, { backgroundColor: colors.yellowMuted, borderColor: getBadgeAndTitle(post.author).color }]}>
                  <MaterialCommunityIcons name={getBadgeAndTitle(post.author).icon} size={10} color={getBadgeAndTitle(post.author).color} style={{ marginRight: 3 }} />
                  <Text style={[styles.badgeTextLabel, { color: getBadgeAndTitle(post.author).color, fontFamily: typography.fontFamily.header, fontSize: 8 }]}>
                    {getBadgeAndTitle(post.author).title}
                  </Text>
                </View>
              )}
            </View>
            <Text style={[styles.time, { color: colors.textSecondary, fontFamily: typography.fontFamily.body, fontSize: typography.sizes.xs }]}>
              {post.timestamp}
            </Text>
          </View>
        </TouchableOpacity>
        
        {/* Type Badge (Post / Advice) */}
        <View style={[styles.badge, {
          backgroundColor: post.type === 'post' ? colors.yellowMuted : 'rgba(255, 255, 255, 0.05)',
          borderColor: post.type === 'post' ? colors.accent : colors.border,
          borderWidth: 1,
          borderRadius: spacing.borderRadius.xs - 4,
          paddingHorizontal: spacing.sm,
          paddingVertical: 2,
        }]}>
          <Text style={[styles.badgeText, {
            color: post.type === 'post' ? colors.accent : colors.textPrimary,
            fontFamily: typography.fontFamily.header,
            fontSize: 10,
            letterSpacing: 0.5,
          }]}>
            {post.type.toUpperCase()}
          </Text>
        </View>
      </View>

      <Text style={[styles.content, {
        color: colors.textPrimary,
        fontFamily: typography.fontFamily.body,
        fontSize: typography.sizes.md,
        lineHeight: typography.lineHeights.body,
        marginVertical: spacing.sm,
      }]}>
        {post.content}
      </Text>

      {post.category && (
        <View style={[styles.categoryContainer, { backgroundColor: colors.surfaceLight, borderRadius: spacing.borderRadius.xs }]}>
          <Text style={[styles.categoryText, { color: colors.textSecondary, fontSize: 11 }]}>
            # {post.category}
          </Text>
        </View>
      )}

      <PostActions
        likesCount={post.likesCount}
        commentsCount={post.commentsCount}
        isLiked={post.isLiked}
        isSaved={post.isSaved}
        onLike={onLike}
        onComment={onCommentPress}
        onSave={onSave}
        onReport={() => setIsReportModalVisible(true)}
      />
    </TouchableOpacity>

    {/* Report Modal System */}
    <ReportModal
      visible={isReportModalVisible}
      onClose={() => setIsReportModalVisible(false)}
      onSubmit={handleReportSubmit}
    />
  </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  author: {
    fontWeight: '700',
  },
  time: {
    marginTop: 2,
  },
  badge: {
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontWeight: '800',
  },
  content: {
    fontWeight: '400',
  },
  categoryContainer: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
  },
  categoryText: {
    fontWeight: '600',
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  badgeTextLabel: {
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
