import { errorToast, successToast } from '@/utils';
import { useSignIn } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Formik } from 'formik';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Yup from 'yup';
import { useColors } from '../../hooks/useColors';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import CustomButton from '../components/abstract/abstractButton';
import CustomTextInput from '../components/abstract/abstractTextInput';

const ForgotPasswordSchema = Yup.object().shape({
    email: Yup.string()
        .email('Please enter a valid email address')
        .required('Email is required'),
});

interface ForgotPasswordFormValues {
    email: string;
}

const ForgotPasswordScreen = () => {
    const styles = useThemedStyles(createStyles);
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useColors();
    const { isLoaded, signIn } = useSignIn();
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const navigation = useNavigation();

    const initialValues: ForgotPasswordFormValues = {
        email: '',
    };

    const handleForgotPassword = async (values: ForgotPasswordFormValues) => {
        if (!isLoaded) {
            errorToast('Authentication system is not ready. Please try again.');
            return;
        }

        setIsLoading(true);

        try {
            await signIn.create({
                strategy: 'reset_password_email_code',
                identifier: values.email,
            });

            navigation.navigate("resetPasswordScreen", { email: values.email })
            successToast('Password reset email sent! Check your inbox.');
        } catch (error: any) {
            console.error('Forgot password error:', error);

            // Handle different types of Clerk errors
            if (error.errors && error.errors.length > 0) {
                const errorMessage = error.errors[0].longMessage || error.errors[0].message;
                errorToast(errorMessage);
            } else if (error.message) {
                errorToast(error.message);
            } else {
                errorToast('Failed to send reset email. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToSignIn = () => {
        navigation.goBack();
    };

    const continueToVerification = () => {
        console.log(initialValues.email, "initialValues.email==>>")
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
                >
                    <View style={styles.content}>
                        {/* Header Section */}
                        <View style={styles.header}>
                            <View style={styles.logoContainer}>
                                <View style={styles.logoBackground}>
                                    <Ionicons
                                        name="lock-closed"
                                        size={32}
                                        color={colors.primaryColor}
                                    />
                                </View>
                            </View>
                            <Text style={styles.title}>
                                {emailSent ? 'Check Your Email' : 'Forgot Password?'}
                            </Text>
                            <Text style={styles.subtitle}>
                                {emailSent
                                    ? 'We\'ve sent a password otp to your email address'
                                    : 'Enter your email address and we\'ll send you a otp to reset your password'
                                }
                            </Text>
                        </View>

                        {/* Form Section */}
                            <View style={styles.formContainer}>
                                <Formik
                                    initialValues={initialValues}
                                    validationSchema={ForgotPasswordSchema}
                                    onSubmit={handleForgotPassword}
                                >
                                    {({
                                        handleChange,
                                        handleBlur,
                                        handleSubmit,
                                        values,
                                        errors,
                                        touched,
                                    }) => (
                                        <View>
                                            <CustomTextInput
                                                label="Email Address"
                                                icon="mail-outline"
                                                placeholder="Enter your email"
                                                keyboardType="email-address"
                                                autoCapitalize="none"
                                                autoCorrect={false}
                                                value={values.email}
                                                onChangeText={handleChange('email')}
                                                onBlur={handleBlur('email')}
                                                error={touched.email && errors.email ? errors.email : undefined}
                                            />

                                            <CustomButton
                                                title={isLoading ? "Sending..." : "Send Reset"}
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
    resetButton: {
        marginTop: 24,
    },
    emailSentContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    successIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    emailSentTitle: {
        fontSize: 24,
        fontFamily: 'Poppins-SemiBold',
        marginBottom: 12,
        textAlign: 'center',
    },
    emailSentMessage: {
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
        paddingHorizontal: 20,
    },
    actionButtons: {
        width: '100%',
        alignItems: 'center',
    },
    resendButton: {
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

export default ForgotPasswordScreen;
