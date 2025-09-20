import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import ForgotPasswordScreen from './forgotPasswordScreen';
import ResetPasswordScreen from './resetPasswordScreen';
import SignInScreen from './signInScreen';
import SignUpScreen from './signUpScreen';
import VerificationScreen from './verificationScreen';

const Stack = createStackNavigator();

export default function AuthStack() {
    return (
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
        >
            <Stack.Screen 
                name="signInScreen" 
                component={SignInScreen}
                options={{
                    animationTypeForReplace: 'push',
                }}
            />
            <Stack.Screen 
                name="signUpScreen" 
                component={SignUpScreen}
                options={{
                    animationTypeForReplace: 'push',
                }}
            />
            <Stack.Screen 
                name="verificationScreen" 
                component={VerificationScreen}
                options={{
                    animationTypeForReplace: 'push',
                }}
            />
            <Stack.Screen 
                name="forgotPasswordScreen" 
                component={ForgotPasswordScreen}
                options={{
                    animationTypeForReplace: 'push',
                }}
            />
         
            <Stack.Screen 
                name="resetPasswordScreen" 
                component={ResetPasswordScreen}
                options={{
                    animationTypeForReplace: 'push',
                }}
            />
        </Stack.Navigator>
    );
} 