// components/CustomButton.tsx
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle
} from 'react-native';
import { useThemedStyles } from '../../../hooks/useThemedStyles';

interface CustomButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  loading = false,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled,
  icon,
  style,
  ...props
}) => {
  const styles = useThemedStyles(createStyles);

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return styles.primaryButton;
      case 'secondary':
        return styles.secondaryButton;
      case 'outline':
        return styles.outlineButton;
      case 'ghost':
        return styles.ghostButton;
      default:
        return styles.primaryButton;
    }
  };

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'small':
        return styles.smallButton;
      case 'medium':
        return styles.mediumButton;
      case 'large':
        return styles.largeButton;
      default:
        return styles.mediumButton;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'outline':
        return styles.outlineText;
      case 'ghost':
        return styles.ghostText;
      default:
        return styles.primaryText;
    }
  };

  const getLoadingColor = () => {
    switch (variant) {
      case 'outline':
        return styles.outlineText.color;
      case 'ghost':
        return styles.ghostText.color;
      default:
        return styles.primaryText.color;
    }
  };

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.baseButton,
        getVariantStyles(),
        getSizeStyles(),
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator 
          color={getLoadingColor()} 
          size="small" 
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text style={[styles.buttonText, getTextColor()]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  baseButton: {
    borderRadius: 16,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButton: {
    backgroundColor: colors.primaryColor,
    shadowColor: colors.primaryColor,
    shadowOpacity: 0.3,
  },
  secondaryButton: {
    backgroundColor: colors.secondaryColor,
    borderWidth: 1,
    borderColor: colors.border,
  },
  outlineButton: {
    borderWidth: 2,
    borderColor: colors.primaryColor,
    backgroundColor: 'transparent',
    shadowOpacity: 0.05,
  },
  ghostButton: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  smallButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  mediumButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  largeButton: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 20,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.6,
    shadowOpacity: 0.05,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'Poppins-SemiBold',
    letterSpacing: 0.5,
  },
  primaryText: {
    color: '#ffffff',
  },
  outlineText: {
    color: colors.primaryColor,
  },
  ghostText: {
    color: colors.primaryColor,
  },
});

export default CustomButton;