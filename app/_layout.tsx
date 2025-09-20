import { store } from '@/store/index';
import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider
} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";
import { Provider } from 'react-redux';
import AppStack from './(appStack)/_layout';
import AuthStack from './(authStack)/_layout';
import IndexScreen from './index';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const Stack = createStackNavigator();

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
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            gestureEnabled: true,
            gestureDirection: 'horizontal',
            cardStyleInterpolator: ({ current, layouts }) => {
              return {
                cardStyle: {
                  transform: [
                    {
                      translateX: current.progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [layouts.screen.width, 0],
                      }),
                    },
                  ],
                },
              };
            },
          }}
          initialRouteName="index"
        >
          <Stack.Screen
            name="index"
            component={IndexScreen}
            options={{
              title: "Splash",
              animationTypeForReplace: 'push',
            }}
          />
          <Stack.Screen
            name="authStack"
            component={AuthStack}
            options={{
              title: 'Auth',
              animationTypeForReplace: 'push',
            }}
          />
          <Stack.Screen
            name="appStack"
            component={AppStack}
            options={{
              title: 'App',
              animationTypeForReplace: 'push',
            }}
          />
        </Stack.Navigator>
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
