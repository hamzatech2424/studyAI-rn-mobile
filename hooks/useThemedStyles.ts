// hooks/useThemedStyles.ts
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useColors } from './useColors';

export const useThemedStyles = <T extends Record<string, any>>(
  createStyles: (colors: any) => T
): T => {
  const { colors } = useColors();
  
  return useMemo(() => {
    return StyleSheet.create(createStyles(colors));
  }, [colors]);
};