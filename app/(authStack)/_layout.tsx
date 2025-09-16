import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import SignInScreen from './signInScreen';
import SignUpScreen from './signUpScreen';
import VerificationScreen from './verificationScreen';


const Stack = createStackNavigator();

export default function AuthStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>

            <Stack.Screen
                name="signInScreen"
                component={SignInScreen}
                options={{
                    animation: 'slide_from_right'
                }}
            />

            <Stack.Screen
                name="signUpScreen"
                component={SignUpScreen}
                options={{
                    animation: 'slide_from_right'
                }}
            />

            <Stack.Screen
                name="verificationScreen"
                component={VerificationScreen}
                options={{
                    animation: 'slide_from_right'
                }}
            />

        </Stack.Navigator>
    );
} 