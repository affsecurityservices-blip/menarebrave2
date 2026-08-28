import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../context/UserContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';
import InputField from '../../components/common/InputField';
import PostAdviceToggle from '../../components/post/PostAdviceToggle';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COMMUNITIES } from '../../utils/constants';
import Animated, { SlideInDown } from 'react-native-reanimated';

export default function CreatePostScreen({ navigation, route }) {
  const { colors, typography, spacing } = useTheme();
  const { addPost } = useUser();
  const { user } = useAuth();
  const toast = useToast();

  const { initialCategory } = route.params || {};
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState('post'); // post or advice
  const [category, setCategory] = useState(initialCategory || 'Career');
  const [isAnon, setIsAnon] = useState(user?.isAnonymous ?? true);

  useEffect(() => {
    if (route.params?.initialCategory) {
      setCategory(route.params.initialCategory);
    }
  }, [route.params?.initialCategory]);

  const handleSubmit = () => {
    if (!content.trim()) {
      toast.warning('The feed is silent. Write something first.');
      return;
    }

    addPost(content, postType, category, isAnon, user?.username);
    setContent('');
    toast.success('Post shared successfully.');
    
    if (route.params?.initialCategory) {
      navigation.setParams({ initialCategory: undefined });
    }
    
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('HomeFeed');
    }
  };

  return (
    <Animated.View entering={SlideInDown.duration(400)} style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background, padding: spacing.md }]}>
        {!route.params?.initialCategory && (
          <Text style={[styles.title, {
            color: colors.textPrimary,
            fontFamily: typography.fontFamily.header,
            fontSize: typography.sizes.xl,
            marginBottom: spacing.md,
            textTransform: 'uppercase',
          }]}>
            NEW POST
          </Text>
        )}

        {/* Post / Advice Selector */}
        <View style={{ marginBottom: spacing.md }}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary, fontFamily: typography.fontFamily.body, fontSize: typography.sizes.xs }]}>
            MODE
          </Text>
          <PostAdviceToggle value={postType} onChange={setPostType} />
        </View>

        {/* Category Tag Selector */}
        {route.params?.initialCategory ? (
          <View style={[styles.lockedCategoryBadge, { backgroundColor: colors.yellowMuted, borderColor: colors.accent, padding: spacing.md, borderRadius: spacing.borderRadius.xs, marginBottom: spacing.md }]}>
            <Text style={{ color: colors.accent, fontFamily: typography.fontFamily.header, fontSize: 12, fontWeight: '700' }}>
              POSTING IN: {route.params.initialCategory.toUpperCase()}
            </Text>
          </View>
        ) : (
          <View style={{ marginBottom: spacing.md }}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary, fontFamily: typography.fontFamily.body, fontSize: typography.sizes.xs, marginBottom: spacing.xs }]}>
              CIRCLE CATEGORY
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
              {COMMUNITIES.map((c) => {
                const isSelected = category === c.name.split(' ')[0]; // Match category prefix
                const catName = c.name.split(' ')[0];
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor: isSelected ? colors.yellowMuted : colors.surface,
                        borderColor: isSelected ? colors.accent : colors.border,
                        borderRadius: spacing.borderRadius.sm,
                        paddingHorizontal: spacing.md,
                        paddingVertical: spacing.sm,
                      }
                    ]}
                    onPress={() => setCategory(catName)}
                  >
                    <Text style={{
                      color: isSelected ? colors.accent : colors.textSecondary,
                      fontFamily: typography.fontFamily.header,
                      fontSize: 11,
                    }}>
                      {catName.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Main Text Content */}
        <InputField
          placeholder={postType === 'post' ? "Write what is heavy in your mind... Let it go." : "What guidance or solution are you searching for?"}
          value={content}
          onChangeText={setContent}
          multiline
          numberOfLines={8}
          inputStyle={{ height: 180, textAlignVertical: 'top' }}
        />

        {/* Anonymous Toggle Row */}
        <TouchableOpacity
          style={styles.anonToggle}
          onPress={() => setIsAnon(!isAnon)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name={isAnon ? 'checkbox-marked-outline' : 'checkbox-blank-outline'}
            size={22}
            color={isAnon ? colors.accent : colors.textSecondary}
          />
          <Text style={[styles.anonText, { color: colors.textPrimary, fontFamily: typography.fontFamily.body, fontSize: typography.sizes.sm, marginLeft: spacing.sm }]}>
            SHARE ANONYMOUSLY
          </Text>
        </TouchableOpacity>

        <Button
          title="SHARE POST"
          variant="primary"
          onPress={handleSubmit}
          style={{ marginTop: spacing.md }}
        />
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: 20,
  },
  title: {
    fontWeight: '900',
    letterSpacing: 1,
  },
  subtitle: {
    fontWeight: '500',
  },
  sectionLabel: {
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  categoryRow: {
    gap: 8,
  },
  categoryChip: {
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedCategoryBadge: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  anonToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  anonText: {
    fontWeight: '600',
  },
});
