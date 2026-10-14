import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../services/supabaseClient';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { user, setUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [savedPostIds, setSavedPostIds] = useState([]);
  const [joinedCommunityIds, setJoinedCommunityIds] = useState(['career', 'fatherhood']);
  const [moodHistory, setMoodHistory] = useState([]);
  const [streakCount, setStreakCount] = useState(3);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [hasCompletedResolveToday, setHasCompletedResolveToday] = useState(false);

  const fetchPosts = async () => {
    try {
      const { data: dbPosts, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (dbPosts) {
        let likedPostIds = [];
        let savedIds = [];
        
        if (user) {
          const { data: likes } = await supabase
            .from('post_likes')
            .select('post_id')
            .eq('profile_id', user.id);
            
          const { data: saves } = await supabase
            .from('saved_posts')
            .select('post_id')
            .eq('profile_id', user.id);
            
          if (likes) likedPostIds = likes.map(l => l.post_id);
          if (saves) savedIds = saves.map(s => s.post_id);
          setSavedPostIds(savedIds);
        }

        const formatted = dbPosts.map(post => {
          const minutesAgo = Math.floor((Date.now() - new Date(post.created_at).getTime()) / 60000);
          let timestampStr = 'Just now';
          if (minutesAgo >= 60 * 24) {
            const days = Math.floor(minutesAgo / (60 * 24));
            timestampStr = `${days} day${days > 1 ? 's' : ''} ago`;
          } else if (minutesAgo >= 60) {
            const hours = Math.floor(minutesAgo / 60);
            timestampStr = `${hours} hour${hours > 1 ? 's' : ''} ago`;
          } else if (minutesAgo > 0) {
            timestampStr = `${minutesAgo} minute${minutesAgo > 1 ? 's' : ''} ago`;
          }

          return {
            id: post.id,
            author_id: post.author_id,
            is_anonymous: !!post.is_anonymous,
            author: post.is_anonymous ? 'Anonymous Member' : post.author_name,
            avatar: post.is_anonymous ? 'anonymous' : post.avatar,
            content: post.content,
            image_url: post.image_url || null,
            type: post.type,
            commentsCount: post.comments_count || 0,
            likesCount: post.likes_count || 0,
            isLiked: likedPostIds.includes(post.id),
            isSaved: savedIds.includes(post.id),
            timestamp: timestampStr,
            category: post.category || 'General',
          };
        });
        setPosts(formatted);
      }
    } catch (e) {
      console.log('Error fetching posts:', e);
    }
  };

  const fetchUserStats = async () => {
    if (!user) return;
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (profile) {
        setStreakCount(profile.streak_count);
        setHasCheckedInToday(profile.has_checked_in_today);
        setHasCompletedResolveToday(profile.has_completed_resolve_today);
        
        setUser(prev => prev ? {
          ...prev,
          streakCount: profile.streak_count,
          hasCheckedInToday: profile.has_checked_in_today,
          hasCompletedResolveToday: profile.has_completed_resolve_today,
        } : null);
      }

      const { data: moods } = await supabase
        .from('mood_history')
        .select('*')
        .eq('profile_id', user.id)
        .order('date', { ascending: false });

      if (moods) {
        setMoodHistory(moods.map(m => ({
          date: m.date,
          mood: m.mood,
          label: m.label,
        })));
      }
    } catch (e) {
      console.log('Error fetching user stats:', e);
    }
  };

  useEffect(() => {
    fetchPosts();
    if (user) {
      fetchUserStats();
    } else {
      setMoodHistory([]);
      setSavedPostIds([]);
      setStreakCount(3);
      setHasCheckedInToday(false);
      setHasCompletedResolveToday(false);
    }
  }, [user?.id]);

  const addPost = async (content, type, category, isAnonymous, authorName, imageUrl = null) => {
    if (!user) return;
    try {
      const isAnon = isAnonymous !== undefined ? isAnonymous : (user.isAnonymous ?? true);
      const newPost = {
        author_id: user.id,
        author_name: isAnon ? 'Anonymous Brother' : (authorName || user.username || 'Brother'),
        avatar: isAnon ? 'anonymous' : (user.avatar || 'batman'),
        content,
        image_url: imageUrl || null,
        type,
        category,
        is_anonymous: isAnon,
      };

      const { data, error } = await supabase
        .from('posts')
        .insert([newPost])
        .select()
        .single();

      if (error) throw error;
      await fetchPosts();
      return { success: true, data };
    } catch (e) {
      console.log('Error adding post:', e);
      throw e;
    }
  };

  const toggleLikePost = async (postId) => {
    if (!user) return;
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      const isCurrentlyLiked = post.isLiked;
      const nextLikedState = !isCurrentlyLiked;
      const newLikesCount = post.likesCount + (nextLikedState ? 1 : -1);

      setPosts(prev => prev.map(p => p.id === postId ? { ...p, isLiked: nextLikedState, likesCount: newLikesCount } : p));

      if (isCurrentlyLiked) {
        await supabase.from('post_likes').delete().eq('profile_id', user.id).eq('post_id', postId);
      } else {
        await supabase.from('post_likes').insert([{ profile_id: user.id, post_id: postId }]);
      }

      await supabase.from('posts').update({ likes_count: newLikesCount }).eq('id', postId);
    } catch (e) {
      console.log('Error liking post:', e);
    }
  };

  const toggleSavePost = async (postId) => {
    if (!user) return;
    try {
      const isSaved = savedPostIds.includes(postId);
      const nextSavedState = !isSaved;

      setSavedPostIds(prev => nextSavedState ? [...prev, postId] : prev.filter(id => id !== postId));
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, isSaved: nextSavedState } : p));

      if (isSaved) {
        await supabase.from('saved_posts').delete().eq('profile_id', user.id).eq('post_id', postId);
      } else {
        await supabase.from('saved_posts').insert([{ profile_id: user.id, post_id: postId }]);
      }
    } catch (e) {
      console.log('Error saving post:', e);
    }
  };

  const checkInMood = async (moodKey, label) => {
    if (!user) return;
    try {
      const todayStr = new Date().toISOString().split('T')[0];

      await supabase.from('mood_history').upsert({
        profile_id: user.id,
        date: todayStr,
        mood: moodKey,
        label,
      });

      const updates = {
        has_checked_in_today: true,
        last_checkin_date: todayStr,
      };

      let updatedStreak = streakCount;
      if (!hasCheckedInToday) {
        updatedStreak = streakCount + 1;
        updates.streak_count = updatedStreak;
      }

      await supabase.from('profiles').update(updates).eq('id', user.id);

      setMoodHistory(prev => [
        { date: todayStr, mood: moodKey, label },
        ...prev.filter(m => m.date !== todayStr),
      ]);
      
      if (!hasCheckedInToday) {
        setStreakCount(updatedStreak);
        setHasCheckedInToday(true);
        
        setUser(prev => prev ? {
          ...prev,
          streakCount: updatedStreak,
          hasCheckedInToday: true,
        } : null);
      }
    } catch (e) {
      console.log('Error in check-in mood:', e);
    }
  };

  const completeResolve = async () => {
    if (!user || hasCompletedResolveToday) return;
    try {
      const updatedStreak = streakCount + 1;

      await supabase.from('profiles').update({
        has_completed_resolve_today: true,
        streak_count: updatedStreak,
      }).eq('id', user.id);

      setHasCompletedResolveToday(true);
      setStreakCount(updatedStreak);

      setUser(prev => prev ? {
        ...prev,
        streakCount: updatedStreak,
        hasCompletedResolveToday: true,
      } : null);
    } catch (e) {
      console.log('Error completing resolve:', e);
    }
  };

  const toggleJoinCommunity = (commId) => {
    setJoinedCommunityIds((prev) => {
      if (prev.includes(commId)) {
        return prev.filter((id) => id !== commId);
      } else {
        return [...prev, commId];
      }
    });
  };

  return (
    <UserContext.Provider
      value={{
        posts,
        savedPostIds,
        joinedCommunityIds,
        moodHistory,
        streakCount,
        hasCheckedInToday,
        hasCompletedResolveToday,
        addPost,
        toggleLikePost,
        toggleSavePost,
        checkInMood,
        completeResolve,
        toggleJoinCommunity,
        fetchPosts,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

