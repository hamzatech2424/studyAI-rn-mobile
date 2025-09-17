import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import ConversationScreen from './conversationScreen';
import HomeScreen from './homeScreen';


const Stack = createStackNavigator();

export default function AuthStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>

            <Stack.Screen
                name="homeScreen"
                component={HomeScreen}
                options={{
                    animation: 'slide_from_right'
                }}
            />

            <Stack.Screen
                name="conversationScreen"
                component={ConversationScreen}
                options={{
                    animation: 'slide_from_right'
                }}
            />



        </Stack.Navigator>
    );
} 