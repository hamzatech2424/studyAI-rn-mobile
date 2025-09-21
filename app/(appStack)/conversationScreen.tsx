import useConversationController from '@/controllerHooks/useConversationController';
import { errorToast } from '@/utils';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { MotiView } from 'moti';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Linking, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import {
    GiftedChat
} from 'react-native-gifted-chat';
import Modal from 'react-native-modal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';
import PDFReader from 'rn-pdf-reader-js';
import { useColors } from '../../hooks/useColors';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import AbstractContentContainer from '../components/abstract/abstractContentContainer';


const { width, height } = Dimensions.get('window');

let fontSize = 14

const user = {
    _id: 1,
    name: 'Developer',
}


const ConversationScreen = () => {
    const insets = useSafeAreaInsets();
    const route = useRoute();
    const { chatId } = route.params;
    const styles = useThemedStyles(createStyles);
    const { colors, isDark } = useColors();
    const [inputText, setInputText] = useState("")
    const [isTyping, setIsTyping] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const { getSingleConversation, sendMessageHandler } = useConversationController();
    const [conversation, setConversation] = useState({});
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    const [pdfViewerError, setPdfViewerError] = useState(false);
    const [currentViewer, setCurrentViewer] = useState<'google' | 'mozilla' | 'direct'>('google');

    const getPdfViewerUrl = (fileUrl: string, viewer: 'google' | 'mozilla' | 'direct') => {
        switch (viewer) {
            case 'google':
                return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(fileUrl)}`;
            case 'mozilla':
                return `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(fileUrl)}`;
            case 'direct':
                return fileUrl;
            default:
                return fileUrl;
        }
    };

    const handlePdfError = () => {
        if (currentViewer === 'google') {
            setCurrentViewer('mozilla');
            setPdfViewerError(false);
        } else if (currentViewer === 'mozilla') {
            setCurrentViewer('direct');
            setPdfViewerError(false);
        } else {
            setPdfViewerError(true);
        }
    };

    console.log(conversation?.document?.fileUrl, "conversation==>>")


    useEffect(() => {
        if (chatId) {
            getSingleConversation(chatId)
                .then((result: any) => {
                    let messages = result?.data?.messages?.map((message: any) => ({
                        _id: message?.id,
                        text: message?.content,
                        createdAt: new Date(message?.createdAt),
                        user: message?.type == "ai" ? {
                            _id: 2,
                            name: "AI",
                        } : {
                            _id: 1,
                            name: "Developer",
                        },
                    }))
                    setConversation({ ...result?.data, messages })
                })
                .catch((error: any) => {
                    errorToast(error)
                })
                .finally(() => {
                    setLoading(false)
                })
        }
        else {
            setConversation({})
            setLoading(false)
        }
    }, [chatId])


    const renderComposer = () => {
        return (
            <View style={[styles.composerContainer, { backgroundColor: isDark ? colors.background : "white" }]}>
                <TextInput
                    style={{
                        fontSize: 14,
                        fontFamily: 'Poppins-Regular',
                        color: colors.text,
                        flex: 1,
                        minHeight: 45,
                        maxHeight: 80,
                        paddingRight: 5,
                        paddingTop: 12, // Add top padding
                        paddingBottom: 12, // Add bottom padding
                        textAlignVertical: "center",
                    }}
                    keyboardType="default"
                    returnKeyType="done"
                    placeholder="Type a message..."
                    placeholderTextColor={isDark ? "lightgrey" : colors.placeholder}
                    value={inputText}
                    onChangeText={setInputText}
                    multiline={true}
                    maxLength={1000}
                    blurOnSubmit={true}
                />
                <TouchableOpacity
                    style={styles.sendButton}
                    onPress={() => {
                        if (inputText.trim()) {
                            onSendNewMessage(chatId, inputText.trim())
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
    };


    const onSendNewMessage = (chatId: string, message: string) => {
        // Create user message once
        const userMessage = {
            _id: Math.round(Math.random() * 1000000),
            text: message,
            user: {
                _id: 1,
                name: "Developer",
            },
            createdAt: new Date()
        };

        // Store original state for rollback
        const originalState = conversation;

        // Optimistically update UI immediately
        setConversation(prev => ({
            ...prev,
            messages: [userMessage, ...prev.messages],
            lastMessage: message,
            lastMessageAt: new Date(),
            lastMessageType: "user"
        }));

        setIsTyping(true);

        // Send message to server
        sendMessageHandler(chatId, message, (result: any) => {
            // Transform server messages to GiftedChat format
            const serverUserMessage = {
                _id: result?.newMessages?.userMessage?.id,
                text: result?.newMessages?.userMessage?.content,
                user: {
                    _id: 1,
                    name: "Developer",
                },
                createdAt: new Date(result?.newMessages?.userMessage?.createdAt)
            };

            const serverAiMessage = {
                _id: result?.newMessages?.aiMessage?.id,
                text: result?.newMessages?.aiMessage?.content,
                user: {
                    _id: 2,
                    name: "AI",
                },
                createdAt: new Date(result?.newMessages?.aiMessage?.createdAt)
            };

            // Update conversation with server response
            setConversation(prev => {
                // Remove the optimistic user message (first message)
                const messagesWithoutOptimistic = prev.messages.slice(1);

                return {
                    ...prev,
                    messages: [serverAiMessage, serverUserMessage, ...messagesWithoutOptimistic],
                    lastMessage: result?.newMessages?.aiMessage?.content,
                    lastMessageAt: new Date(result?.newMessages?.aiMessage?.createdAt),
                    lastMessageType: "ai"
                };
            });

            setIsTyping(false);
        }, (error: any) => {
            console.log(error, "error")
            // Revert to original state on error
            setConversation(originalState);
            errorToast("Something went wrong");
            setIsTyping(false);
        });
    }


    const renderTypingIndicator = () => {
        if (!isTyping) return null;
        
        return (
            <MotiView
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                exit={{ opacity: 0, translateY: -10 }}
                transition={{
                    type: "spring",
                    duration: 500,
                }}
                style={styles.typingContainer}
            >
                <View style={styles.typingBubble}>
                    <LinearGradient
                        colors={isDark 
                            ? ['#4A5568', '#2D3748', '#4A5568']
                            : ['#E2E8F0', '#CBD5E0', '#E2E8F0']
                        }
                        style={styles.typingBubbleGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.typingContent}>
                            <View style={styles.typingAvatar}>
                                <LinearGradient
                                    colors={['#667eea', '#764ba2']}
                                    style={styles.typingAvatarGradient}
                                >
                                    <MaterialCommunityIcons
                                        name="robot"
                                        size={12}
                                        color="white"
                                    />
                                </LinearGradient>
                            </View>
                            
                            <View style={styles.typingDots}>
                                <MotiView
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        opacity: [0.4, 1, 0.4],
                                    }}
                                    transition={{
                                        type: "timing",
                                        duration: 1000,
                                        loop: true,
                                    }}
                                    style={[styles.typingDot, { backgroundColor: colors.primaryColor }]}
                                />
                                <MotiView
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        opacity: [0.4, 1, 0.4],
                                    }}
                                    transition={{
                                        type: "timing",
                                        duration: 1000,
                                        loop: true,
                                        delay: 200,
                                    }}
                                    style={[styles.typingDot, { backgroundColor: colors.primaryColor }]}
                                />
                                <MotiView
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        opacity: [0.4, 1, 0.4],
                                    }}
                                    transition={{
                                        type: "timing",
                                        duration: 1000,
                                        loop: true,
                                        delay: 400,
                                    }}
                                    style={[styles.typingDot, { backgroundColor: colors.primaryColor }]}
                                />
                            </View>
                            
                            <Text style={[styles.typingText, { color: colors.placeholder }]}>
                                AI is typing...
                            </Text>
                        </View>
                    </LinearGradient>
                </View>
            </MotiView>
        );
    };




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
                    <View
                        style={styles.headerGradient}
                    >
                        <View style={styles.headerContent}>
                            <TouchableOpacity
                                onPress={() => navigation.goBack()}
                                style={styles.backButton}
                                activeOpacity={0.7}
                            >
                                <LinearGradient
                                    colors={[colors.primaryColor, colors.primaryColor + 'CC']}
                                    style={styles.backButtonGradient}
                                >
                                    <Ionicons
                                        name="arrow-back"
                                        size={20}
                                        color="white"
                                    />
                                </LinearGradient>
                            </TouchableOpacity>

                            <View style={styles.titleContainer}>
                                <Text style={[styles.headerTitle, { color: colors.text }]}>
                                    Study AI Assistant
                                </Text>
                                <Text style={[styles.headerSubtitle, { color: colors.placeholder }]}>
                                    Powered by AI
                                </Text>
                            </View>

                            <TouchableOpacity
                                onPress={() => setIsModalVisible(true)}
                                style={styles.attachmentButton}
                                activeOpacity={0.7}
                            >
                                <LinearGradient
                                    colors={[colors.secondaryColor, colors.secondaryColor + 'CC']}
                                    style={styles.attachmentButtonGradient}
                                >
                                    <Ionicons
                                        name="document-attach"
                                        size={18}
                                        color={colors.primaryColor}
                                    />
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>

                        {/* Document Title Section */}
                        {loading ? (
                            <MotiView
                                from={{ opacity: 0.3 }}
                                animate={{ opacity: 0.7 }}
                                transition={{
                                    type: "timing",
                                    duration: 1000,
                                    loop: true,
                                    repeatReverse: true,
                                }}
                                style={styles.documentTitleSkeleton}
                            />
                        ) : (
                            <View style={styles.documentTitleContainer}>
                                <View style={styles.documentIconContainer}>
                                    <LinearGradient
                                        colors={['#667eea', '#764ba2']}
                                        style={styles.documentIconGradient}
                                    >
                                        <Ionicons
                                            name="document-text"
                                            size={16}
                                            color="white"
                                        />
                                    </LinearGradient>
                                </View>
                                <Text
                                    style={[styles.documentTitle, { color: colors.text }]}
                                    numberOfLines={1}
                                >
                                    {conversation?.title || "No Document"}
                                </Text>
                            </View>
                        )}
                    </View>

                    <GiftedChat
                        messages={conversation?.messages || []}
                        user={user}
                        keyboardShouldPersistTaps='never'
                        timeTextStyle={{
                            left: { color: "grey" },
                            right: { color: "white" },
                        }}
                        isTyping={isTyping}
                        infiniteScroll
                        bottomOffset={-insets.bottom}
                        locale={"en"}
                        showUserAvatar={false}
                        alwaysShowSend={false}
                        renderAvatar={(props) => {
                            const isLeft = props.position === 'left';
                            return (
                                <LinearGradient
                                    colors={['#667eea', '#764ba2']}
                                    style={{
                                        width: 25,
                                        height: 25,
                                        borderRadius: 17,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                >
                                    <MaterialCommunityIcons
                                        name={isLeft ? "robot" : "person-outline"}
                                        size={12}
                                        color="white"
                                    />
                                </LinearGradient>
                            );
                        }}
                        renderAvatarOnTop={true}
                        isScrollToBottomEnabled={false}
                        disableComposer={true}
                        renderComposer={renderComposer}
                        renderTypingIndicator={renderTypingIndicator}
                        listViewProps={{
                            showsVerticalScrollIndicator: false,
                            // backgroundColor: "red",
                            // width: "100%",
                        }}
                        renderBubble={(props) => {
                            const isLeft = props.position === 'left';
                            return (
                                <View 
                                style={[
                                    styles.bubbleContainer,
                                    isLeft ? styles.leftBubbleContainer : styles.rightBubbleContainer
                                ]}>
                                    <LinearGradient
                                        colors={isLeft
                                            ? isDark
                                                ? ['#4A5568', '#2D3748', '#4A5568']
                                                : ['#E2E8F0', '#CBD5E0', '#E2E8F0']
                                            : ['#667eea', '#764ba2']
                                        }
                                        style={[
                                            styles.messageBubble,
                                            isLeft ? styles.leftBubble : styles.rightBubble
                                        ]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                    >
                                        <Text style={[
                                            styles.messageText,
                                            { color: isLeft ? colors.text : 'white' }
                                        ]}>
                                            {props.currentMessage?.text}
                                        </Text>
                                        <Text style={[
                                            styles.messageTime,
                                            { color: isLeft ? colors.placeholder : 'rgba(255,255,255,0.7)' }
                                        ]}>
                                            {new Date(props.currentMessage?.createdAt).toLocaleTimeString('en-US', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </Text>
                                    </LinearGradient>
                                </View>
                            );
                        }}
                        ListEmptyComponent={
                            !loading && (!conversation?.messages || conversation.messages.length === 0) ? (
                                <View style={{
                                    flex: 1,
                                    justifyContent: "center",
                                    alignItems: "center",
                                    paddingVertical: 40
                                }}>
                                    <Text style={{
                                        color: colors.text,
                                        fontFamily: 'Poppins-Regular',
                                        fontSize: 16,
                                        opacity: 0.7
                                    }}>
                                        No messages yet. Start the conversation!
                                    </Text>
                                </View>
                            ) : null
                        }
                    />
                    {loading && (
                        <View style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            justifyContent: 'center',
                            alignItems: 'center',
                            zIndex: 1000
                        }}>
                            <ActivityIndicator size="large" color={colors.primaryColor} />
                            <Text style={{
                                marginTop: 5,
                                color: colors.primaryColor,
                                fontFamily: 'Poppins-Regular',
                                fontSize: 16
                            }}>
                                Loading...
                            </Text>
                        </View>
                    )}
                    <View style={{ height: insets.bottom }} />
                </AbstractContentContainer>
            </LinearGradient>

            <Modal
                isVisible={isModalVisible}
                onBackdropPress={() => setIsModalVisible(false)}
                backdropOpacity={0.1}
            >
                <View style={{ 
                    width: width * 0.9, 
                    height: height * 0.7, 
                    backgroundColor: 'white', 
                    borderRadius: 10,
                    overflow: 'hidden' // This is key to clip the WebView content
                }}>
                    {pdfViewerError ? (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                            <Text style={{ fontSize: 16, color: 'red', textAlign: 'center', marginBottom: 10 }}>
                                Failed to load PDF
                            </Text>
                            <Text style={{ fontSize: 14, color: 'gray', textAlign: 'center', marginBottom: 20 }}>
                                All PDF viewers failed to load this document.
                            </Text>
                            <TouchableOpacity
                                style={{ 
                                    padding: 10, 
                                    backgroundColor: colors.primaryColor, 
                                    borderRadius: 5,
                                    marginBottom: 10
                                }}
                                onPress={() => {
                                    setCurrentViewer('google');
                                    setPdfViewerError(false);
                                }}
                            >
                                <Text style={{ color: 'white' }}>Retry with Google Docs</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{ 
                                    padding: 10, 
                                    backgroundColor: colors.secondaryColor, 
                                    borderRadius: 5 
                                }}
                                onPress={() => {
                                    // Open in external browser as fallback
                                    Linking.openURL(conversation?.document?.fileUrl || '');
                                }}
                            >
                                <Text style={{ color: colors.primaryColor }}>Open in Browser</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        Platform.OS == "android" ? (
                            <View style={{ flex: 1, borderRadius: 10, overflow: 'hidden' }}>
                                <WebView
                                    source={{ 
                                        uri: getPdfViewerUrl(conversation?.document?.fileUrl || '', currentViewer)
                                    }}
                                    style={{ flex: 1 }}
                                    onError={handlePdfError}
                                    onHttpError={handlePdfError}
                                    startInLoadingState={true}
                                    renderLoading={() => (
                                        <View style={{ 
                                            position: 'absolute', 
                                            top: 0, 
                                            left: 0, 
                                            right: 0, 
                                            bottom: 0, 
                                            justifyContent: 'center', 
                                            alignItems: 'center',
                                            backgroundColor: 'rgba(255,255,255,0.8)',
                                            borderRadius: 10
                                        }}>
                                            <ActivityIndicator size="large" color={colors.primaryColor} />
                                            <Text style={{ marginTop: 10, color: colors.text, fontFamily: 'Poppins-Regular' }}>
                                                Loading PDF...
                                            </Text>
                                        </View>
                                    )}
                                />
                            </View>
                        ) : (
                            <View style={{ flex: 1, borderRadius: 10, overflow: 'hidden' }}>
                                <PDFReader
                                    source={{
                                        uri: conversation?.document?.fileUrl,
                                    }}
                                    style={{ flex: 1 }}
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
                        )
                    )}
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
        paddingVertical: 5,
        minHeight: 45,
    },

    sendButton: {
        width: 40,
        height: 40,
        backgroundColor: colors.primaryColor,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerGradient: {
        marginBottom: 10,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    backButton: {
        marginRight: 12,
    },
    backButtonGradient: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.primaryColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    titleContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'Poppins-Bold',
        marginBottom: 2,
    },
    headerSubtitle: {
        fontSize: 12,
        fontFamily: 'Poppins-Regular',
        opacity: 0.7,
    },
    attachmentButton: {
        marginLeft: 12,
    },
    attachmentButtonGradient: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    documentTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: "95%",
        alignSelf: "center",
    },
    documentTitleSkeleton: {
        height: 16,
        borderRadius: 8,
        backgroundColor: colors.placeholder,
        width: '100%',
    },
    documentIconContainer: {
        marginRight: 8,
    },
    documentIconGradient: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    documentTitle: {
        fontSize: 14,
        fontFamily: 'Poppins-Medium',
        flex: 1,
    },

    // Message Bubble Styles
    bubbleContainer: {
        maxWidth: '75%',
    },
    leftBubbleContainer: {
        alignSelf: 'flex-start',
        marginBottom:10
        // marginRight: 'auto',
    },
    rightBubbleContainer: {
        alignSelf: 'flex-end',
        marginBottom:10
        // marginLeft: 'auto',
        // marginRight: 0,
    },
    messageBubble: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 1,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    leftBubble: {
        borderTopLeftRadius: 6,
        borderTopRightRadius: 18,
        borderBottomLeftRadius: 18,
        borderBottomRightRadius: 18,
    },
    rightBubble: {
        borderTopLeftRadius: 18,
        borderTopRightRadius: 6,
        borderBottomLeftRadius: 18,
        borderBottomRightRadius: 18,
    },
    messageText: {
        fontSize: 15,
        fontFamily: 'Poppins-Regular',
        lineHeight: 22,
        marginBottom: 4,
    },
    messageTime: {
        fontSize: 11,
        fontFamily: 'Poppins-Medium',
        opacity: 0.8,
        textAlign: 'right',
    },
    typingContainer: {
        alignItems: 'flex-start',
        marginBottom: 10,
        marginHorizontal: 16,
    },
    typingBubble: {
        maxWidth: '75%',
        alignSelf: 'flex-start',
    },
    typingBubbleGradient: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 18,
        borderTopLeftRadius: 6,
        borderTopRightRadius: 18,
        borderBottomLeftRadius: 18,
        borderBottomRightRadius: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    typingContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    typingAvatar: {
        marginRight: 8,
    },
    typingAvatarGradient: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    typingDots: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 8,
    },
    typingDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginHorizontal: 2,
    },
    typingText: {
        fontSize: 12,
        fontFamily: 'Poppins-Regular',
        fontStyle: 'italic',
        opacity: 0.8,
    },
});

export default ConversationScreen;



