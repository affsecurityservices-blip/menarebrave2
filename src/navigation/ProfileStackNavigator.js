import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import EditProfileScreen from '../screens/Profile/EditProfileScreen';
import OtherUserProfileScreen from '../screens/Profile/OtherUserProfileScreen';
import ProfileMenuScreen from '../screens/Profile/ProfileMenuScreen';
import SavedPostsScreen from '../screens/Profile/SavedPostsScreen';
import MyPostsScreen from '../screens/Profile/MyPostsScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';
import PrivacyScreen from '../screens/Settings/PrivacyScreen';
import UpdatePasswordScreen from '../screens/Settings/UpdatePasswordScreen';
import BlockedUsersScreen from '../screens/Settings/BlockedUsersScreen';
import ReportHistoryScreen from '../screens/Settings/ReportHistoryScreen';
import ThemeScreen from '../screens/Settings/ThemeScreen';
import DailyCheckInScreen from '../screens/MoodCheckIn/DailyCheckInScreen';
import DailyStreakScreen from '../screens/MoodCheckIn/DailyStreakScreen';
import MoodHistoryScreen from '../screens/MoodCheckIn/MoodHistoryScreen';
import CrisisSupportScreen from '../screens/SafetyCrisis/CrisisSupportScreen';
import SubscriptionScreen from '../screens/Premium/SubscriptionScreen';
import PostDetailScreen from '../screens/Feed/PostDetailScreen';
import { useTheme } from '../context/ThemeContext';

const Stack = createNativeStackNavigator();

export default function ProfileStackNavigator() {
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
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'PROFILE' }} />
      <Stack.Screen name="ProfileMenu" component={ProfileMenuScreen} options={{ title: 'PROFILE OPTIONS' }} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'EDIT PROFILE' }} />
      <Stack.Screen name="OtherUserProfile" component={OtherUserProfileScreen} options={{ title: 'CONTRIBUTOR' }} />
      <Stack.Screen name="SavedPosts" component={SavedPostsScreen} options={{ title: 'BOOKMARKED' }} />
      <Stack.Screen name="MyPosts" component={MyPostsScreen} options={{ title: 'MY LOGS' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'SETTINGS' }} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} options={{ title: 'PRIVACY' }} />
      <Stack.Screen name="UpdatePassword" component={UpdatePasswordScreen} options={{ title: 'SECURITY PIN' }} />
      <Stack.Screen name="BlockedUsers" component={BlockedUsersScreen} options={{ title: 'BLOCKED USERS' }} />
      <Stack.Screen name="ReportHistory" component={ReportHistoryScreen} options={{ title: 'REPORTS' }} />
      <Stack.Screen name="Theme" component={ThemeScreen} options={{ title: 'THEME MODE' }} />
      <Stack.Screen name="DailyCheckIn" component={DailyCheckInScreen} options={{ title: 'DAILY VIBE' }} />
      <Stack.Screen name="DailyStreak" component={DailyStreakScreen} options={{ title: 'DISCIPLINE & STREAK' }} />
      <Stack.Screen name="MoodHistory" component={MoodHistoryScreen} options={{ title: 'MOOD MATRIX' }} />
      <Stack.Screen name="CrisisSupport" component={CrisisSupportScreen} options={{ title: 'CRISIS SUPPORT' }} />
      <Stack.Screen name="Subscription" component={SubscriptionScreen} options={{ title: 'GOLD MEMBER' }} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} options={{ title: 'CONVERSATION' }} />
    </Stack.Navigator>
  );
}
