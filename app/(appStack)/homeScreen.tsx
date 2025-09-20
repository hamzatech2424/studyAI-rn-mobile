import { logOut } from '@/controllerHooks/authController';
import useAuthController from '@/controllerHooks/useAuthController';
import useConversationController from '@/controllerHooks/useConversationController';
import { TOKEN_KEY } from '@/services/apiClient';
import { errorToast } from '@/utils';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { MotiView } from "moti";
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { useColors } from '../../hooks/useColors';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import CustomButton from '../components/abstract/abstractButton';
import AbstractContentContainer from '../components/abstract/abstractContentContainer';
import ConversationItem from '../components/module/conversationItem';


const HomeScreen = () => {
    const { signOut, userId } = useAuth();
    const insets = useSafeAreaInsets();
    const styles = useThemedStyles(createStyles);
    const { colors, isDark } = useColors();
    const { syncUserHandler } = useAuthController();
    const { getConversationsHandler } = useConversationController();
    const [initialLoading, setInitialLoading] = useState(true)
    const userData = useSelector((state: any) => state.auth.user);
    const conversations = useSelector((state: any) => state.conversation.conversations);
    const [refreshing, setRefreshing] = useState(false)
    const navigation = useNavigation();
    const isFocused = useIsFocused();



    useEffect(() => {
        if (isFocused) {
            syncUserHandler((data: any) => {
                console.log("User Synced Successfully")
                getConversationsHandler((data: any) => {
                    console.log("Conversations Fetched Successfully", data)
                    setInitialLoading(false)
                },
                    (error: any) => {
                        setInitialLoading(false)
                        errorToast(error)
                    }
                )
            }, (error: any) => {
                errorToast(error)
            })
        }
    }, [isFocused])


    const handleLogout = async () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Sign out from Clerk
                            await signOut();
                            await logOut();
                            await AsyncStorage.removeItem(TOKEN_KEY);

                            // Navigate to sign-in screen
                            navigation.navigate('authStack', { screen: 'signInScreen' })
                        } catch (error) {
                            console.log('Logout error:', error);
                            Alert.alert('Error', 'Failed to logout. Please try again.');
                        }
                    },
                },
            ]
        );
    };

    const handleRefresh = () => {
        setRefreshing(true)
        getConversationsHandler(() => {
            console.log("Conversations Refreshed Successfully")
            setRefreshing(false)
        }, (error: any) => {
            errorToast(error)
            setRefreshing(false)
        })
    }

    return (
        <View style={styles.container}>
            <StatusBar style={isDark ? "light" : "dark"} />
            <LinearGradient
                colors={isDark
                    ? [colors.background, colors.background]
                    : [colors.surface, colors.background]
                }
                style={styles.gradient}
            >
                <AbstractContentContainer style={{ flex: 1 }}>
                    <View style={{ height: insets.top }} />
                    <View style={styles.headerContent}>
                        <View style={styles.logoContainer}>
                            <View style={styles.logoBackground}>
                                <Ionicons
                                    name="library"
                                    size={24}
                                    color={colors.primaryColor}
                                />
                            </View>
                            <Text style={styles.logoText}>StudyAI</Text>
                        </View>

                        <CustomButton
                            title="Logout"
                            variant="outline"
                            size="small"
                            onPress={handleLogout}
                            icon={
                                <Ionicons
                                    name="log-out-outline"
                                    size={16}
                                    color={colors.primaryColor}
                                    style={{ marginRight: 6 }}
                                />
                            }
                        />
                    </View>

                    {initialLoading ?
                        <ScrollView>
                            {[1, 2, 3, 4, 5, 6, 7].map((item, index) => {
                                return (
                                    <MotiView
                                        key={item}
                                        from={{ opacity: 0.1 }}
                                        animate={{ opacity: 0.5 }}
                                        transition={{
                                            type: "spring",
                                            duration: 1000,
                                            loop: true,
                                            repeatReverse: true,
                                        }}
                                        style={{
                                            width: "99%",
                                            height: 90,
                                            alignSelf: 'center',
                                            borderRadius: 16,
                                            marginTop: 20,
                                            backgroundColor: "lightgrey",
                                        }}
                                    />
                                )
                            })}
                        </ScrollView>
                        :
                        <FlatList
                            data={conversations}
                            contentContainerStyle={{ flex: 1 }}
                            keyExtractor={(item) => item?.id}
                            renderItem={({ item }) => <ConversationItem
                                item={item}
                                onPress={() => {
                                    navigation.navigate('conversationScreen', { chatId: item?.id })
                                }}
                            />}
                            showsVerticalScrollIndicator={false}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={handleRefresh}
                                    tintColor={"#6366f1"}
                                    title="Pull to refresh"
                                    titleColor={"#6366f1"}
                                />
                            }
                            ListEmptyComponent={
                                <MotiView
                                    from={{ opacity: 0, translateY: 30 }}
                                    animate={{ opacity: 1, translateY: 0 }}
                                    transition={{
                                        type: "spring",
                                        duration: 600,
                                    }}
                                    style={styles.emptyContainer}
                                >
                                    {/* Empty State Icon */}
                                    <MotiView
                                        from={{ scale: 0.8 }}
                                        animate={{ scale: 1 }}
                                        transition={{
                                            type: "spring",
                                            duration: 800,
                                            delay: 200,
                                        }}
                                        style={styles.emptyIconContainer}
                                    >
                                        <LinearGradient
                                            colors={isDark
                                                ? ['#4A5568', '#2D3748', '#4A5568']
                                                : ['#E2E8F0', '#CBD5E0', '#E2E8F0']
                                            }
                                            style={styles.emptyIconGradient}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                        >
                                            <Ionicons
                                                name="chatbubbles-outline"
                                                size={48}
                                                color={colors.primaryColor}
                                            />
                                        </LinearGradient>
                                    </MotiView>

                                    {/* Empty State Content */}
                                    <View style={styles.emptyContent}>
                                        <Text style={[styles.emptyTitle, { color: colors.text }]}>
                                            No Conversations Yet
                                        </Text>
                                        <Text style={[styles.emptySubtitle, { color: colors.placeholder }]}>
                                            Start your first AI conversation by uploading a PDF document
                                        </Text>
                                    </View>

                                    {/* Action Buttons */}
                                    <View style={styles.emptyActions}>
                                        <CustomButton
                                            title="Start New Chat"
                                            onPress={() => navigation.navigate('newChatScreen')}
                                            style={{ width: 200 }}
                                            icon={
                                                <Ionicons
                                                    name="add-circle-outline"
                                                    size={18}
                                                    color="white"
                                                    style={{ marginRight: 8 }}
                                                />
                                            }
                                        />
                                        <View style={{ height: 16 }} />
                                        <CustomButton
                                            title="Refresh"
                                            variant="outline"
                                            size="small"
                                            onPress={handleRefresh}
                                            style={{ width: 200 }}
                                            icon={
                                                <Ionicons
                                                    name="refresh-outline"
                                                    size={16}
                                                    color={colors.primaryColor}
                                                    style={{ marginRight: 6 }}
                                                />
                                            }
                                        />
                                    </View>

                                    {/* Feature Highlights */}
                                    <View style={styles.featureHighlights}>
                                        <View style={styles.featureItem}>
                                            <View style={[styles.featureIcon, { backgroundColor: colors.secondaryColor }]}>
                                                <Ionicons
                                                    name="document-text"
                                                    size={16}
                                                    color={colors.primaryColor}
                                                />
                                            </View>
                                            <Text style={[styles.featureText, { color: colors.text }]}>
                                                Upload PDF documents
                                            </Text>
                                        </View>

                                        <View style={styles.featureItem}>
                                            <View style={[styles.featureIcon, { backgroundColor: colors.secondaryColor }]}>
                                                <Ionicons
                                                    name="chatbubble-ellipses"
                                                    size={16}
                                                    color={colors.primaryColor}
                                                />
                                            </View>
                                            <Text style={[styles.featureText, { color: colors.text }]}>
                                                Ask questions about content
                                            </Text>
                                        </View>

                                        <View style={styles.featureItem}>
                                            <View style={[styles.featureIcon, { backgroundColor: colors.secondaryColor }]}>
                                                <Ionicons
                                                    name="bulb"
                                                    size={16}
                                                    color={colors.primaryColor}
                                                />
                                            </View>
                                            <Text style={[styles.featureText, { color: colors.text }]}>
                                                Get intelligent insights
                                            </Text>
                                        </View>
                                    </View>
                                </MotiView>
                            }
                        />
                    }

                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => navigation.navigate('newChatScreen')}
                        style={{ width: 55, height: 55, backgroundColor: colors.primaryColor, borderRadius: 20, alignItems: "center", justifyContent: "center", position: "absolute", bottom: 30, right: 0 }}>
                        <Ionicons
                            name="add"
                            size={24}
                            color={colors.background}
                        />
                    </TouchableOpacity>

                </AbstractContentContainer>
            </LinearGradient>
        </View>
    );
};

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    gradient: {
        flex: 1,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoBackground: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.secondaryColor,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        shadowColor: colors.shadow,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    logoText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
        fontFamily: 'Poppins-Bold',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
    },
    welcomeContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    welcomeTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.text,
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 12,
        fontFamily: 'Poppins-Bold',
    },
    welcomeSubtitle: {
        fontSize: 16,
        color: colors.text,
        textAlign: 'center',
        opacity: 0.7,
        fontFamily: 'Poppins-Regular',
        lineHeight: 22,
        paddingHorizontal: 20,
    },
    infoContainer: {
        backgroundColor: colors.cardBackground,
        borderRadius: 16,
        padding: 24,
        marginBottom: 16,
        shadowColor: colors.shadow,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 16,
        fontFamily: 'Poppins-SemiBold',
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    infoText: {
        fontSize: 14,
        color: colors.text,
        marginLeft: 12,
        fontFamily: 'Poppins-Regular',
    },
    tokenButton: {
        marginTop: 12,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingVertical: 60,
    },
    emptyIconContainer: {
        marginBottom: 32,
    },
    emptyIconGradient: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.shadow,
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
    },
    emptyContent: {
        alignItems: 'center',
        marginBottom: 32,
    },
    emptyTitle: {
        fontSize: 22,
        fontFamily: 'Poppins-SemiBold',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        textAlign: 'center',
        lineHeight: 22,
        opacity: 0.8,
    },
    emptyActions: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 40,
    },
    featureHighlights: {
        width: '100%',
        alignItems: 'center',
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 20,
    },
    featureIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    featureText: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        flex: 1,
    },
});

export default HomeScreen;