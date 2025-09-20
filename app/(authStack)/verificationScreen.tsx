import { errorToast, successToast } from '@/utils';
import { useSignUp } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '../../hooks/useColors';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import CustomButton from '../components/abstract/abstractButton';

const VerificationScreen = () => {
    const styles = useThemedStyles(createStyles);
    const route = useRoute();
    const params = route.params;
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useColors();
    const [timeLeft, setTimeLeft] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const { isLoaded, signUp, setActive } = useSignUp();
    const navigation = useNavigation();

    // Refs for each input
    const inputRefs = useRef<(TextInput | null)[]>([]);

    // Timer countdown
    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [timeLeft]);

    const handleCodeChange = (text: string, index: number) => {
        // Only allow numbers
        const numericText = text.replace(/[^0-9]/g, '');

        const newCode = [...code];
        newCode[index] = numericText;
        setCode(newCode);

        // Auto-focus next input if text is entered
        if (numericText && index < 5) {
            // Use setTimeout to avoid focus conflicts
            setTimeout(() => {
                inputRefs.current[index + 1]?.focus();
            }, 0);
        }
    };

    const handleKeyPress = (key: string, index: number) => {
        // Handle backspace
        if (key === 'Backspace') {
            if (code[index]) {
                // If current input has text, clear it
                const newCode = [...code];
                newCode[index] = '';
                setCode(newCode);
            } else if (index > 0) {
                // If current input is empty, go to previous and clear it
                const newCode = [...code];
                newCode[index - 1] = '';
                setCode(newCode);
                setTimeout(() => {
                    inputRefs.current[index - 1]?.focus();
                }, 0);
            }
        }
    };

    const handleTextSelection = (index: number) => {
        // Clear the current input when user taps on it
        if (code[index]) {
            const newCode = [...code];
            newCode[index] = '';
            setCode(newCode);
        }
    };

    const handleVerification = async () => {
        if (!isLoaded) {
            errorToast('Authentication system is not ready. Please try again.');
            return;
        }

        const verificationCode = code.join('');

        // Basic validation
        if (verificationCode.length !== 6) {
            errorToast('Please enter a complete 6-digit verification code.');
            return;
        }

        setIsLoading(true);

        try {
            const signUpAttempt = await signUp.attemptEmailAddressVerification({
                code: verificationCode,
            });
            if (signUpAttempt.status === 'complete') {
                await setActive({ session: signUpAttempt.createdSessionId });
                navigation.dispatch(
                    CommonActions.reset({
                        index: 0,
                        routes: [
                            {
                                name: 'appStack',
                                params: { screen: 'homeScreen' }
                            }
                        ]
                    })
                );
            } else {
                errorToast('Verification failed. Please try again.');
            }
        } catch (error: any) {
            console.log('Verification error:', error);

            // Handle different types of Clerk errors
            if (error.errors && error.errors.length > 0) {
                const errorMessage = error.errors[0].longMessage || error.errors[0].message;
                errorToast(errorMessage);
            } else if (error.message) {
                errorToast(error.message);
            } else {
                errorToast('Invalid verification code. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (!params) {
            errorToast('Unable to resend code. Please try again.');
            return;
        }

        if (!isLoaded) {
            errorToast('Authentication system is not ready. Please try again.');
            return;
        }

        try {
            await signUp.create(params.userObject);
            await signUp?.prepareEmailAddressVerification({ strategy: "email_code" });
            successToast('A new verification code has been sent to your email.');
            setTimeLeft(60);
            setCanResend(false);
        } catch (error: any) {
            console.log('Resend error:', JSON.stringify(error, null, 2));

            if (error.errors && error.errors.length > 0) {
                const errorMessage = error.errors[0].longMessage || error.errors[0].message;
                errorToast(errorMessage);
            } else {
                errorToast('Failed to resend verification code. Please try again.');
            }
        }
    };

    const handleBackToSignUp = () => {
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <StatusBar style="auto" />
            <LinearGradient
                colors={isDark
                    ? [colors.background, colors.surface]
                    : [colors.surface, colors.background]
                }
                style={styles.gradient}
            >
                <View style={{ height: insets.top }} />
                <KeyboardAwareScrollView
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                    extraScrollHeight={insets.bottom}
                    enableAutomaticScroll={true}
                    enableOnAndroid={true}
                >
                    <View style={styles.content}>
                        {/* Header Section */}
                        <View style={styles.header}>
                            <View style={styles.logoContainer}>
                                <View style={styles.logoBackground}>
                                    <Ionicons
                                        name="mail"
                                        size={32}
                                        color={colors.primaryColor}
                                    />
                                </View>
                            </View>
                            <Text style={styles.title}>
                                Verify Your Email
                            </Text>
                            <Text style={styles.subtitle}>
                                We've sent a 6-digit verification code to your email address
                            </Text>
                        </View>

                        {/* Form Section */}
                        <View style={styles.formContainer}>
                            {/* Verification Code Input */}
                            <View style={styles.codeInputContainer}>
                                <Text style={styles.codeLabel}>Verification Code</Text>
                                <View style={styles.codeInputsRow}>
                                    {[0, 1, 2, 3, 4, 5].map((index) => (
                                        <TextInput
                                            key={index}
                                            ref={(ref) => (inputRefs.current[index] = ref)}
                                            style={[
                                                styles.codeInput,
                                                code[index] && styles.codeInputFilled,
                                            ]}
                                            value={code[index]}
                                            onChangeText={(text) => handleCodeChange(text, index)}
                                            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                                            onFocus={() => handleTextSelection(index)}
                                            keyboardType="numeric"
                                            maxLength={1}
                                            textAlign="center"
                                            selectTextOnFocus
                                            autoFocus={index === 0}
                                        />
                                    ))}
                                </View>
                            </View>

                            <CustomButton
                                title="Verify Email"
                                onPress={handleVerification}
                                loading={isLoading}
                                fullWidth
                                style={styles.verifyButton}
                            />

                            {/* Resend Code Section */}
                            <View style={styles.resendContainer}>
                                {canResend ? (
                                    <TouchableOpacity
                                        onPress={handleResendCode}
                                        style={styles.resendButton}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.resendText}>
                                            Resend Code
                                        </Text>
                                    </TouchableOpacity>
                                ) : (
                                    <Text style={styles.timerText}>
                                        Resend code in {timeLeft}s
                                    </Text>
                                )}
                            </View>
                        </View>

                        {/* Footer */}
                        <View style={styles.footer}>
                            <Pressable onPress={handleBackToSignUp}>
                                <Text style={styles.footerText}>
                                    Didn't receive the code? {' '}
                                    <Text style={styles.backText}>
                                        Back to Sign Up
                                    </Text>
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </KeyboardAwareScrollView>
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
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingVertical: 40,
        justifyContent: 'center',
    },
    header: {
        marginBottom: 40,
        alignItems: 'center',
    },
    logoContainer: {
        marginBottom: 24,
    },
    logoBackground: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.secondaryColor,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.shadow,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.text,
        textAlign: 'center',
        marginBottom: 8,
        fontFamily: 'Poppins-Bold',
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 16,
        color: colors.text,
        textAlign: 'center',
        opacity: 0.7,
        fontFamily: 'Poppins-Regular',
        lineHeight: 22,
        paddingHorizontal: 20,
    },
    formContainer: {
        marginBottom: 32,
    },
    codeInputContainer: {
        marginBottom: 24,
    },
    codeLabel: {
        color: colors.text,
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 16,
        fontFamily: 'Poppins-SemiBold',
        letterSpacing: 0.2,
        textAlign: 'center',
    },
    codeInputsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    codeInput: {
        width: 45,
        height: 55,
        borderWidth: 2,
        borderColor: colors.border,
        borderRadius: 12,
        backgroundColor: colors.surface,
        fontSize: 20,
        fontFamily: 'Poppins-Bold',
        color: colors.text,
        shadowColor: colors.shadow,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    codeInputFilled: {
        borderColor: colors.primaryColor,
        backgroundColor: colors.cardBackground,
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
        shadowColor: colors.primaryColor,
    },
    verifyButton: {
        marginTop: 24,
    },
    resendContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    resendButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    resendText: {
        color: colors.primaryColor,
        fontSize: 14,
        fontFamily: 'Poppins-SemiBold',
        textDecorationLine: 'underline',
    },
    timerText: {
        color: colors.placeholder,
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
    },
    footer: {
        alignItems: 'center',
        paddingTop: 20,
    },
    footerText: {
        color: colors.text,
        fontSize: 14,
        textAlign: 'center',
        opacity: 0.7,
        fontFamily: 'Poppins-Regular',
    },
    backText: {
        color: colors.primaryColor,
        fontFamily: 'Poppins-SemiBold',
        textDecorationLine: 'underline',
    },
});
export default VerificationScreen;