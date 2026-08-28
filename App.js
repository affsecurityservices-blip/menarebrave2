import React from 'react';
import { StyleSheet, View, Platform, LogBox } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { UserProvider } from './src/context/UserContext';
import { ToastProvider } from './src/context/ToastContext';

import AuthNavigator from './src/navigation/AuthNavigator';
import MainTabNavigator from './src/navigation/MainTabNavigator';
import LoadingSpinner from './src/components/common/LoadingSpinner';

// Suppress deprecated pointerEvents prop warnings from React Navigation elements in Dev environment
LogBox.ignoreLogs([
  'pointerEvents is deprecated',
  'style.pointerEvents',
  'props.pointerEvents is deprecated'
]);

// Inject global style & Google Fonts to hide scrollbars and load premium typography on Web/Desktop
if (Platform.OS === 'web') {
  // Suppress warning logs on web console
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (
      args[0] &&
      typeof args[0] === 'string' &&
      (args[0].includes('pointerEvents is deprecated') || args[0].includes('style.pointerEvents'))
    ) {
      return;
    }
    originalWarn(...args);
  };

  // Create link tag for Google Fonts
  const fontLink = document.createElement('link');
  fontLink.rel = 'stylesheet';
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap';
  document.head.appendChild(fontLink);

  const style = document.createElement('style');
  style.textContent = `
    ::-webkit-scrollbar {
      display: none;
    }
    * {
      -ms-overflow-style: none;
      scrollbar-width: none;
      outline: none;
    }
    *:focus {
      outline: none !important;
    }
  `;
  document.head.appendChild(style);
}

function AppContent() {
  const { colors, themeMode } = useTheme();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={[styles.outerContainer, { backgroundColor: colors.background }]}>
      <View style={[styles.container, { backgroundColor: colors.background, borderColor: colors.border }]}>
        <StatusBar style={themeMode === 'batman' ? 'light' : 'auto'} />
        <NavigationContainer
          onStateChange={() => {
            if (Platform.OS === 'web' && typeof document !== 'undefined') {
              // Blur active element to prevent the browser warning
              // "Blocked aria-hidden on an element because its descendant retained focus"
              if (
                document.activeElement &&
                document.activeElement !== document.body &&
                typeof document.activeElement.blur === 'function'
              ) {
                document.activeElement.blur();
              }
            }
          }}
        >
          {user ? <MainTabNavigator /> : <AuthNavigator />}
        </NavigationContainer>
      </View>
    </View>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <UserProvider>
                <AppContent />
              </UserProvider>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    width: '100%',
  },
  container: {
    flex: 1,
    width: '100%',
    ...Platform.select({
      web: {
        maxWidth: 600,
        alignSelf: 'center',
        borderLeftWidth: 1,
        borderRightWidth: 1,
      },
      default: {},
    }),
  },
});
