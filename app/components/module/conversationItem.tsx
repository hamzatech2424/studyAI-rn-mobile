import { useColors } from '@/hooks/useColors';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemedStyles } from '../../../hooks/useThemedStyles';

const ConversationItem = ({ item,index, onPress }: { item: any, index: number, onPress: () => void }) => {
    const styles = useThemedStyles(createStyles);
    const { colors, isDark } = useColors();

    // Add a new function to format creation date:
    const formatCreationDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
        
        if (diffInDays === 0) {
            return "Today";
        } else if (diffInDays === 1) {
            return "Yesterday";
        } else if (diffInDays < 7) {
            return date.toLocaleDateString('en-US', { weekday: 'long' });
        } else if (diffInDays < 30) {
            return `${diffInDays} days ago`;
        } else {
            return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
            });
        }
    };

    const getMessageTypeIcon = (type: any) => {
        switch (type?.toLowerCase()) {
            case 'ai': return 'robot';
            case 'user': return 'person-outline';
            default: return 'chat';
        }
    };

    return (
        <MotiView
            from={{ opacity: 0, translateY: 15, scale: 0.98 }}
            animate={{ opacity: 1, translateY: 0, scale: 1 }}
            transition={{
                type: "spring",
                duration: 500,
                delay: Math.random() * 150,
            }}
            style={[styles.container, { marginTop: index === 0 ? 10 : 20 }]}
        >
            <TouchableOpacity
                activeOpacity={0.9}
                style={styles.touchableContainer}
                onPress={onPress}
            >
                <LinearGradient
                    colors={isDark 
                        ? ['#2D3748', '#1A202C', '#2D3748']
                        : ['#667eea', '#764ba2']
                    }
                    style={styles.gradientContainer}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    {/* Main Content */}
                    <View style={styles.mainContent}>
                        
                        {/* Icon Container */}
                        <MotiView
                            from={{ rotate: '0deg' }}
                            animate={{ rotate: ['0deg', '3deg', '-3deg', '0deg'] }}
                            transition={{
                                type: "timing",
                                duration: 3000,
                                loop: true,
                                delay: Math.random() * 2000,
                            }}
                            style={styles.iconContainer}
                        >
                            <LinearGradient
                                colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                                style={styles.iconGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Ionicons
                                    name="document-text"
                                    size={20}
                                    color="white"
                                />
                            </LinearGradient>
                        </MotiView>

                        {/* Content Area */}
                        <View style={styles.contentArea}>
                            
                            {/* Title and Time Row */}
                            <View style={styles.titleRow}>
                                <View style={styles.titleContainer}>
                                    <Text 
                                        numberOfLines={1} 
                                        style={styles.title}
                                    >
                                        {item.title || 'Untitled Document'}
                                    </Text>
                                    <Text style={styles.creationDate}>
                                        {formatCreationDate(item?.createdAt)}
                                    </Text>
                                </View>
                                
                                {/* Time */}
                                {/* <Text style={styles.timeText}>
                                    {formatTime(item?.lastMessageAt || item?.createdAt)}
                                </Text> */}
                            </View>

                            {/* Last Message */}
                            <View style={styles.messageRow}>
                                <View style={styles.messageTypeContainer}>
                                    <View style={styles.messageTypeIconContainer}>
                                        <MaterialCommunityIcons
                                            name={getMessageTypeIcon(item?.lastMessageType)}
                                            size={12} // Even larger
                                            color="white" // Pure white for maximum contrast
                                            style={styles.messageTypeIcon}
                                        />
                                    </View>
                                    <Text style={styles.messageType}>
                                        {item?.lastMessageType?.toUpperCase() || 'CHAT'}
                                    </Text>
                                </View>
                                
                                <Text 
                                    numberOfLines={1} 
                                    style={styles.messageText}
                                >
                                    {item?.lastMessage || 'No messages yet'}
                                </Text>
                            </View>
                        </View>

                        {/* Arrow Indicator */}
                        <MotiView
                            from={{ translateX: 0 }}
                            animate={{ translateX: [0, 3, 0] }}
                            transition={{
                                type: "timing",
                                duration: 2000,
                                loop: true,
                            }}
                            style={styles.arrowContainer}
                        >
                            <Ionicons
                                name="chevron-forward"
                                size={16}
                                color="rgba(255,255,255,0.7)"
                            />
                        </MotiView>
                    </View>

                    {/* Subtle Overlay Pattern */}
                    <LinearGradient
                        colors={['transparent', 'rgba(255,255,255,0.05)', 'transparent']}
                        style={styles.overlayPattern}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    />
                </LinearGradient>
            </TouchableOpacity>
        </MotiView>
    );
};

export default ConversationItem;

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        marginTop: 20,
    },
    touchableContainer: {
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
        height: 90, // Set fixed height
    },
    gradientContainer: {
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        position: 'relative',
        overflow: 'hidden',
        height: '100%', // Take full height of parent
        justifyContent: 'center', // Center content vertically
    },
    mainContent: {
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 2,
        height: '100%', // Take full height
    },
    iconContainer: {
        marginRight: 12,
    },
    iconGradient: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    contentArea: {
        flex: 1,
        paddingRight: 8,
        justifyContent: 'center', // Center content vertically
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        fontSize: 15,
        fontFamily: 'Poppins-SemiBold',
        color: 'white',
        flex: 1,
        marginRight: 8,
    },
    creationDate: {
        fontSize: 11,
        fontFamily: 'Poppins-Medium',
        color: 'rgba(255,255,255,0.7)',
    },
    timeText: {
        fontSize: 11,
        fontFamily: 'Poppins-Medium',
        color: 'rgba(255,255,255,0.7)',
    },
    messageRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    messageTypeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 8,
        backgroundColor: 'rgba(255,255,255,0.15)', // Add background for better visibility
        paddingHorizontal: 6,
        paddingVertical: 5,
        borderRadius: 8,
    },
    messageTypeIconContainer: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 6,
    },
    messageTypeIcon: {
        // Remove margin since it's now in a container
    },
    messageType: {
        fontSize: 10,
        fontFamily: 'Poppins-Bold',
        color: 'rgba(255,255,255,0.9)', // Increased opacity
        letterSpacing: 0.5,
    },
    messageText: {
        fontSize: 13,
        fontFamily: 'Poppins-Regular',
        color: 'rgba(255,255,255,0.9)',
        flex: 1,
        lineHeight: 16,
    },
    arrowContainer: {
        marginLeft: 4,
        padding: 4,
        justifyContent: 'center', // Center arrow vertically
    },
    overlayPattern: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 16,
    },
});