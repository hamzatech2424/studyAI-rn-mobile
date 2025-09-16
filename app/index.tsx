// app/index.tsx
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemedStyles } from "../hooks/useThemedStyles";

const { width, height } = Dimensions.get('window');

export default function Index() {
  const insets = useSafeAreaInsets();
  const styles = useThemedStyles(createStyles);
  const { isDark, colors } = useColors();
  const { isSignedIn, isLoaded } = useAuth();
  const [hasNavigated, setHasNavigated] = useState(false);

  console.log(isSignedIn,"isSignedIn==>>")
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    // Wait for Clerk to load and then navigate
    if (isLoaded && !hasNavigated) {
      const timer = setTimeout(() => {
        setHasNavigated(true);
        
        if (isSignedIn) {
          router.replace("/(appStack)/homeScreen");
        } else {
          router.replace("/(authStack)/signInScreen");
        }
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [isLoaded, isSignedIn, hasNavigated]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const iconScale = scaleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.8, 1.1, 1],
  });

  return (
    <View style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <LinearGradient
        colors={isDark 
          ? [colors.background, colors.surface, colors.primaryDark] 
          : [colors.primaryColor, colors.primaryLight, colors.accent]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Background decorative elements */}
        <View style={styles.decorativeContainer}>
          <View style={[styles.circle, styles.circle1]} />
          <View style={[styles.circle, styles.circle2]} />
          <View style={[styles.circle, styles.circle3]} />
        </View>

        <View style={styles.content}>
          <Animated.View 
            style={[
              styles.iconContainer,
              {
                opacity: fadeAnim,
                transform: [
                  { scale: iconScale },
                  { rotate: rotate }
                ]
              }
            ]}
          >
            <View style={styles.iconBackground}>
              <Ionicons 
                name="library" 
                size={80} 
                color={isDark ? colors.primaryLight : '#ffffff'} 
              />
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.textContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Text style={styles.title}>StudyAI</Text>
            <Text style={styles.subtitle}>
              Your intelligent learning companion
            </Text>
          </Animated.View>
        </View>

        <Animated.View 
          style={[
            styles.loadingContainer, 
            { 
              bottom: insets.bottom + 20,
              opacity: fadeAnim
            }
          ]}
        >
          <ActivityIndicator 
            size="small" 
            color={isDark ? colors.primaryLight : '#ffffff'} 
          />
          <Text style={styles.loadingText}>
            {!isLoaded ? 'Loading...' : isSignedIn ? 'Welcome back!' : 'Getting started...'}
          </Text>
        </Animated.View>
      </LinearGradient>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  gradient: {
    flex: 1,
  },
  decorativeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  circle: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  circle1: {
    width: 200,
    height: 200,
    top: -100,
    right: -100,
  },
  circle2: {
    width: 150,
    height: 150,
    bottom: -75,
    left: -75,
  },
  circle3: {
    width: 100,
    height: 100,
    top: height * 0.3,
    right: 50,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 40,
  },
  iconBackground: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    color: '#ffffff',
    fontSize: 42,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    opacity: 0.9,
    letterSpacing: 0.5,
  },
  loadingContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    marginLeft: 8,
  },
});