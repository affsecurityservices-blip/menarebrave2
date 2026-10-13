import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import PostCard from '../../components/post/PostCard';
import CommentItem from '../../components/post/CommentItem';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../services/supabaseClient';

export default function PostDetailScreen({ route, navigation }) {
  const { postId } = route.params || {};
  const { colors, typography, spacing } = useTheme();
  const { posts, toggleLikePost, toggleSavePost, fetchPosts } = useUser();
  const { user } = useAuth();
  const toast = useToast();

  const post = posts.find((p) => p.id === postId);

  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [replyToComment, setReplyToComment] = useState(null);

  const fetchComments = async () => {
    try {
      const { data: dbComments } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
        
      if (dbComments) {
        const commentIds = dbComments.map(c => c.id);
        let allReplies = [];
        if (commentIds.length > 0) {
          const { data: dbReplies } = await supabase
            .from('replies')
            .select('*')
            .in('comment_id', commentIds)
            .order('created_at', { ascending: true });
          if (dbReplies) allReplies = dbReplies;
        }

        const formattedComments = dbComments.map(c => {
          const commentReplies = allReplies
            .filter(r => r.comment_id === c.id)
            .map(r => ({
              id: r.id,
              author: r.is_anonymous ? 'Anonymous Member' : r.author_name,
              timestamp: 'Just now',
              content: r.content,
            }));

          return {
            id: c.id,
            author: c.is_anonymous ? 'Anonymous Member' : c.author_name,
            timestamp: 'Just now',
            content: c.content,
            replies: commentReplies,
          };
        });

        setComments(formattedComments);
      }
    } catch (e) {
      console.log('Error fetching comments:', e);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  if (!post) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textPrimary, fontFamily: typography.fontFamily.body }}>
          Post not found or deleted.
        </Text>
      </View>
    );
  }

  const handleAddComment = async () => {
    if (!commentText.trim() || !user) return;

    try {
      if (replyToComment) {
        const newReply = {
          comment_id: replyToComment.id,
          author_id: user.id,
          author_name: user.isAnonymous ? 'Anonymous Member' : (user.username || 'Brother'),
          content: commentText.trim(),
          is_anonymous: !!user.isAnonymous,
        };
        const { error } = await supabase.from('replies').insert([newReply]);
        if (error) throw error;
        setReplyToComment(null);
      } else {
        const newComment = {
          post_id: postId,
          author_id: user.id,
          author_name: user.isAnonymous ? 'Anonymous Member' : (user.username || 'Brother'),
          content: commentText.trim(),
          is_anonymous: !!user.isAnonymous,
        };
        const { error } = await supabase.from('comments').insert([newComment]);
        if (error) throw error;
        
        await supabase
          .from('posts')
          .update({ comments_count: (post.commentsCount || 0) + 1 })
          .eq('id', postId);
      }
      setCommentText('');
      await fetchComments();
      await fetchPosts();
    } catch (e) {
      console.log('Error adding comment:', e);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
      keyboardVerticalOffset={90}
    >
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <PostCard
          post={post}
          onLike={() => toggleLikePost(post.id)}
          onSave={() => toggleSavePost(post.id)}
          onCommentPress={() => {}}
          onReportPress={() => toast.success('Post reported.')}
        />

        <Text style={[styles.sectionTitle, {
          color: colors.textPrimary,
          fontFamily: typography.fontFamily.header,
          fontSize: typography.sizes.md,
          marginTop: spacing.md,
          marginBottom: spacing.xs,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }]}>
          Replies ({comments.length})
        </Text>

        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CommentItem
              comment={item}
              onReply={(c) => setReplyToComment(c)}
            />
          )}
          scrollEnabled={false}
        />
      </ScrollView>

      {/* Reply Banner Indicator */}
      {replyToComment && (
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: colors.surfaceLight,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}>
          <Text style={{ color: colors.textSecondary, fontFamily: typography.fontFamily.body, fontSize: 12 }}>
            Replying to <Text style={{ color: colors.accent, fontWeight: '700' }}>@{replyToComment.author}</Text>
          </Text>
          <TouchableOpacity onPress={() => setReplyToComment(null)}>
            <MaterialCommunityIcons name="close" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Comment Input Footer */}
      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border, padding: spacing.md }]}>
        <InputField
          placeholder="Offer strength or guidance..."
          value={commentText}
          onChangeText={setCommentText}
          containerStyle={{ flex: 1, marginBottom: 0 }}
        />
        <TouchableOpacity
          style={[styles.sendBtn, { backgroundColor: colors.accent, borderRadius: spacing.borderRadius.xs }]}
          onPress={handleAddComment}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="send" size={22} color={colors.background} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  sectionTitle: {
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    gap: 8,
  },
  sendBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
