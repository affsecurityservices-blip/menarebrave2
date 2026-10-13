import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function PostActions({
  likesCount,
  commentsCount,
  isLiked,
  isSaved,
  onLike,
  onComment,
  onSave,
  onReport,
}) {
  const { colors, typography } = useTheme();

  return (
    <View style={[styles.container, { borderTopColor: 'rgba(255, 255, 255, 0.06)' }]}>
      <View style={styles.leftGroup}>
        <TouchableOpacity style={styles.actionBtn} onPress={onLike} activeOpacity={0.7}>
          <MaterialCommunityIcons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={18}
            color={isLiked ? colors.danger : colors.textSecondary}
          />
          <Text style={[styles.actionText, { color: isLiked ? colors.danger : colors.textSecondary, fontFamily: typography.fontFamily.body }]}>
            {likesCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={onComment} activeOpacity={0.7}>
          <MaterialCommunityIcons name="comment-text-outline" size={18} color={colors.textSecondary} />
          <Text style={[styles.actionText, { color: colors.textSecondary, fontFamily: typography.fontFamily.body }]}>
            {commentsCount}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.rightGroup}>
        <TouchableOpacity style={styles.iconBtn} onPress={onSave} activeOpacity={0.7}>
          <MaterialCommunityIcons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={18}
            color={isSaved ? colors.accent : colors.textSecondary}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconBtn} onPress={onReport} activeOpacity={0.7}>
          <MaterialCommunityIcons name="alert-octagon-outline" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    marginTop: 8,
    paddingTop: 6,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  iconBtn: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  actionText: {
    marginLeft: 5,
    fontSize: 12,
    fontWeight: '700',
  },
});
