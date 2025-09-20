import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import ConversationScreen from './conversationScreen';
import HomeScreen from './homeScreen';
import NewChatScreen from './newChatScreen';

const Stack = createStackNavigator();

export default function AppStack() {
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
                name="homeScreen" 
                component={HomeScreen}
                options={{
                    animationTypeForReplace: 'push',
                }}
            />
            <Stack.Screen 
                name="conversationScreen" 
                component={ConversationScreen}
                options={{
                    animationTypeForReplace: 'push',
                }}
            />
            <Stack.Screen 
                name="newChatScreen" 
                component={NewChatScreen}
                options={{
                    animationTypeForReplace: 'push',
                }}
            />
        </Stack.Navigator>
    );
} 