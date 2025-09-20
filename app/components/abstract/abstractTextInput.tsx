// app/components/abstract/abstractTextInput.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View
} from 'react-native';
import { useColors } from '../../../hooks/useColors';
import { useThemedStyles } from '../../../hooks/useThemedStyles';

interface CustomTextInputProps extends TextInputProps {
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'filled' | 'outlined';
}

const CustomTextInput: React.FC<CustomTextInputProps> = ({
  label,
  icon,
  error,
  helperText,
  secureTextEntry = false,
  variant = 'default',
  ...props
}) => {
  const [isSecure, setIsSecure] = useState(secureTextEntry);
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const styles = useThemedStyles(createStyles);
  const { colors } = useColors();

  const toggleSecureEntry = () => {
    setIsSecure(!isSecure);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleTextChange = (text: string) => {
    setHasValue(text.length > 0);
    if (props.onChangeText) {
      props.onChangeText(text);
    }
  };

  const getInputContainerStyle = () => {
    return [
      styles.inputContainer,
      variant === 'filled' && styles.filledContainer,
      variant === 'outlined' && styles.outlinedContainer,
      isFocused && styles.inputContainerFocused,
      error && styles.inputContainerError,
    ].filter(Boolean);
  };

  return (
    <View>
      {label && (
        <Text style={[
          styles.label,
          isFocused && styles.labelFocused,
          error && styles.labelError
        ]}>
          {label}
        </Text>
      )}

      <View style={getInputContainerStyle()}>
        {icon && (
          <View style={styles.iconContainer}>
            <Ionicons
              name={icon}
              size={20}
              color={
                error
                  ? colors.error
                  : isFocused
                    ? colors.primaryColor
                    : colors.icon
              }
            />
          </View>
        )}

        <TextInput
          style={[
            styles.input,
            variant === 'filled' && styles.filledInput,
            variant === 'outlined' && styles.outlinedInput,
          ]}
          placeholderTextColor={colors.placeholder}
          secureTextEntry={isSecure}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChangeText={handleTextChange}
          {...props}
        />

        {secureTextEntry && (
          <TouchableOpacity
            onPress={toggleSecureEntry}
            style={styles.toggleButton}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isSecure ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.icon}
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.helperContainer}>
        {error && (
          <>
            <Ionicons name="alert-circle-outline" size={14} color={colors.error} />
            <Text style={styles.errorText}>
              {error}
            </Text>
          </>
        )}
      </View>

    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: 'Poppins-SemiBold',
    letterSpacing: 0.2,
  },
  labelFocused: {
    color: colors.primaryColor,
  },
  labelError: {
    color: colors.error,
  },
  errorIcon: {
    color: colors.error,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    // shadowColor: colors.shadow,
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.05,
    // shadowRadius: 2,
    // elevation: 1,
    height: 60,
  },
  filledContainer: {
    backgroundColor: colors.secondaryColor,
    borderColor: 'transparent',
  },
  outlinedContainer: {
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  inputContainerFocused: {
    borderColor: colors.primaryColor,
    backgroundColor: colors.cardBackground,
    // shadowOpacity: 0.15,
    // shadowRadius: 12,
    // elevation: 6,
    // shadowColor: colors.primaryColor,
  },
  inputContainerError: {
    borderColor: colors.error,
    backgroundColor: colors.isDark ? 'rgba(239, 68, 68, 0.05)' : 'rgba(239, 68, 68, 0.02)',
  },
  iconContainer: {
    marginRight: 12,
    width: 24,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  filledInput: {
    color: colors.text,
  },
  outlinedInput: {
    color: colors.text,
  },
  toggleButton: {
    marginLeft: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  helperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    paddingHorizontal: 4,
    height: 20,
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    marginLeft: 6,
    fontFamily: 'Poppins-Regular',
    flex: 1,
  },
  helperText: {
    color: colors.placeholder,
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    flex: 1,
  },
});

export default CustomTextInput;