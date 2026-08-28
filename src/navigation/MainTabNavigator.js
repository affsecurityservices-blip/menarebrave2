import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

import FeedStackNavigator from './FeedStackNavigator';
import CommunityStackNavigator from './CommunityStackNavigator';
import ProfileStackNavigator from './ProfileStackNavigator';

import CreatePostScreen from '../screens/Feed/CreatePostScreen';
import ChatListScreen from '../screens/Chat/ChatListScreen';
import ChatRoomScreen from '../screens/Chat/ChatRoomScreen';
import MentorChatScreen from '../screens/Chat/MentorChatScreen';
import VoiceNoteRecorderScreen from '../screens/Chat/VoiceNoteRecorderScreen';
import NotificationsScreen from '../screens/Notifications/NotificationsScreen';

const Tab = createBottomTabNavigator();
const ChatStack = createNativeStackNavigator();

// Inner Chat Stack for navigation inside the Chat Tab
function ChatStackNavigator() {
  const { colors, typography } = useTheme();
  return (
    <ChatStack.Navigator
      screenOptions={{
        animation: 'slide_from_right',
        animationDuration: 300,
        gestureEnabled: true,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: {
          fontFamily: typography.fontFamily.header,
          fontWeight: typography.weights.bold,
          textTransform: 'uppercase',
          letterSpacing: 1,
        },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <ChatStack.Screen name="ChatList" component={ChatListScreen} options={{ title: 'CHATS' }} />
      <ChatStack.Screen name="ChatRoom" component={ChatRoomScreen} options={({ route }) => ({ title: route.params?.name || 'ROOM' })} />
      <ChatStack.Screen name="MentorChat" component={MentorChatScreen} options={{ title: '1:1 PREMIUM MENTOR' }} />
      <ChatStack.Screen name="VoiceNoteRecorder" component={VoiceNoteRecorderScreen} options={{ title: 'RECORD METAPHOR' }} />
    </ChatStack.Navigator>
  );
}

export default function MainTabNavigator() {
  const { colors, spacing } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const routeName = getFocusedRouteNameFromRoute(route);
        const mainScreens = ['HomeFeed', 'CommunityList', 'ChatList', 'Profile'];
        const isDetailScreen = routeName && !mainScreens.includes(routeName);

        return {
          tabBarHideOnKeyboard: true,
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === 'HomeTab') {
              iconName = 'shield-half-full';
            } else if (route.name === 'CommunitiesTab') {
              iconName = 'google-circles-communities';
            } else if (route.name === 'CreatePostTab') {
              iconName = 'plus';
            } else if (route.name === 'ChatTab') {
              iconName = 'comment-multiple-outline';
            } else if (route.name === 'ProfileTab') {
              iconName = 'incognito';
            }
            return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: isDetailScreen ? { display: 'none' } : {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            borderTopWidth: 1.5,
            paddingBottom: spacing.sm,
            paddingTop: spacing.xs,
            height: 60,
          },
          tabBarShowLabel: true,
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '700',
          },
          headerShown: false,
        };
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={FeedStackNavigator}
        options={{ tabBarLabel: 'FEED' }}
      />
      <Tab.Screen
        name="CommunitiesTab"
        component={CommunityStackNavigator}
        options={{ tabBarLabel: 'CIRCLES' }}
      />
      <Tab.Screen
        name="CreatePostTab"
        component={CreatePostScreen}
        options={{
          tabBarLabel: 'POST',
          tabBarLabelStyle: {
            marginTop: 0,
            fontSize: 10,
            fontWeight: '700',
          },
          tabBarIcon: ({ color }) => (
            <View style={[styles.createButton, { backgroundColor: colors.accent }]}>
              <MaterialCommunityIcons name="plus" size={24} color={colors.background} />
            </View>
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('CommunitiesTab', {
              screen: 'CreatePost',
              params: { initialCategory: undefined }
            });
          },
        })}
      />
      <Tab.Screen
        name="ChatTab"
        component={ChatStackNavigator}
        options={{ tabBarLabel: 'CHATS' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{ tabBarLabel: 'PROFILE' }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -16, // Float the button upward to avoid overlapping the 'POST' text
    shadowColor: '#FFD100',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
  },
});
