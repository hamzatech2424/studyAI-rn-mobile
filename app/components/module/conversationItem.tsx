import { useColors } from '@/hooks/useColors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemedStyles } from '../../../hooks/useThemedStyles';

const ConversationItem = ({ item ,onPress}: { item: any ,onPress:()=>void }) => {

    const styles = useThemedStyles(createStyles);
    const { colors } = useColors();

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            style={styles.mainContainer}
            onPress={onPress}
        >
            <View style={{ width: "95%", height: "90%", flexDirection: "row", alignItems: 'center' }}>
                <View style={{ width: 50, height: 50, backgroundColor: colors.secondaryColor, borderRadius: 50, justifyContent: "center", alignItems: "center" }}>
                    <Ionicons
                        name={"book"}
                        size={24}
                        color={colors.primaryColor}
                    />
                </View>

                <View style={{ flex: 1, paddingLeft: 10, paddingVertical: 10 }}>
                    <View>
                        <Text numberOfLines={1} style={{ fontSize: 14, fontFamily: 'Poppins-Medium', color: colors.text }}>{item.title}</Text>
                    </View>
                    <View style={{ marginTop: 0 }}>
                        <Text numberOfLines={1} style={{ fontSize: 14, fontFamily: 'Poppins-Regular', color: colors.primaryColor }}>{`${item?.lastMessageType?.toUpperCase()} : ${item?.lastMessage}`}</Text>
                    </View>
                    <View style={{ marginTop: 3 }}>
                        <Text style={{ fontSize: 11, fontFamily: 'Poppins-Regular', color: "grey",fontStyle:"italic", }}>{new Date(item?.lastMessageAt || item?.createdAt).toLocaleDateString()}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    )
}

export default ConversationItem

const createStyles = (colors: any) => StyleSheet.create({
    mainContainer: {
        width: "99%",
        alignSelf: "center",
        height: 90,
        borderRadius: 16,
        marginTop: 20,
        backgroundColor: colors.cardBackground,
        borderWidth: 1,
        borderColor: colors.primaryBorder,
        shadowColor: colors.shadow,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
        justifyContent: "center",
        alignItems: "center",
    }

})