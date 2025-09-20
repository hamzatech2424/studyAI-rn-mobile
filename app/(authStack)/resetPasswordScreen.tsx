import { errorToast, successToast } from '@/utils';
import { useSignIn } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Formik } from 'formik';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Yup from 'yup';
import { useColors } from '../../hooks/useColors';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import CustomButton from '../components/abstract/abstractButton';
import CustomTextInput from '../components/abstract/abstractTextInput';

const ResetPasswordSchema = Yup.object().shape({
    otpCode: Yup.string()
        .length(6, 'OTP code must be exactly 6 digits')
        .matches(/^\d+$/, 'OTP code must contain only numbers')
        .required('OTP code is required'),
    password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'Password must contain at least one lowercase letter, one uppercase letter, and one number'
        )
        .required('Password is required'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Please confirm your password'),
});

interface ResetPasswordFormValues {
    otpCode: string;
    password: string;
    confirmPassword: string;
}

const ResetPasswordScreen = () => {
    const styles = useThemedStyles(createStyles);
    const route = useRoute();
    const params = route.params;
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useColors();
    const { isLoaded, signIn, setActive } = useSignIn();
    const [isLoading, setIsLoading] = useState(false);
    const [passwordReset, setPasswordReset] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const navigation = useNavigation();

    // Refs for OTP inputs
    const otpInputRefs = useRef<(TextInput | null)[]>([]);

    const initialValues: ResetPasswordFormValues = {
        otpCode: '',
        password: '',
        confirmPassword: '',
    };

    // Timer countdown
    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [timeLeft]);

    const handleOtpChange = (text: string, index: number, setFieldValue: any, values: any) => {
        // Only allow numbers
        const numericText = text.replace(/[^0-9]/g, '');

        // Update the specific OTP digit
        const otpArray = values.otpCode.split('');
        otpArray[index] = numericText;
        const newOtpCode = otpArray.join('');
        setFieldValue('otpCode', newOtpCode);

        // Auto-focus next input if text is entered
        if (numericText && index < 5) {
            setTimeout(() => {
                otpInputRefs.current[index + 1]?.focus();
            }, 0);
        }
    };

    const handleOtpKeyPress = (key: string, index: number, setFieldValue: any, values: any) => {
        if (key === 'Backspace') {
            const otpArray = values.otpCode.split('');

            if (otpArray[index]) {
                // If current input has text, clear it
                otpArray[index] = '';
                setFieldValue('otpCode', otpArray.join(''));
            } else if (index > 0) {
                // If current input is empty, go to previous and clear it
                otpArray[index - 1] = '';
                setFieldValue('otpCode', otpArray.join(''));
                setTimeout(() => {
                    otpInputRefs.current[index - 1]?.focus();
                }, 0);
            }
        }
    };

    const handleResetPassword = async (values: ResetPasswordFormValues) => {
        if (!isLoaded) {
            errorToast('Authentication system is not ready. Please try again.');
            return;
        }

        setIsLoading(true);

        try {
            console.log('Attempting password reset with OTP:', values.otpCode);
            const resetAttempt = await signIn.attemptFirstFactor({
                strategy: 'reset_password_email_code',
                code: values.otpCode,
                password: values.password
            });

            if (resetAttempt.status === 'complete') {
                // Set the new session as active using the setActive function
                await setActive({ session: resetAttempt.createdSessionId });

                setPasswordReset(true);
                successToast('Password updated successfully!');

                // Navigate to home screen with valid session
                // setTimeout(() => {
                //     navigation.navigate('appStack', { screen: 'homeScreen' });
                // }, 2000);
            } else {
                errorToast('Password reset failed. Please try again.');
            }

        } catch (error: any) {
            console.error('Password reset error:', error);
            // Handle different types of Clerk errors
            if (error.errors && error.errors.length > 0) {
                const errorMessage = error.errors[0].longMessage || error.errors[0].message;
                errorToast(errorMessage);
            } else if (error.message) {
                errorToast(error.message);
            } else {
                errorToast('Failed to reset password. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (!params?.email) {
            errorToast('Unable to resend code. Please try again.');
            return;
        }

        if (!isLoaded) {
            errorToast('Authentication system is not ready. Please try again.');
            return;
        }

        try {
            await signIn.create({
                strategy: 'reset_password_email_code',
                identifier: params.email,
            });

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

    const handleBackToSignIn = () => {
        navigation.navigate('appStack', { screen: 'homeScreen' });
    };

    if (passwordReset) {
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
                    >
                        <View style={styles.content}>
                            {/* Success Section */}
                            <View style={styles.successContainer}>
                                <View style={[styles.successIcon, { backgroundColor: colors.success || '#4CAF50' }]}>
                                    <Ionicons
                                        name="checkmark"
                                        size={48}
                                        color="white"
                                    />
                                </View>
                                <Text style={[styles.successTitle, { color: colors.text }]}>
                                    Password Updated!
                                </Text>
                                <Text style={[styles.successMessage, { color: colors.placeholder }]}>
                                    Your password has been successfully updated. You can now sign in with your new password.
                                </Text>

                                <CustomButton
                                    title="Continue"
                                    onPress={handleBackToSignIn}
                                    style={styles.continueButton}
                                />
                            </View>
                        </View>
                    </KeyboardAwareScrollView>
                </LinearGradient>
            </View>
        );
    }

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
                >
                    <View style={styles.content}>
                        {/* Header Section */}
                        <View style={styles.header}>
                            <View style={styles.logoContainer}>
                                <View style={styles.logoBackground}>
                                    <Ionicons
                                        name="shield-checkmark"
                                        size={32}
                                        color={colors.primaryColor}
                                    />
                                </View>
                            </View>
                            <Text style={styles.title}>
                                Reset Password
                            </Text>
                            <Text style={styles.subtitle}>
                                Enter the OTP code and set your new password
                            </Text>
                        </View>

                        {/* Form Section */}
                        <View style={styles.formContainer}>
                            <Formik
                                initialValues={initialValues}
                                validationSchema={ResetPasswordSchema}
                                onSubmit={handleResetPassword}
                            >
                                {({
                                    handleChange,
                                    handleBlur,
                                    handleSubmit,
                                    setFieldValue,
                                    values,
                                    errors,
                                    touched,
                                }) => (
                                    <View>
                                        {/* OTP Code Input */}
                                        <View style={styles.otpContainer}>
                                            <Text style={[styles.otpLabel, { color: colors.text }]}>
                                                Enter OTP Code
                                            </Text>
                                            <Text style={[styles.otpSubtitle, { color: colors.placeholder }]}>
                                                Sent to {params?.email || 'your email'}
                                            </Text>
                                            <View style={styles.otpInputsRow}>
                                                {[0, 1, 2, 3, 4, 5].map((index) => (
                                                    <TextInput
                                                        key={index}
                                                        ref={(ref) => (otpInputRefs.current[index] = ref)}
                                                        style={[
                                                            styles.otpInput,
                                                            values.otpCode[index] && styles.otpInputFilled,
                                                        ]}
                                                        value={values.otpCode[index] || ''}
                                                        onChangeText={(text) => handleOtpChange(text, index, setFieldValue, values)}
                                                        onKeyPress={({ nativeEvent }) => handleOtpKeyPress(nativeEvent.key, index, setFieldValue, values)}
                                                        keyboardType="numeric"
                                                        maxLength={1}
                                                        textAlign="center"
                                                        selectTextOnFocus
                                                        autoFocus={index === 0}
                                                    />
                                                ))}
                                            </View>
                                            {touched.otpCode && errors.otpCode && (
                                                <Text style={[styles.errorText, { color: colors.error || '#FF6B6B' }]}>
                                                    {errors.otpCode}
                                                </Text>
                                            )}

                                            {/* Resend Code */}
                                            <View style={styles.resendContainer}>
                                                {canResend ? (
                                                    <Pressable onPress={handleResendCode}>
                                                        <Text style={[styles.resendText, { color: colors.primaryColor }]}>
                                                            Resend Code
                                                        </Text>
                                                    </Pressable>
                                                ) : (
                                                    <Text style={[styles.timerText, { color: colors.placeholder }]}>
                                                        Resend code in {timeLeft}s
                                                    </Text>
                                                )}
                                            </View>
                                        </View>

                                        <View style={{ height: 20 }} />

                                        {/* New Password Input */}
                                        <CustomTextInput
                                            label="New Password"
                                            icon="lock-closed-outline"
                                            placeholder="Enter your new password"
                                            secureTextEntry
                                            value={values.password}
                                            onChangeText={handleChange('password')}
                                            onBlur={handleBlur('password')}
                                            error={touched.password && errors.password ? errors.password : undefined}
                                        />
                                        <View style={{ height: 10 }} />

                                        <CustomTextInput
                                            label="Confirm Password"
                                            icon="lock-closed-outline"
                                            placeholder="Confirm your new password"
                                            secureTextEntry
                                            value={values.confirmPassword}
                                            onChangeText={handleChange('confirmPassword')}
                                            onBlur={handleBlur('confirmPassword')}
                                            error={touched.confirmPassword && errors.confirmPassword ? errors.confirmPassword : undefined}
                                        />

                                        <CustomButton
                                            title={isLoading ? "Resetting Password..." : "Reset Password"}
                                            onPress={() => handleSubmit()}
                                            loading={isLoading}
                                            fullWidth
                                            style={styles.resetButton}
                                            disabled={isLoading}
                                        />
                                    </View>
                                )}
                            </Formik>
                        </View>

                        {/* Footer */}
                        <View style={styles.footer}>
                            <Pressable onPress={handleBackToSignIn}>
                                <Text style={styles.footerText}>
                                    Remember your password? {' '}
                                    <Text style={styles.signInText}>
                                        Back to Sign In
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
    otpContainer: {
        marginBottom: 20,
    },
    otpLabel: {
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
        marginBottom: 4,
        textAlign: 'center',
    },
    otpSubtitle: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        marginBottom: 20,
        textAlign: 'center',
    },
    otpInputsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    otpInput: {
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
    otpInputFilled: {
        borderColor: colors.primaryColor,
        backgroundColor: colors.cardBackground,
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
        shadowColor: colors.primaryColor,
    },
    errorText: {
        fontSize: 12,
        fontFamily: 'Poppins-Regular',
        textAlign: 'center',
        marginTop: 8,
    },
    resendContainer: {
        alignItems: 'center',
        marginTop: 12,
    },
    resendText: {
        fontSize: 14,
        fontFamily: 'Poppins-SemiBold',
        textDecorationLine: 'underline',
    },
    timerText: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
    },
    resetButton: {
        marginTop: 24,
    },
    successContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    successIcon: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
    },
    successTitle: {
        fontSize: 28,
        fontFamily: 'Poppins-SemiBold',
        marginBottom: 16,
        textAlign: 'center',
    },
    successMessage: {
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
        paddingHorizontal: 20,
    },
    continueButton: {
        width: '100%',
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
    signInText: {
        color: colors.primaryColor,
        fontFamily: 'Poppins-SemiBold',
        textDecorationLine: 'underline',
    },
});

export default ResetPasswordScreen;
