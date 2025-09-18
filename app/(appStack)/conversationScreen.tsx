import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useReducer, useState } from 'react';
import { Dimensions, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import {
    GiftedChat,
    IMessage,
    Send,
    SendProps
} from 'react-native-gifted-chat';
import Modal from 'react-native-modal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PDFReader from 'rn-pdf-reader-js';
import { useColors } from '../../hooks/useColors';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import AbstractContentContainer from '../components/abstract/abstractContentContainer';

const { width, height } = Dimensions.get('window');

let fontSize = 14

const date1 = dayjs()
const date2 = date1.clone().subtract(1, 'day')
const date3 = date2.clone().subtract(1, 'week')
const date = dayjs().subtract(1, 'year')

const user = {
    _id: 1,
    name: 'Developer',
}

const messagesData = [
    {
        _id: 9,
        text: '#awesome 3',
        createdAt: date1,
        user: {
            _id: 1,
            name: 'Developer',
        },
    },
    {
        _id: 8,
        text: '#awesome 2',
        createdAt: date1,
        user: {
            _id: 1,
            name: 'Developer',
        },
    },
    {
        _id: 7,
        text: '#awesome',
        createdAt: date1,
        user: {
            _id: 1,
            name: 'Developer',
        },
    },

    {
        _id: 5,
        text: 'Send me a picture!',
        createdAt: date2,
        user: {
            _id: 1,
            name: 'Developer',
        },
    },

    {
        _id: 3,
        text: 'Where are you?',
        createdAt: date3,
        user: {
            _id: 1,
            name: 'Developer',
        },
    },
    {
        _id: 2,
        text: 'Yes, and I use #GiftedChat!',
        createdAt: date3,
        user: {
            _id: 2,
            name: "AI",
        },
        sent: true,
        received: true,
    },
    {
        _id: 1,
        text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.',
        createdAt: date3,
        user: {
            _id: 1,
            name: 'Developer',
        },
    },

]

const earlierMessages = () => [
    {
        _id: Math.round(Math.random() * 1000000),
        text:
            'It uses the same design as React, letting you compose a rich mobile UI from declarative components https://facebook.github.io/react-native/',
        createdAt: date,
        user: {
            _id: 1,
            name: 'Developer',
        },
    },
    {
        _id: Math.round(Math.random() * 1000000),
        text:
            'It uses the same design as React, letting you compose a rich mobile UI from declarative components https://facebook.github.io/react-native/',
        createdAt: date,
        user: {
            _id: 1,
            name: 'Developer',
        },
    },
    {
        _id: Math.round(Math.random() * 1000000),
        text:
            'It uses the same design as React, letting you compose a rich mobile UI from declarative components https://facebook.github.io/react-native/',
        createdAt: date,
        user: {
            _id: 1,
            name: 'Developer',
        },
    },
    {
        _id: Math.round(Math.random() * 1000000),
        text:
            'It uses the same design as React, letting you compose a rich mobile UI from declarative components https://facebook.github.io/react-native/',
        createdAt: date,
        user: {
            _id: 1,
            name: 'Developer',
        },
    },
    {
        _id: Math.round(Math.random() * 1000000),
        text: 'React Native lets you build mobile apps using only JavaScript',
        createdAt: date,
        user: {
            _id: 1,
            name: 'Developer',
        },
    },
    {
        _id: Math.round(Math.random() * 1000000),
        text: 'React Native lets you build mobile apps using only JavaScript',
        createdAt: date,
        user: {
            _id: 1,
            name: 'Developer',
        },
    },
    {
        _id: Math.round(Math.random() * 1000000),
        text: 'React Native lets you build mobile apps using only JavaScript',
        createdAt: date,
        user: {
            _id: 1,
            name: 'Developer',
        },
    },
    {
        _id: Math.round(Math.random() * 1000000),
        text: 'React Native lets you build mobile apps using only JavaScript',
        createdAt: date,
        user: {
            _id: 1,
            name: 'Developer',
        },
    },
    {
        _id: Math.round(Math.random() * 1000000),
        text: 'React Native lets you build mobile apps using only JavaScript',
        createdAt: date,
        user: {
            _id: 1,
            name: 'Developer',
        },
    },
    {
        _id: Math.round(Math.random() * 1000000),
        text: 'React Native lets you build mobile apps using only JavaScript',
        createdAt: date,
        user: {
            _id: 1,
            name: 'Developer',
        },
    },
    {
        _id: Math.round(Math.random() * 1000000),
        text: 'React Native lets you build mobile apps using only JavaScript',
        createdAt: date,
        user: {
            _id: 1,
            name: 'Developer',
        },
    },
    {
        _id: Math.round(Math.random() * 1000000),
        text: 'React Native lets you build mobile apps using only JavaScript',
        createdAt: date,
        user: {
            _id: 1,
            name: 'Developer',
        },
    },
    {
        _id: Math.round(Math.random() * 1000000),
        text: 'React Native lets you build mobile apps using only JavaScript',
        createdAt: date,
        user: {
            _id: 1,
            name: 'Developer',
        },
    },
    {
        _id: Math.round(Math.random() * 1000000),
        text: 'React Native lets you build mobile apps using only JavaScript',
        createdAt: date,
        user: {
            _id: 1,
            name: 'Developer',
        },
    },
    {
        _id: Math.round(Math.random() * 1000000),
        text: 'This is a system message.',
        createdAt: date,
        system: true,
    },
]

enum ActionKind {
    SEND_MESSAGE = 'SEND_MESSAGE',
    LOAD_EARLIER_MESSAGES = 'LOAD_EARLIER_MESSAGES',
    LOAD_EARLIER_START = 'LOAD_EARLIER_START',
    SET_IS_TYPING = 'SET_IS_TYPING',
    // LOAD_EARLIER_END = 'LOAD_EARLIER_END',
}

function reducer(state: any, action: any) {
    switch (action.type) {
        case ActionKind.SEND_MESSAGE: {
            return {
                ...state,
                step: state.step + 1,
                messages: action.payload,
            }
        }
        case ActionKind.LOAD_EARLIER_MESSAGES: {
            return {
                ...state,
                loadEarlier: true,
                isLoadingEarlier: false,
                messages: action.payload,
            }
        }
        case ActionKind.LOAD_EARLIER_START: {
            return {
                ...state,
                isLoadingEarlier: true,
            }
        }
        case ActionKind.SET_IS_TYPING: {
            return {
                ...state,
                isTyping: action.payload,
            }
        }
    }
}

const ConversationScreen = () => {
    const insets = useSafeAreaInsets();
    const styles = useThemedStyles(createStyles);
    const { colors, isDark } = useColors();
    const [inputText, setInputText] = useState("")
    const [state, dispatch] = useReducer(reducer, {
        messages: messagesData,
        step: 0,
        loadEarlier: true,
        isLoadingEarlier: false,
        isTyping: false,
    })
    const [isModalVisible, setIsModalVisible] = useState(false);


    const onSend = useCallback(
        (messages: any[]) => {
            const sentMessages = [{ ...messages[0], sent: true, received: true }]
            const newMessages = GiftedChat.append(
                state.messages,
                sentMessages,
                Platform.OS !== 'web'
            )

            //   dispatch({ type: ActionKind.SEND_MESSAGE, payload: newMessages })
        },
        [dispatch, state.messages]
    )

    const renderQuickReplySend = useCallback(() => {
        return <Text>{' custom send =>'}</Text>
    }, [])

    const setIsTyping = useCallback(
        (isTyping: boolean) => {
            dispatch({ type: ActionKind.SET_IS_TYPING, payload: isTyping })
        },
        [dispatch]
    )


    const onSendFromUser = useCallback(
        (messages: IMessage[] = []) => {
            const createdAt = new Date()
            const messagesToUpload = messages.map(message => ({
                ...message,
                user,
                createdAt,
                _id: Math.round(Math.random() * 1000000),
            }))

            onSend(messagesToUpload)
        },
        [onSend]
    )


    const renderSend = useCallback((props: SendProps<IMessage>) => {
        return (
            <Send {...props} containerStyle={{ justifyContent: 'center', paddingHorizontal: 10 }}>
                <MaterialIcons size={30} color={colors.primaryColor} name={'send'} />
            </Send>
        )
    }, [])

    const renderComposer = useCallback((props) => {
        return (
            <View style={[styles.composerContainer, {backgroundColor:isDark ? colors.background : "white"}]}>
                <TextInput
                    style={{
                        flex:1,
                        fontSize:16,
                        fontFamily:'Poppins-Regular',
                        color:colors.text,
                        backgroundColor:"pink",
                        height:45,
                        
                    }}
                    placeholder="Type a message..."
                    placeholderTextColor={isDark ? "lightgrey" : colors.placeholder}
                    value={inputText}
                    onChangeText={setInputText}
                    multiline
                    maxLength={1000}
                />
                <TouchableOpacity
                    style={styles.sendButton}
                    onPress={() => {
                        if (inputText.trim()) {
                            onSend([{
                                _id: Math.round(Math.random() * 1000000),
                                text: inputText.trim(),
                                createdAt: new Date(),
                                user: user,
                            }]);
                            setInputText('');
                        }
                    }}
                >
                    <MaterialIcons
                        name="send"
                        size={24}
                        color={"white"}
                    />
                </TouchableOpacity>
            </View>
        );
    }, [inputText, setInputText, onSend, user, colors, isDark]);


    return (
        <View style={styles.container}>
            <StatusBar style={"auto"} />
            <LinearGradient
                colors={isDark
                    ? [colors.background, colors.background]
                    : [colors.surface, colors.background]
                }
                style={styles.gradient}
            >
                <AbstractContentContainer style={{ flex: 1 }}>
                    <View style={{ height: insets.top }} />
                    <View style={{ flexDirection: "row", height: 40 }}>
                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={{ width: 30, justifyContent: "center", alignItems: "flex-start" }}>
                            <Ionicons
                                name="arrow-back-outline"
                                size={24}
                                color={colors.primaryColor}
                            />
                        </TouchableOpacity>
                        <View style={{ flex: 1, paddingLeft: 5, justifyContent: 'center' }}>
                            <Text style={{ fontSize: 20, fontFamily: 'Poppins-SemiBold', color: colors.text }}>Study AI Assistant</Text>
                        </View>
                        <View style={{ width: 50 }} />
                    </View>

                    <View style={{ height: 30, flexDirection: "row", alignItems: "flex-start", paddingHorizontal: 5 }} >
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 14, fontFamily: 'Poppins-Regular', color: colors.text }} numberOfLines={1} >Grandma's Bag of Stories by Sudha Murthy</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => setIsModalVisible(true)}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            style={{ width: 30, height: "100%", justifyContent: "flex-start", alignItems: "flex-end" }}>
                            <Ionicons
                                name={"document-attach"}
                                size={20}
                                color={colors.primaryColor}
                            />
                        </TouchableOpacity>
                    </View>

                    <GiftedChat
                        messages={state.messages}
                        onSend={onSend}
                        user={user}
                        keyboardShouldPersistTaps='never'
                        timeTextStyle={{
                            left: { color: "grey" },
                            right: { color: "white" },
                        }}
                        isTyping={state.isTyping}
                        infiniteScroll
                        bottomOffset={-insets.bottom}
                        placeholder="Type a message"
                        disableComposer={true} // Disable default composer
                        locale={"en"}
                        showUserAvatar={false}
                        alwaysShowSend={false} // Disable default send button
                        renderAvatar={() => <View style={{ width: 0 }} />}
                        isScrollToBottomEnabled={false}

                        // Add your custom composer
                        renderComposer={renderComposer}

                        listViewProps={{
                            showsVerticalScrollIndicator: false,
                        }}
                        renderBubble={(props) => {
                            const isLeft = props.position === 'left';
                            return (
                                <View
                                    style={[
                                        {
                                            maxWidth: '70%',
                                            paddingHorizontal: 10,
                                            paddingVertical: 5,
                                            borderRadius: 16,
                                            marginVertical: 4,
                                        },
                                        isLeft
                                            ? {
                                                backgroundColor: isDark ? "grey" : "lightgrey",
                                                borderTopLeftRadius: 2,
                                                borderTopRightRadius: 16,
                                            }
                                            : {
                                                backgroundColor: colors.primaryColor,
                                                borderTopLeftRadius: 16,
                                                borderTopRightRadius: 2,
                                            }
                                    ]}
                                >
                                    <Text
                                        style={{
                                            color: isLeft ? colors.text : 'white',
                                            fontSize: 14, // Your custom font size
                                            fontFamily: 'Poppins-Regular',
                                            lineHeight: 20,
                                        }}
                                    >
                                        {props.currentMessage?.text}
                                    </Text>
                                    <Text
                                        style={{
                                            color: isLeft ? colors.text : 'white',
                                            fontSize: 10,
                                            opacity: 0.7,
                                            marginTop: 4,
                                            textAlign: isLeft ? 'left' : 'right',
                                        }}
                                    >
                                        {new Date(props.currentMessage?.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </View>
                            );
                        }}
                    />
                    <View style={{ height: insets.bottom }} />
                </AbstractContentContainer>
            </LinearGradient>

            <Modal
                isVisible={isModalVisible}
                onBackdropPress={() => setIsModalVisible(false)}
            >
                <View style={{ width: width * 0.9, height: height * 0.7, backgroundColor: 'white', borderRadius: 10 }}>
                    <PDFReader
                        source={{
                            uri: "https://sdtwsujhisvzvopxdnyu.supabase.co/storage/v1/object/public/mediaBucket/pdfs/1758104061934-Grandma's%20Bag%20of%20Stories%20by%20Sudha%20Murthy.pdf",
                        }}
                        style={{ flex: 1, padding: 20 }}
                        withPinchZoom
                        maximumPinchZoomScale={2}
                        onLoad={() => {
                            console.log("onLoad")
                        }}
                        onLoadEnd={() => {
                            console.log("onLoadEnd")
                        }}
                        onError={() => {
                            console.log("onError")
                        }}
                    />
                </View>
            </Modal>
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
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoBackground: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.secondaryColor,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        shadowColor: colors.shadow,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    logoText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
        fontFamily: 'Poppins-Bold',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
    },
    welcomeContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    welcomeTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.text,
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 12,
        fontFamily: 'Poppins-Bold',
    },
    welcomeSubtitle: {
        fontSize: 16,
        color: colors.text,
        textAlign: 'center',
        opacity: 0.7,
        fontFamily: 'Poppins-Regular',
        lineHeight: 22,
        paddingHorizontal: 20,
    },
    infoContainer: {
        backgroundColor: colors.cardBackground,
        borderRadius: 16,
        padding: 24,
        marginBottom: 16,
        shadowColor: colors.shadow,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 16,
        fontFamily: 'Poppins-SemiBold',
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    infoText: {
        fontSize: 14,
        color: colors.text,
        marginLeft: 12,
        fontFamily: 'Poppins-Regular',
    },
    tokenButton: {
        marginTop: 12,
    },
    composerContainer: {
        borderTopWidth: 1,
        borderTopColor: colors.border,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical:5,
    },
    composerTextInput: {
        flex: 1,
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        color: colors.text,
        maxHeight: 80,
        textAlignVertical: 'top',
    },
    sendButton: {
        width: 40,
        height: 40,
        backgroundColor: colors.primaryColor,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ConversationScreen;



