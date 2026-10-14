import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  uploadImageToImgBB,
  validateImageSecurity,
} from '../../services/imageUploadService';

export default function CreatePostScreen({ navigation, route }) {
  const { colors, typography, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const { addPost } = useUser();
  const { user } = useAuth();
  const toast = useToast();

  const { initialCategory } = route.params || {};
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState('post'); // post or advice
  const [category, setCategory] = useState(initialCategory || 'Career');
  const [isAnon, setIsAnon] = useState(user?.isAnonymous ?? true);

  // Attached Image State
  const [attachedImage, setAttachedImage] = useState(null); // { uri, url, format, width, height }
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (route.params?.initialCategory) {
      setCategory(route.params.initialCategory);
    }
  }, [route.params?.initialCategory]);

  const handlePickImage = async () => {
    if (isUploadingImage) return;

    try {
      // Launch image picker strictly limited to images
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.85,
        base64: true, // Needed for magic bytes binary inspection
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];

      // 1. Strict security inspection before upload
      validateImageSecurity(asset);

      // 2. Upload to ImgBB vault
      setIsUploadingImage(true);
      const uploadResult = await uploadImageToImgBB(asset);
      setIsUploadingImage(false);

      setAttachedImage({
        uri: asset.uri,
        url: uploadResult.url,
        format: uploadResult.format,
        width: uploadResult.width,
        height: uploadResult.height,
      });

      toast.success(`Image attached securely (${uploadResult.format})`);
    } catch (err) {
      setIsUploadingImage(false);
      toast.error(err.message || 'Failed to attach image. Only JPG and PNG allowed.');
    }
  };

  const handleRemoveImage = () => {
    setAttachedImage(null);
    toast.info('Image attachment removed.');
  };

  const handleSubmit = async () => {
    if (!content.trim() && !attachedImage) {
      toast.warning('The feed is silent. Write something or attach an image first.');
      return;
    }

    if (isUploadingImage) {
      toast.info('Please wait for the image to finish uploading.');
      return;
    }

    try {
      setIsSubmitting(true);
      await addPost(
        content.trim(),
        postType,
        category,
        isAnon,
        user?.username,
        attachedImage?.url || null
      );
      setIsSubmitting(false);

      setContent('');
      setAttachedImage(null);
      toast.success('Post shared successfully.');
      
      if (route.params?.initialCategory) {
        navigation.setParams({ initialCategory: undefined });
      }
      
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('HomeFeed');
      }
    } catch {
      setIsSubmitting(false);
      toast.error('Failed to publish post. Please try again.');
    }
  };

  return (
    <Animated.View entering={SlideInDown.duration(400)} style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Sticky Custom Header */}
      <View style={[styles.customHeader, { borderBottomColor: colors.border, paddingTop: Math.max(insets.top, 16) }]}>
        {navigation.canGoBack() ? (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
            <MaterialCommunityIcons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
        )}
        <Text style={[styles.headerTitle, { color: colors.textPrimary, fontFamily: typography.fontFamily.header }]}>
          NEW POST
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background, padding: spacing.md }]}>

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
          numberOfLines={6}
          inputStyle={{ height: 140, textAlignVertical: 'top' }}
        />

        {/* Tactical Image Attachment Section */}
        {isUploadingImage ? (
          <View style={[styles.imageUploadBox, { borderColor: colors.accent, backgroundColor: 'rgba(255, 209, 0, 0.06)' }]}>
            <ActivityIndicator size="small" color={colors.accent} style={{ marginBottom: 6 }} />
            <Text style={{ color: colors.accent, fontWeight: '800', fontSize: 12, letterSpacing: 0.5 }}>
              SECURING & UPLOADING IMAGE...
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>
              Inspecting binary signature & hosting on ImgBB vault
            </Text>
          </View>
        ) : attachedImage ? (
          <View style={[styles.imagePreviewCard, { borderColor: 'rgba(255, 209, 0, 0.35)', backgroundColor: colors.surface }]}>
            <Image
              source={{ uri: attachedImage.uri || attachedImage.url }}
              style={styles.previewImage}
              contentFit="cover"
              transition={200}
            />
            {/* Format Badge */}
            <View style={[styles.imageBadge, { backgroundColor: 'rgba(0, 0, 0, 0.8)', borderColor: colors.accent }]}>
              <MaterialCommunityIcons name="shield-check" size={13} color={colors.accent} style={{ marginRight: 4 }} />
              <Text style={[styles.imageBadgeText, { color: colors.accent }]}>
                {attachedImage.format || 'JPG'} VERIFIED
              </Text>
            </View>
            {/* Delete / Remove Button */}
            <TouchableOpacity
              style={styles.removeImageBtn}
              onPress={handleRemoveImage}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="close" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.imageAttachBtn, { borderColor: 'rgba(255, 209, 0, 0.25)', backgroundColor: 'rgba(255, 209, 0, 0.04)' }]}
            onPress={handlePickImage}
            activeOpacity={0.8}
          >
            <View style={[styles.attachIconRing, { backgroundColor: colors.yellowMuted }]}>
              <MaterialCommunityIcons name="camera-plus-outline" size={20} color={colors.accent} />
            </View>
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={[styles.attachBtnTitle, { color: colors.textPrimary, fontFamily: typography.fontFamily.header }]}>
                ATTACH IMAGE (JPG / PNG)
              </Text>
              <Text style={[styles.attachBtnSub, { color: colors.textSecondary }]}>
                JPG & PNG only • Max 5MB • Safe ImgBB vault
              </Text>
            </View>
            <MaterialCommunityIcons name="plus" size={20} color={colors.accent} />
          </TouchableOpacity>
        )}

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
          title={isUploadingImage ? "UPLOADING IMAGE..." : "SHARE POST"}
          variant="primary"
          onPress={handleSubmit}
          loading={isSubmitting || isUploadingImage}
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
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
    textAlign: 'center',
  },
  imageUploadBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  imagePreviewCard: {
    position: 'relative',
    borderRadius: 12,
    borderWidth: 1.5,
    overflow: 'hidden',
    marginBottom: 16,
  },
  previewImage: {
    width: '100%',
    height: 220,
    borderRadius: 10,
  },
  imageBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  imageBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  removeImageBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(193, 18, 31, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  imageAttachBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  attachIconRing: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachBtnTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  attachBtnSub: {
    fontSize: 10,
    marginTop: 2,
  },
});
