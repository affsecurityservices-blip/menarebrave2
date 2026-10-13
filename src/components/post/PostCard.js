import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
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
    <Animated.View entering={FadeInDown.duration(350)}>
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: post.type === 'advice' ? 'rgba(255, 209, 0, 0.25)' : 'rgba(255, 255, 255, 0.07)',
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
            <Avatar type={post.avatar} size={34} />
            <View style={styles.headerInfo}>
              <View style={styles.authorContainer}>
                <Text style={[styles.author, { color: colors.textPrimary, fontFamily: typography.fontFamily.body }]}>
                  {post.author}
                </Text>
                {getBadgeAndTitle(post.author) && (
                  <View style={[styles.badgeContainer, { backgroundColor: colors.yellowMuted, borderColor: getBadgeAndTitle(post.author).color }]}>
                    <MaterialCommunityIcons name={getBadgeAndTitle(post.author).icon} size={9} color={getBadgeAndTitle(post.author).color} style={{ marginRight: 2 }} />
                    <Text style={[styles.badgeTextLabel, { color: getBadgeAndTitle(post.author).color, fontFamily: typography.fontFamily.header }]}>
                      {getBadgeAndTitle(post.author).title}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={[styles.time, { color: colors.textSecondary, fontFamily: typography.fontFamily.body }]}>
                {post.timestamp}
              </Text>
            </View>
          </TouchableOpacity>
          
          {/* Type Badge (Post / Advice) */}
          {post.type === 'advice' ? (
            <View style={[styles.badge, { backgroundColor: colors.yellowMuted, borderColor: colors.accent }]}>
              <MaterialCommunityIcons name="help-circle-outline" size={10} color={colors.accent} style={{ marginRight: 2 }} />
              <Text style={[styles.badgeText, { color: colors.accent, fontFamily: typography.fontFamily.header }]}>
                ADVICE
              </Text>
            </View>
          ) : (
            <View style={[styles.badge, { backgroundColor: 'rgba(255, 255, 255, 0.04)', borderColor: 'rgba(255, 255, 255, 0.08)' }]}>
              <Text style={[styles.badgeText, { color: colors.textSecondary, fontFamily: typography.fontFamily.header }]}>
                POST
              </Text>
            </View>
          )}
        </View>

        <Text style={[styles.content, {
          color: colors.textPrimary,
          fontFamily: typography.fontFamily.body,
        }]}>
          {post.content}
        </Text>

        {post.category && (
          <View style={styles.categoryContainer}>
            <Text style={[styles.categoryText, { color: colors.textSecondary }]}>
              #{post.category}
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
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
    ...Platform.select({
      web: {
        boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.2)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerInfo: {
    marginLeft: 10,
    flex: 1,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  author: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  badgeTextLabel: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  time: {
    fontSize: 11,
    marginTop: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  content: {
    fontSize: 13.5,
    lineHeight: 19.5,
    fontWeight: '400',
    marginVertical: 6,
  },
  categoryContainer: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.035)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 2,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 10.5,
    fontWeight: '600',
  },
});
