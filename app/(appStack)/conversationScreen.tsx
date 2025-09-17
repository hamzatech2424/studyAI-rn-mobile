import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '../../hooks/useColors';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import AbstractContentContainer from '../components/abstract/abstractContentContainer';

const ConversationScreen = () => {
    const insets = useSafeAreaInsets();
    const styles = useThemedStyles(createStyles);
    const { colors, isDark } = useColors();
 
  
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
                <AbstractContentContainer style={{ flex: 1 }}>
                    <View style={{ height: insets.top }} />
                    <View style={styles.headerContent}>
             
                    </View>

                  

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
});

export default ConversationScreen;