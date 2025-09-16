import { logOut } from '@/controllerHooks/authController';
import useAuthController from '@/controllerHooks/useAuthController';
import { errorToast } from '@/utils';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { useColors } from '../../hooks/useColors';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import CustomButton from '../components/abstract/abstractButton';

const HomeScreen = () => {
    const { signOut, userId } = useAuth();
    const insets = useSafeAreaInsets();
    const styles = useThemedStyles(createStyles);
    const { colors, isDark } = useColors();
    const { syncUserHandler } = useAuthController();
    const userData = useSelector((state: any) => state.auth.user);

    useEffect(() => {
        syncUserHandler((data: any) => {
            console.log("User Synced Successfully")
        }, (error: any) => {
            console.log("error==>>", error)
            errorToast(error)
        })
    }, [])


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

                            // Navigate to sign-in screen
                            router.replace('/(authStack)/signInScreen');
                        } catch (error) {
                            console.error('Logout error:', error);
                            Alert.alert('Error', 'Failed to logout. Please try again.');
                        }
                    },
                },
            ]
        );
    };


    return (
        <View style={styles.container}>
            <StatusBar style={isDark ? "light" : "dark"} />
            <LinearGradient
                colors={isDark
                    ? [colors.background, colors.surface]
                    : [colors.surface, colors.background]
                }
                style={styles.gradient}
            >
                <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
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
                </View>

                <View style={styles.content}>
                    <View style={styles.welcomeContainer}>
                        <Ionicons
                            name="checkmark-circle"
                            size={80}
                            color={colors.success}
                        />
                        <Text style={styles.welcomeTitle}>Welcome to StudyAI!</Text>
                        <Text style={styles.welcomeSubtitle}>
                            You have successfully signed in and verified your email.
                        </Text>
                    </View>

                    {/* Token Information */}
                    <View style={styles.infoContainer}>
                        <Text style={styles.infoTitle}>Session Information</Text>

                        <View style={styles.infoItem}>
                            <Ionicons name="person-outline" size={20} color={colors.primaryColor} />
                            <Text style={styles.infoText}>User ID: {userId || 'Loading...'}</Text>
                        </View>
                    </View>


                </View>
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
    header: {
        paddingHorizontal: 24,
        paddingBottom: 20,
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
});

export default HomeScreen;