import { useSignUp } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Formik } from 'formik';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Yup from 'yup';
import { useColors } from '../../hooks/useColors';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import CustomButton from '../components/abstract/abstractButton';
import CustomTextInput from '../components/abstract/abstractTextInput';

const SignUpSchema = Yup.object().shape({
    name: Yup.string()
        .min(2, 'Name must be at least 2 characters')
        .required('Name is required'),
    email: Yup.string()
        .email('Please enter a valid email address')
        .required('Email is required'),
    password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
});

interface SignUpFormValues {
    name: string;
    email: string;
    password: string;
}

const SignUpScreen = () => {

    const styles = useThemedStyles(createStyles);
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useColors();
    const initialValues: SignUpFormValues = {
        name: '',
        email: '',
        password: '',
    };
    const { isLoaded, signUp, setActive } = useSignUp()
    const [loading, setLoading] = useState(false)
    const navigation = useNavigation();

    const handleSignUp = async (values: SignUpFormValues) => {
        if (!isLoaded) return
        try {
            setLoading(true)
            let userObject = {
                username: values.name,
                emailAddress: values.email,
                password: values.password,
            }
            await signUp.create(userObject)
            await signUp.prepareEmailAddressVerification({ strategy: "email_code" })
            navigation.navigate('verificationScreen', { userObject });
        } catch (error) {
            console.log(JSON.stringify(error, null, 2))
            Alert.alert(error.errors[0].longMessage)
        } finally {
            setLoading(false)
        }
    };

    const handleSignIn = () => {
        Alert.alert('Sign In', 'Redirecting to sign in screen...');
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
                                        name="person-add"
                                        size={32}
                                        color={colors.primaryColor}
                                    />
                                </View>
                            </View>
                            <Text style={styles.title}>
                                Create Account
                            </Text>
                            <Text style={styles.subtitle}>
                                Join StudyAI and start your learning journey
                            </Text>
                        </View>

                        {/* Form Section */}
                        <View style={styles.formContainer}>
                            <Formik
                                initialValues={initialValues}
                                validationSchema={SignUpSchema}
                                onSubmit={handleSignUp}
                            >
                                {({
                                    handleChange,
                                    handleBlur,
                                    handleSubmit,
                                    values,
                                    errors,
                                    touched,
                                    isSubmitting
                                }) => (
                                    <View>
                                        <CustomTextInput
                                            label="UserName"
                                            icon="person-outline"
                                            placeholder="Enter your username"
                                            autoCapitalize="words"
                                            autoCorrect={false}
                                            value={values.name}
                                            onChangeText={handleChange('name')}
                                            onBlur={handleBlur('name')}
                                            error={touched.name && errors.name ? errors.name : undefined}
                                        />
                                        <View style={{ height: 10 }} />
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
                                            placeholder="Create a password"
                                            secureTextEntry
                                            value={values.password}
                                            onChangeText={handleChange('password')}
                                            onBlur={handleBlur('password')}
                                            error={touched.password && errors.password ? errors.password : undefined}
                                        />

                                        <CustomButton
                                            title="Create Account"
                                            onPress={() => handleSubmit()}
                                            loading={loading}
                                            fullWidth
                                            style={styles.signUpButton}
                                        />
                                        <View style={styles.footer}>
                                            <Pressable onPress={handleSignIn}>
                                                <Text style={styles.footerText}>
                                                    Already have an account? {' '}
                                                    <Text style={styles.signInText}>
                                                        Sign In
                                                    </Text>
                                                </Text>
                                            </Pressable>
                                        </View>

                                    </View>
                                )}
                            </Formik>
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
        justifyContent: 'center',
    },
    header: {
        marginBottom: 30,
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
    signUpButton: {
        marginTop: 24,
    },
    termsContainer: {
        marginTop: 20,
        paddingHorizontal: 8,
    },
    termsText: {
        color: colors.text,
        fontSize: 13,
        textAlign: 'center',
        opacity: 0.7,
        fontFamily: 'Poppins-Regular',
        lineHeight: 18,
    },
    termsLink: {
        color: colors.primaryColor,
        fontFamily: 'Poppins-SemiBold',
        textDecorationLine: 'underline',
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
export default SignUpScreen;