import '~/global.css';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, Theme, ThemeProvider } from '@react-navigation/native';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { Platform } from 'react-native';
import { NAV_THEME } from '~/lib/constants';
import { useColorScheme } from '~/lib/useColorScheme';
import { PortalHost } from '@rn-primitives/portal';
import { ThemeToggle } from '~/components/ThemeToggle';
import { setAndroidNavigationBar } from '~/lib/android-navigation-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { supabase } from '~/lib/supabase/client';

const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: NAV_THEME.dark,
};

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

// Prevent the splash screen from auto-hiding before getting the color scheme.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { setColorScheme, isDarkColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);

  React.useEffect(() => {
    const initialize = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('theme');
        const theme = storedTheme || 'dark';
        if (Platform.OS === 'web') {
          // Adds the background color to the html element to prevent white background on overscroll.
          document.documentElement.classList.add('bg-background');
        }
        const colorTheme = theme === 'dark' ? 'dark' : 'light';
        setColorScheme(colorTheme);
        setAndroidNavigationBar(colorTheme);
        setIsColorSchemeLoaded(true);

        const { data } = await supabase.auth.getUser();
        if (data.user?.id) {
          SplashScreen.hideAsync();
          return;
        }

        console.log('Signing in anonymously...');
        const { error } = await supabase.auth.signInAnonymously();
        if (error) throw error;
        console.log('Signed in anonymously');
      } catch (error) {
        console.error('Error during initialization:', error);
      } finally {
        SplashScreen.hideAsync();
      }
    };

    initialize();
  }, []);

  if (!isColorSchemeLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
        <StatusBar style={isDarkColorScheme ? 'light' : 'dark'} />
        <Stack>
          <Stack.Screen
            name='index'
            options={{
              title: 'Home',
              headerRight: () => <ThemeToggle />,
            }}
          />
        </Stack>
        <PortalHost />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
