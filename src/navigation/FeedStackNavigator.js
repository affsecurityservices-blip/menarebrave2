import React from 'react';
import { TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import HomeFeedScreen from '../screens/Feed/HomeFeedScreen';
import PostDetailScreen from '../screens/Feed/PostDetailScreen';
import SearchScreen from '../screens/Feed/SearchScreen';
import OtherUserProfileScreen from '../screens/Profile/OtherUserProfileScreen';
import NotificationsScreen from '../screens/Notifications/NotificationsScreen';
import { useTheme } from '../context/ThemeContext';

const Stack = createNativeStackNavigator();

export default function FeedStackNavigator() {
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
        name="HomeFeed"
        component={HomeFeedScreen}
        options={({ navigation }) => ({
          title: 'FEED',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate('Search')}
              style={{ marginRight: 8 }}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="magnify" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="PostDetail"
        component={PostDetailScreen}
        options={{ title: 'CONVERSATION' }}
      />
      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={{ title: 'SEARCH' }}
      />
      <Stack.Screen
        name="OtherUserProfile"
        component={OtherUserProfileScreen}
        options={{ title: 'CONTRIBUTOR' }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: 'NOTIFICATIONS' }}
      />
    </Stack.Navigator>
  );
}
