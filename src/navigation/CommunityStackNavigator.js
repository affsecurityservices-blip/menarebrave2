import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CommunityListScreen from '../screens/Community/CommunityListScreen';
import CommunityDetailScreen from '../screens/Community/CommunityDetailScreen';
import ThreadDetailScreen from '../screens/Community/ThreadDetailScreen';
import CreateCommunityScreen from '../screens/Community/CreateCommunityScreen';
import OtherUserProfileScreen from '../screens/Profile/OtherUserProfileScreen';
import PostDetailScreen from '../screens/Feed/PostDetailScreen';
import CreatePostScreen from '../screens/Feed/CreatePostScreen';
import { useTheme } from '../context/ThemeContext';

const Stack = createNativeStackNavigator();

export default function CommunityStackNavigator() {
  const { colors, typography } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        animation: 'slide_from_right',
        animationDuration: 300,
        gestureEnabled: true,
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: {
          fontFamily: typography.fontFamily.header,
          fontWeight: typography.weights.bold,
          textTransform: 'uppercase',
          letterSpacing: 1,
        },
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen
        name="CommunityList"
        component={CommunityListScreen}
        options={{ title: 'COMMUNITIES' }}
      />
      <Stack.Screen
        name="CommunityDetail"
        component={CommunityDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ThreadDetail"
        component={ThreadDetailScreen}
        options={{ title: 'THREAD' }}
      />
      <Stack.Screen
        name="CreateCommunity"
        component={CreateCommunityScreen}
        options={{ title: 'NEW INITIATIVE' }}
      />
      <Stack.Screen
        name="OtherUserProfile"
        component={OtherUserProfileScreen}
        options={{ title: 'CONTRIBUTOR' }}
      />
      <Stack.Screen
        name="PostDetail"
        component={PostDetailScreen}
        options={{ title: 'CONVERSATION' }}
      />
      <Stack.Screen
        name="CreatePost"
        component={CreatePostScreen}
        options={{ 
          title: 'NEW POST',
          animation: 'slide_from_bottom'
        }}
      />
    </Stack.Navigator>
  );
}
