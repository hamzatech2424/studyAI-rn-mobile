import { store } from '@/store/index';
import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";
import { Provider } from 'react-redux';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};


export default function RootLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const [fontsLoaded] = useFonts({
    'Poppins': require('../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
    'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
    'Poppins-Light': require('../assets/fonts/Poppins-Light.ttf'),
    'Poppins-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
  });

  const toastConfig = {
    success: (props: any) => (
      <BaseToast
        {...props}
        style={{ borderLeftColor: "#00738A", backgroundColor: "white" }}
        contentContainerStyle={{ paddingHorizontal: 10 }}
        text1Style={{
          fontSize: 14,
          fontWeight: "400",
          fontFamily: 'Poppins-Regular',
        }}
      />
    ),
    error: (props: any) => (
      <ErrorToast
        {...props}
        style={{ borderLeftColor: "red", backgroundColor: "white" }}
        contentContainerStyle={{ paddingHorizontal: 10 }}
        text1Style={{
          fontSize: 14,
          fontWeight: "400",
          fontFamily: 'Poppins-Medium',
        }}
      />
    ),
  };

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
      tokenCache={tokenCache}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Provider store={store}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
          initialRouteName="index"
        >

          <Stack.Screen
            name="index"
            options={{
              title: "Splash",
              animation: "fade",
            }}
          />
          <Stack.Screen
            name="(authStack)"
            options={{
              title: 'Auth',
              animation: 'slide_from_right'
            }}
          />

          <Stack.Screen
            name="(appStack)"
            options={{
              title: 'App',
              animation: 'slide_from_right'
            }}
          />

        </Stack>
        </Provider>
        <Toast
          visibilityTime={2000}
          autoHide
          config={toastConfig}
          topOffset={insets.top}
        />
      </ThemeProvider>
    </ClerkProvider>
  );
}
