import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { useToast } from '../../context/ToastContext';
import Avatar from '../common/Avatar';
import ReplyItem from './ReplyItem';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getBadgeAndTitle } from '../../utils/constants';

export default function CommentItem({ comment, onReply }) {
  const { colors, typography, spacing } = useTheme();
  const navigation = useNavigation();
  const toast = useToast();

  const handleProfilePress = () => {
    if (!comment.author || comment.author === 'Anonymous Member') {
      toast.info('Anonymous profiles are shielded to protect privacy.');
    } else {
      navigation.navigate('OtherUserProfile', { username: comment.author, avatar: 'ninja' });
    }
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(350)}
      style={[styles.container, { borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: spacing.md }]}
    >
      <View style={{ flexDirection: 'row' }}>
        {/* Left Column: Avatar & Dynamic Connecting Line */}
        <View style={{ alignItems: 'center', width: 32 }}>
          <TouchableOpacity onPress={handleProfilePress} activeOpacity={0.7}>
            <Avatar type="anonymous" size={32} />
          </TouchableOpacity>
          {comment.replies && comment.replies.length > 0 && (
            <View style={{ flex: 1, width: 1.5, backgroundColor: colors.border, marginTop: 8, marginBottom: 4 }} />
          )}
        </View>

        {/* Right Column: Comment Info, Content & Replies */}
        <View style={{ flex: 1, marginLeft: 12 }}>
          {/* Header Info */}
          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
            <TouchableOpacity onPress={handleProfilePress} activeOpacity={0.7} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[styles.author, { color: colors.textPrimary, fontFamily: typography.fontFamily.body, fontSize: typography.sizes.sm }]}>
                {comment.author}
              </Text>
              {getBadgeAndTitle(comment.author) && (
                <View style={[styles.badgeContainer, { backgroundColor: colors.yellowMuted, borderColor: getBadgeAndTitle(comment.author).color }]}>
                  <MaterialCommunityIcons name={getBadgeAndTitle(comment.author).icon} size={9} color={getBadgeAndTitle(comment.author).color} style={{ marginRight: 2 }} />
                  <Text style={[styles.badgeTextLabel, { color: getBadgeAndTitle(comment.author).color, fontFamily: typography.fontFamily.header, fontSize: 7 }]}>
                    {getBadgeAndTitle(comment.author).title}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <Text style={[styles.time, { color: colors.textSecondary, fontFamily: typography.fontFamily.body, fontSize: typography.sizes.xs }]}>
              {comment.timestamp}
            </Text>
          </View>

          {/* Comment Content */}
          <Text style={[styles.content, {
            color: colors.textPrimary,
            fontFamily: typography.fontFamily.body,
            fontSize: typography.sizes.md,
            lineHeight: typography.lineHeights.body - 4,
            marginTop: spacing.xs,
          }]}>
            {comment.content}
          </Text>

          {/* Reply Action */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs, marginBottom: spacing.xs }}>
            <TouchableOpacity onPress={() => onReply && onReply(comment)} activeOpacity={0.7}>
              <Text style={{ color: colors.accent, fontFamily: typography.fontFamily.header, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 }}>
                REPLY
              </Text>
            </TouchableOpacity>
          </View>

          {/* Nested Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <View style={{ marginTop: spacing.xs }}>
              {comment.replies.map((reply) => (
                <ReplyItem key={reply.id} reply={reply} />
              ))}
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  author: {
    fontWeight: '600',
  },
  time: {
    marginTop: 1,
  },
  content: {
    fontWeight: '400',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 0.5,
  },
  badgeTextLabel: {
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
