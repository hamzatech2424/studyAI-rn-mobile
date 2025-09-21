import useAuthController from '@/controllerHooks/useAuthController';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { MotiView } from 'moti';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { useColors } from '../../hooks/useColors';
import { useThemedStyles } from '../../hooks/useThemedStyles';

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
    const { colors, isDark } = useColors();
    const styles = useThemedStyles(createStyles);
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const { user } = useAuth();
    const { syncUserHandler } = useAuthController();
    const userData = useSelector((state: any) => state.auth.user);
    const [loading, setLoading] = useState(true);
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(50));

    useEffect(() => {
        // Sync user data when screen loads
        syncUserHandler(
            (data: any) => {
                setLoading(false);
                // Start animations
                Animated.parallel([
                    Animated.timing(fadeAnim, {
                        toValue: 1,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                    Animated.timing(slideAnim, {
                        toValue: 0,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                ]).start();
            },
            (error: any) => {
                setLoading(false);
                console.error('Error syncing user:', error);
            }
        );
    }, []);

    const getInitials = () => {
        if (userData?.first_name && userData?.last_name) {
            return `${userData.first_name[0]}${userData.last_name[0]}`.toUpperCase();
        }
        return userData?.email?.[0]?.toUpperCase() || 'U';
    };

    const getFullName = () => {
        if (userData?.first_name && userData?.last_name) {
            return `${userData.first_name} ${userData.last_name}`;
        }
        return userData?.email || 'User';
    };

    const profileItems = [
        {
            icon: 'person-outline',
            label: 'Full Name',
            value: getFullName(),
            color: colors.primaryColor,
        },
        {
            icon: 'mail-outline',
            label: 'Email',
            value: userData?.email || user?.emailAddresses?.[0]?.emailAddress || 'N/A',
            color: colors.accent,
        },
        {
            icon: 'calendar-outline',
            label: 'Member Since',
            value: userData?.created_at ? new Date(userData.created_at).toLocaleDateString() : 'N/A',
            color: colors.success,
        }
    ];


    const handleEditProfile = () => {
        Alert.alert(
            'Edit Profile',
            'Profile editing functionality will be implemented soon!',
            [{ text: 'OK' }]
        );
    };

    const handleBack = () => {
        navigation.goBack();
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <StatusBar style={isDark ? "light" : "dark"} />
                <LinearGradient
                    colors={isDark
                        ? [colors.background, colors.surface, colors.primaryDark]
                        : [colors.primaryColor, colors.primaryLight, colors.accent]
                    }
                    style={styles.gradient}
                >
                    <View style={styles.loadingContainer}>
                        <MotiView
                            from={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{
                                type: 'spring',
                                duration: 1000,
                                loop: true,
                                repeatReverse: true,
                            }}
                            style={styles.loadingIcon}
                        >
                            <Ionicons name="person" size={60} color="white" />
                        </MotiView>
                        <Text style={styles.loadingText}>Loading Profile...</Text>
                    </View>
                </LinearGradient>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar style={isDark ? "light" : "dark"} />
            <LinearGradient
                colors={isDark
                    ? [colors.background, colors.surface, colors.primaryDark]
                    : [colors.primaryColor, colors.primaryLight, colors.accent]
                }
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                {/* Header */}
                <Animated.View
                    style={[
                        styles.header,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    <TouchableOpacity
                        onPress={handleBack}
                        style={styles.backButton}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Profile</Text>
                    <View style={styles.editButton}
                    >
                    </View>
                </Animated.View>

                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Profile Header Card */}
                    <MotiView
                        from={{ opacity: 0, translateY: 30 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{
                            type: 'spring',
                            duration: 800,
                            delay: 200,
                        }}
                        style={styles.profileCard}
                    >
                        <LinearGradient
                            colors={isDark
                                ? ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']
                                : ['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']
                            }
                            style={styles.profileCardGradient}
                        >
                            {/* Avatar */}
                            <MotiView
                                from={{ scale: 0, rotate: '0deg' }}
                                animate={{ scale: 1, rotate: '360deg' }}
                                transition={{
                                    type: 'spring',
                                    duration: 1200,
                                    delay: 400,
                                }}
                                style={styles.avatarContainer}
                            >
                                <LinearGradient
                                    colors={['#667eea', '#764ba2', '#f093fb']}
                                    style={styles.avatarGradient}
                                >
                                    <Text style={styles.avatarText}>{getInitials()}</Text>
                                </LinearGradient>
                            </MotiView>

                            {/* User Info */}
                            <Animated.View
                                style={[
                                    styles.userInfo,
                                    {
                                        opacity: fadeAnim,
                                        transform: [{ translateY: slideAnim }],
                                    },
                                ]}
                            >
                                <Text style={styles.userName}>{getFullName()}</Text>
                                <Text style={styles.userEmail}>
                                    {userData?.email || user?.emailAddresses?.[0]?.emailAddress}
                                </Text>
                                <View style={styles.statusBadge}>
                                    <Ionicons
                                        name="checkmark-circle"
                                        size={16}
                                        color={colors.success}
                                        style={styles.statusIcon}
                                    />
                                    <Text style={styles.statusText}>Verified Account</Text>
                                </View>
                            </Animated.View>
                        </LinearGradient>
                    </MotiView>

                    {/* Profile Details */}
                    <MotiView
                        from={{ opacity: 0, translateY: 50 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{
                            type: 'spring',
                            duration: 800,
                            delay: 600,
                        }}
                        style={styles.detailsContainer}
                    >
                        {profileItems.map((item, index) => (
                            <MotiView
                                key={index}
                                from={{ opacity: 0, translateX: -30 }}
                                animate={{ opacity: 1, translateX: 0 }}
                                transition={{
                                    type: 'spring',
                                    duration: 600,
                                    delay: 800 + index * 100,
                                }}
                                style={[
                                    styles.detailItem,
                                    {
                                        backgroundColor: colors.cardBackground,
                                        borderColor: colors.border,
                                    },
                                ]}
                            >
                                <View style={styles.detailLeft}>
                                    <View
                                        style={[
                                            styles.detailIcon,
                                            { backgroundColor: `${item.color}15` },
                                        ]}
                                    >
                                        <Ionicons
                                            name={item.icon as any}
                                            size={20}
                                            color={item.color}
                                        />
                                    </View>
                                    <View style={styles.detailContent}>
                                        <Text
                                            style={[
                                                styles.detailLabel,
                                                { color: colors.placeholder },
                                            ]}
                                        >
                                            {item.label}
                                        </Text>
                                        <Text
                                            style={[styles.detailValue, { color: colors.text }]}
                                        >
                                            {item.value}
                                        </Text>
                                    </View>
                                </View>
                                <Ionicons
                                    name="chevron-forward"
                                    size={20}
                                    color={colors.placeholder}
                                />
                            </MotiView>
                        ))}
                    </MotiView>



                    {/* Decorative Elements */}
                    <View style={styles.decorativeContainer}>
                        <MotiView
                            from={{ scale: 0, rotate: '0deg' }}
                            animate={{ scale: 1, rotate: '360deg' }}
                            transition={{
                                type: 'timing',
                                duration: 20000,
                                loop: true,
                            }}
                            style={[styles.decorativeCircle, styles.circle1]}
                        />
                        <MotiView
                            from={{ scale: 0, rotate: '360deg' }}
                            animate={{ scale: 1, rotate: '0deg' }}
                            transition={{
                                type: 'timing',
                                duration: 15000,
                                loop: true,
                            }}
                            style={[styles.decorativeCircle, styles.circle2]}
                        />
                    </View>
                </ScrollView>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingIcon: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    loadingText: {
        fontSize: 18,
        color: 'white',
        fontFamily: 'Poppins-Medium',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        fontFamily: 'Poppins-Bold',
    },
    editButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 50,
    },
    profileCard: {
        marginHorizontal: 20,
        marginBottom: 30,
        borderRadius: 24,
        overflow: 'hidden',
        // shadowColor: colors.shadow,
        // shadowOffset: {
        //     width: 0,
        //     height: 8,
        // },
        // shadowOpacity: 0.3,
        // shadowRadius: 16,
        // elevation: 8,
    },
    profileCardGradient: {
        padding: 30,
        alignItems: 'center',
    },
    avatarContainer: {
        marginBottom: 20,
    },
    avatarGradient: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        // shadowColor: colors.shadow,
        // shadowOffset: {
        //     width: 0,
        //     height: 8,
        // },
        // shadowOpacity: 0.3,
        // shadowRadius: 16,
        // elevation: 8,
    },
    avatarText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: 'white',
        fontFamily: 'Poppins-Bold',
    },
    userInfo: {
        alignItems: 'center',
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        fontFamily: 'Poppins-Bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    userEmail: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        fontFamily: 'Poppins-Regular',
        marginBottom: 12,
        textAlign: 'center',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusIcon: {
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        color: 'white',
        fontFamily: 'Poppins-Medium',
    },
    detailsContainer: {
        paddingHorizontal: 20,
        marginBottom: 30,
    },
    detailItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        marginBottom: 12,
        borderRadius: 16,
        borderWidth: 1,
        // shadowColor: colors.shadow,
        // shadowOffset: {
        //     width: 0,
        //     height: 4,
        // },
        // shadowOpacity: 0.1,
        // shadowRadius: 8,
        // elevation: 4,
    },
    detailLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    detailIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    detailContent: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 16,
        fontFamily: 'Poppins-Medium',
    },
    actionsContainer: {
        paddingHorizontal: 20,
        gap: 12,
    },
    actionButton: {
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
        // shadowColor: colors.shadow,
        // shadowOffset: {
        //     width: 0,
        //     height: 4,
        // },
        // shadowOpacity: 0.1,
        // shadowRadius: 8,
        // elevation: 4,
    },
    actionButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        fontFamily: 'Poppins-SemiBold',
        marginLeft: 8,
    },
    decorativeContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
    },
    decorativeCircle: {
        position: 'absolute',
        borderRadius: 1000,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    circle1: {
        width: 200,
        height: 200,
        top: 100,
        right: -100,
    },
    circle2: {
        width: 150,
        height: 150,
        bottom: 200,
        left: -75,
    },
});

export default ProfileScreen;
