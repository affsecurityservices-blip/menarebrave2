import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import PostCard from '../../components/post/PostCard';
import EmptyState from '../../components/common/EmptyState';

export default function MyPostsScreen({ navigation }) {
  const { colors, spacing } = useTheme();
  const { posts, toggleLikePost, toggleSavePost } = useUser();
  const { user } = useAuth();
  const toast = useToast();

  // Filter posts created by the user (matches author_id = user.id or user's username)
  const myPosts = posts.filter(
    (post) => (user?.id && post.author_id === user.id) || (user?.username && post.author === user.username)
  );

  const renderPost = ({ item }) => (
    <PostCard
      post={item}
      onLike={() => toggleLikePost(item.id)}
      onSave={() => toggleSavePost(item.id)}
      onCommentPress={() => navigation.navigate('PostDetail', { postId: item.id })}
      onReportPress={() => toast.success('Post reported.')}
      onCardPress={() => navigation.navigate('PostDetail', { postId: item.id })}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={myPosts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        contentContainerStyle={{ padding: spacing.md }}
        ListEmptyComponent={
          <EmptyState
            icon="post-outline"
            title="My Logs Empty"
            message="Logs you broadcast to the feed will be listed here."
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
});
