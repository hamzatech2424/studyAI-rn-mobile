import React from 'react';
import { Dimensions, StyleProp, View, ViewStyle } from 'react-native';

interface AbstractContentContainerProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>; 
}

const AbstractContentContainer = ({ children, style }: AbstractContentContainerProps) => {
  const SW = Dimensions.get('window').width;

  return (
    <View style={[{ width: SW - 40, alignSelf: "center" }, style]}>
      {children}
    </View>
  );
};

export default AbstractContentContainer;
