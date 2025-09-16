import { useSignIn } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Formik } from 'formik';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Yup from 'yup';
import { useColors } from '../../hooks/useColors';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import CustomButton from '../components/abstract/abstractButton';
import CustomTextInput from '../components/abstract/abstractTextInput';

const SignInSchema = Yup.object().shape({
    email: Yup.string()
        .email('Please enter a valid email address')
        .required('Email is required'),
    password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
});

interface SignInFormValues {
    email: string;
    password: string;
}

const SignInScreen = () => {
    const styles = useThemedStyles(createStyles);
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useColors();
    const { isLoaded, signIn, setActive } = useSignIn();
    const [isLoading, setIsLoading] = useState(false);
    
    const initialValues: SignInFormValues = {
        email: '',
        password: '',
    };

    const handleSignIn = async (values: SignInFormValues) => {
        if (!isLoaded) return;
        
        setIsLoading(true);
        
        try {
            const signInAttempt = await signIn.create({
                identifier: values.email,
                password: values.password,
            });

            if (signInAttempt.status === 'complete') {
                await setActive({ session: signInAttempt.createdSessionId });
                router.replace('/(appStack)/homeScreen');
            } else {
                Alert.alert('Error', 'Sign in failed. Please try again.');
            }
        } catch (error: any) {
            console.error('Sign in error:', error);
            Alert.alert('Error', error.errors?.[0]?.longMessage || 'Failed to sign in. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = () => {
        Alert.alert('Forgot Password', 'Password reset functionality will be implemented soon.');
    };

    const handleSignUp = () => {
        router.push('/(authStack)/signUpScreen');
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
                                        name="library"
                                        size={32}
                                        color={colors.primaryColor}
                                    />
                                </View>
                            </View>
                            <Text style={styles.title}>
                                Welcome Back
                            </Text>
                            <Text style={styles.subtitle}>
                                Sign in to continue your learning journey
                            </Text>
                        </View>

                        {/* Form Section */}
                        <View style={styles.formContainer}>
                            <Formik
                                initialValues={initialValues}
                                validationSchema={SignInSchema}
                                onSubmit={handleSignIn}
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
                                        <View style={{ height: 10 }} />
                                        <CustomTextInput
                                            label="Password"
                                            icon="lock-closed-outline"
                                            placeholder="Enter your password"
                                            secureTextEntry
                                            value={values.password}
                                            onChangeText={handleChange('password')}
                                            onBlur={handleBlur('password')}
                                            error={touched.password && errors.password ? errors.password : undefined}
                                        />

                                        <CustomButton
                                            title="Sign In"
                                            onPress={() => handleSubmit()}
                                            loading={isLoading}
                                            fullWidth
                                            style={styles.signInButton}
                                        />

                                        {/* Forgot Password Link */}
                                        <TouchableOpacity
                                            style={styles.forgotPasswordContainer}
                                            onPress={handleForgotPassword}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={styles.forgotPasswordText}>
                                                Forgot Password?
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </Formik>
                        </View>

                        {/* Footer */}
                        <View style={styles.footer}>
                            <Pressable onPress={handleSignUp}>
                                <Text style={styles.footerText}>
                                    Don't have an account? {' '}
                                    <Text style={styles.signUpText}>
                                        Sign Up
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
    },
    formContainer: {
        marginBottom: 32,
    },
    signInButton: {
        marginTop: 24,
    },
    forgotPasswordContainer: {
        marginTop: 20,
        alignItems: 'center',
        paddingVertical: 8,
    },
    forgotPasswordText: {
        color: colors.primaryColor,
        fontSize: 14,
        fontFamily: 'Poppins-SemiBold',
        textDecorationLine: 'underline',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.border,
    },
    dividerText: {
        marginHorizontal: 16,
        color: colors.placeholder,
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
    },
    socialContainer: {
        marginBottom: 32,
    },
    socialButton: {
        marginBottom: 12,
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
    signUpText: {
        color: colors.primaryColor,
        fontFamily: 'Poppins-SemiBold',
        textDecorationLine: 'underline',
    },
});
export default SignInScreen;
