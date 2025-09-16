// hooks/useColors.ts
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';

export const useColors = () => {
  const colorScheme = useColorScheme();
  
  // Return the appropriate color palette based on the system theme
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  
  return {
    colors,
    isDark: colorScheme === 'dark',
    colorScheme,
  };
};