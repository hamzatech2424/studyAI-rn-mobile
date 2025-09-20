import { BASE_URL } from '@/proxy';
import { TOKEN_KEY, useApiClient } from '@/services/apiClient';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { MotiView } from 'moti';
import React, { useCallback, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '../../hooks/useColors';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import CustomButton from '../components/abstract/abstractButton';
import AbstractContentContainer from '../components/abstract/abstractContentContainer';

const { width, height } = Dimensions.get('window');


const NewChatScreen = () => {
    const insets = useSafeAreaInsets();
    const styles = useThemedStyles(createStyles);
    const { colors, isDark } = useColors();
    const apiClient = useApiClient();
    const { getToken } = useAuth();
    
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadComplete, setUploadComplete] = useState(false);
    const [uploadMessage, setUploadMessage] = useState('');
    const [conversationId, setConversationId] = useState(null);
    const navigation = useNavigation();
    
    // Update the animated progress initialization:
    const animatedProgress = useRef(new Animated.Value(0)).current;

    // Add these refs to track state
    const progressRef = useRef(0);
    const messageRef = useRef('');
    const uploadingRef = useRef(false);

    // Create a state update function that forces re-renders
    const forceUpdate = useState({})[1];

    // Update the updateState function to include progress bar animation:
    const updateState = useCallback((updates) => {
        console.log('🔄 Updating state:', updates);
        
        if (updates.progress !== undefined) {
            progressRef.current = updates.progress;
            setUploadProgress(updates.progress);
            
            // Animate the progress bar to the new value
            Animated.timing(animatedProgress, {
                toValue: updates.progress / 100,
                duration: 300,
                useNativeDriver: false,
            }).start();
        }
        
        if (updates.message !== undefined) {
            messageRef.current = updates.message;
            setUploadMessage(updates.message);
        }
        
        if (updates.uploading !== undefined) {
            uploadingRef.current = updates.uploading;
            setIsUploading(updates.uploading);
        }
        
        // Force re-render
        forceUpdate({});
    }, [animatedProgress]); // Add animatedProgress to dependencies

    const handleFilePicker = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const file = result.assets[0];
                setSelectedFile(file);
                
                // Start upload with progress tracking
                startUpload(file);
            }
        } catch (error) {
            console.error('Error picking document:', error);
            Alert.alert('Error', 'Failed to pick document. Please try again.');
        }
    };

    const getStoredToken = async () => {
        let token = await AsyncStorage.getItem(TOKEN_KEY);
        if (!token) {
            token = await getToken({ template: "longer_lived" });
            if (token) {
                await AsyncStorage.setItem(TOKEN_KEY, token);
            }
        }
        return token;
    };


    const startUpload = async (file) => {
        try {
            // Reset animated progress
            animatedProgress.setValue(0);
            
            // Reset states
            updateState({
                uploading: true,
                progress: 0,
                message: 'Preparing upload...'
            });

          const token = await getStoredToken();
          const formData = new FormData();
          formData.append("file", {
            uri: file.uri,
            type: file.mimeType || "application/pdf",
            name: file.name,
          });
      
          return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", `${BASE_URL}/api/document/upload-stream`);
            xhr.setRequestHeader("Authorization", `Bearer ${token}`);
            xhr.setRequestHeader("Accept", "text/event-stream");
      
            // Local upload progress (file → server)
            xhr.upload.onprogress = (event) => {
              if (event.lengthComputable) {
                const progress = Math.round((event.loaded / event.total) * 100);
                        console.log(`📤 Upload progress: ${progress}%`);
                        updateState({ 
                            progress: Math.min(progress, 25), // Cap at 25% for file upload
                            message: `Uploading file... ${progress}%` 
                        });
              }
            };
      
            // Server-sent events (processing progress)
            let buffer = "";
            xhr.onprogress = () => {
              const chunk = xhr.responseText.substring(buffer.length);
              buffer += chunk;
      
              const lines = buffer.split("\n");
              for (const line of lines) {
                if (line.startsWith("data: ")) {
                  try {
                    const data = JSON.parse(line.slice(6));
                                console.log("�� Server progress:", data);
                                
                    if (data.progress) {
                                    // Map server progress to 25-100% range
                                    const mappedProgress = Math.min(25 + (data.progress * 0.75), 100);
                      updateState({
                                        progress: mappedProgress,
                                        message: data.message || `Processing... ${data.progress}%`,
                      });
                                    
                                    // Update progress bar animation
                                    // updateProgressBar(mappedProgress); // REMOVED
                    }
                                
                    if (data.success) {
                                    console.log("🎉 Upload successful:", data);
                                    updateState({ 
                                        uploading: false, 
                                        progress: 100, 
                                        message: data.message || "Upload completed!" 
                                    });
                      setUploadComplete(true);
                      setConversationId(data.chat?.id);
                      resolve(data);
                    }
                                
                    if (data.error) {
                                    console.error("❌ Server error:", data.error);
                                    updateState({
                                        uploading: false,
                                        message: 'Upload failed'
                                    });
                      reject(new Error(data.error.message || "Upload failed"));
                    }
                  } catch (e) {
                                console.error("❌ Parse error:", e, "Line:", line);
                  }
                }
              }
            };
      
                xhr.onerror = () => {
                    console.error("❌ Network error");
                    updateState({
                        uploading: false,
                        message: 'Network error'
                    });
                    reject(new Error("Network error"));
                };

                xhr.onload = () => {
                    if (xhr.status !== 200) {
                        console.error("❌ HTTP error:", xhr.status);
                        updateState({
                            uploading: false,
                            message: `HTTP error: ${xhr.status}`
                        });
                        reject(new Error(`HTTP error: ${xhr.status}`));
                    }
                };

                console.log("🚀 Starting upload...");
            xhr.send(formData);
          });

        } catch (err) {
          console.error("❌ Upload failed:", err);
            updateState({
                uploading: false,
                message: 'Upload failed'
            });
          Alert.alert("Upload Error", err.message);
        }
      };

    // Update the progress display to show detailed progress:
    // const updateProgressBar = (progress) => { // REMOVED
    //     console.log(`🎯 Updating progress bar to: ${progress}%`);
        
    //     Animated.timing(animatedProgress, {
    //         toValue: progress / 100,
    //         duration: 500,
    //         useNativeDriver: false,
    //     }).start();
    // };

    const handleUploadSuccess = (data) => {
        setIsUploading(false);
        setUploadComplete(true);
        setUploadMessage(data.message || 'Upload completed successfully!');
        
        // Extract chat ID from the response
        const chatId = data.chat?.id;
        if (chatId) {
            setConversationId(chatId);
        }
    };

    const handleUploadError = (errorMessage) => {
        setIsUploading(false);
        setUploadComplete(false);
        setUploadMessage('Upload failed');
        
        // Handle different error formats
        let displayMessage = errorMessage;
        if (typeof errorMessage === 'object') {
            displayMessage = errorMessage.message || errorMessage.description || 'Upload failed';
        }
        
        Alert.alert('Upload Error', displayMessage);
    };

    const handleStartConversation = () => {
        if (uploadComplete && conversationId) {
            // Navigate to conversation screen with the created conversation
            navigation.navigate('conversationScreen', { chatId: conversationId })
        }
    };

    // Update the getProgressStage function with user-friendly messages:
    const getProgressStage = (progress) => {
        if (progress < 10) return "Preparing...";
        if (progress < 25) return "Uploading file...";
        if (progress < 35) return "File received...";
        if (progress < 50) return "Reading document...";
        if (progress < 70) return "Analyzing content...";
        if (progress < 85) return "Organizing information...";
        if (progress < 95) return "Preparing for chat...";
        if (progress < 100) return "Almost ready...";
        return "Complete!";
    };

    // Add this helper function:
    const getProgressDescription = (progress) => {
        if (progress < 25) return "Your file is being uploaded securely...";
        if (progress < 50) return "AI is reading and understanding your document...";
        if (progress < 75) return "Organizing information for better conversations...";
        if (progress < 95) return "Preparing your personalized AI assistant...";
        return "Ready to start chatting!";
    };


    return (
        <View style={styles.container}>
            <StatusBar style={isDark ? "light" : "dark"} />
            <LinearGradient
                colors={isDark
                    ? [colors.background, colors.background]
                    : [colors.surface, colors.background]
                }
                style={styles.gradient}
            >
                <AbstractContentContainer style={{ flex: 1 }}>
                    <View style={{ height: insets.top }} />
                    
                    {/* Header */}
                    <View style={{ flexDirection: "row", height: 40, alignItems: 'center' }}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={{ width: 30, justifyContent: "center", alignItems: "flex-start" }}>
                            <Ionicons
                                name="arrow-back-outline"
                                size={24}
                                color={colors.primaryColor}
                            />
                        </TouchableOpacity>
                        <View style={{ flex: 1, paddingLeft: 5, justifyContent: 'center' }}>
                            <Text style={{ fontSize: 20, fontFamily: 'Poppins-SemiBold', color: colors.text }}>
                                New Chat
                            </Text>
                        </View>
                        <View style={{ width: 50 }} />
                    </View>

                    {/* Main Content */}
                    <View style={styles.contentContainer}>
                        
                        {/* Upload Area */}
                        <MotiView
                            from={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                                type: "spring",
                                duration: 600,
                            }}
                            style={styles.uploadContainer}
                        >
                            {!selectedFile ? (
                                <TouchableOpacity
                                    style={[
                                        styles.uploadArea,
                                        { borderColor: colors.primaryBorder }
                                    ]}
                                    onPress={handleFilePicker}
                                    activeOpacity={0.8}
                                >
                                    <MotiView
                                        from={{ scale: 1 }}
                                        animate={{ scale: [1, 1.1, 1] }}
                                        transition={{
                                            type: "timing",
                                            duration: 2000,
                                            loop: true,
                                        }}
                                    >
                                        <View style={[styles.uploadIcon, { backgroundColor: colors.secondaryColor }]}>
                                            <Ionicons
                                                name="cloud-upload-outline"
                                                size={40}
                                                color={colors.primaryColor}
                                            />
                                        </View>
                                    </MotiView>
                                    
                                    <Text style={[styles.uploadTitle, { color: colors.text }]}>
                                        Upload PDF Document
                                    </Text>
                                    <Text style={[styles.uploadSubtitle, { color: colors.placeholder }]}>
                                        Upload a PDF and start an intelligent conversation about its content
                                    </Text>
                                    
                                    <View style={styles.supportedFormats}>
                                        <Text style={[styles.formatText, { color: colors.placeholder }]}>
                                            Supported: PDF files
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ) : (
                                <MotiView
                                    from={{ opacity: 0, translateY: 20 }}
                                    animate={{ opacity: 1, translateY: 0 }}
                                    transition={{
                                        type: "spring",
                                        duration: 500,
                                    }}
                                    style={styles.fileSelectedContainer}
                                >
                                    {/* File Info */}
                                    <View style={[styles.fileInfo, { backgroundColor: colors.cardBackground }]}>
                                        <View style={[styles.fileIcon, { backgroundColor: colors.secondaryColor }]}>
                                            <Ionicons
                                                name="document-text"
                                                size={24}
                                                color={colors.primaryColor}
                                            />
                                        </View>
                                        <View style={styles.fileDetails}>
                                            <Text style={[styles.fileName, { color: colors.text }]} numberOfLines={2}>
                                                {selectedFile.name}
                                            </Text>
                                            <Text style={[styles.fileSize, { color: colors.placeholder }]}>
                                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Enhanced Progress Section */}
                                    {(uploadingRef.current || isUploading) && (
                                        <View style={[styles.progressContainer, { 
                                            backgroundColor: colors.cardBackground, 
                                            padding: 16, 
                                            borderRadius: 12, 
                                            margin: 16 
                                        }]}>
                                            {/* Progress Header */}
                                            <View style={styles.progressHeader}>
                                                <Text style={[styles.progressStage, { color: colors.primaryColor }]}>
                                                    {getProgressStage(progressRef.current)}
                                            </Text>
                                                <Text style={[styles.progressPercentage, { color: colors.primaryColor }]}>
                                                    {progressRef.current}%
                                                </Text>
                                            </View>
                                            
                                            {/* Progress Message */}
                                            <Text style={[styles.progressText, { 
                                                color: colors.text, 
                                                fontSize: 14, 
                                                marginBottom: 12,
                                                textAlign: 'center'
                                            }]}>
                                                {messageRef.current || getProgressDescription(progressRef.current)}
                                            </Text>
                                            
                                            {/* Animated Progress Bar */}
                                            <View style={[styles.progressBarContainer, { 
                                                backgroundColor: colors.border, 
                                                height: 8,
                                                borderRadius: 4,
                                                marginBottom: 16,
                                                overflow: 'hidden' // Add this to contain the shimmer
                                            }]}>
                                                <Animated.View style={[
                                                    styles.progressBar,
                                                    {
                                                        backgroundColor: colors.primaryColor,
                                                        height: 8,
                                                        width: animatedProgress.interpolate({
                                                            inputRange: [0, 1],
                                                            outputRange: ['0%', '100%'],
                                                        }),
                                                        borderRadius: 4
                                                    }
                                                ]} />
                                                
                                                {/* Shimmer effect */}
                                                {/* {isUploading && (
                                                    <Animated.View style={[
                                                        styles.progressShimmer,
                                                        {
                                                            position: 'absolute',
                                                            top: 0,
                                                            left: 0,
                                                            height: '100%',
                                                            backgroundColor: 'rgba(255,255,255,0.4)',
                                                            width: animatedProgress.interpolate({
                                                                inputRange: [0, 1],
                                                                outputRange: ['0%', '100%'],
                                                            }),
                                                            borderRadius: 4
                                                        }
                                                    ]} />
                                                )} */}
                                            </View>
                                            
                                            {/* Progress Steps */}
                                            <View style={styles.progressSteps}>
                                                {[
                                                    { stage: 25, label: "Upload", icon: "cloud-upload" },
                                                    { stage: 50, label: "Read", icon: "document-text" },
                                                    { stage: 75, label: "Analyze", icon: "analytics" },
                                                    { stage: 100, label: "Ready", icon: "checkmark" }
                                                ].map((step, index) => (
                                                    <View key={index} style={styles.progressStep}>
                                                        <MotiView
                                                            animate={{
                                                                scale: progressRef.current >= step.stage ? 1.2 : 1,
                                                                opacity: progressRef.current >= step.stage ? 1 : 0.5,
                                                            }}
                                                            transition={{
                                                                type: "spring",
                                                                duration: 400,
                                                            }}
                                                        >
                                                            <MotiView
                                                                animate={{
                                                                    scale: progressRef.current >= step.stage ? [1, 1.1, 1] : 1,
                                                                }}
                                                                transition={{
                                                                    type: "timing",
                                                                    duration: 1000,
                                                                    loop: progressRef.current >= step.stage ? true : false,
                                                                }}
                                                                style={[
                                                                    styles.stepDot,
                                                                    { 
                                                                        backgroundColor: progressRef.current >= step.stage 
                                                                            ? colors.primaryColor 
                                                                            : colors.border 
                                                                    }
                                                                ]}
                                                            >
                                                                <Ionicons
                                                                    name={step.icon as any}
                                                                    size={12}
                                                                    color={progressRef.current >= step.stage ? 'white' : colors.placeholder}
                                                                />
                                                            </MotiView>
                                                        </MotiView>
                                                        <Text style={[
                                                            styles.stepLabel,
                                                            { 
                                                                color: progressRef.current >= step.stage 
                                                                    ? colors.primaryColor 
                                                                    : colors.placeholder 
                                                            }
                                                        ]}>
                                                            {step.label}
                                                        </Text>
                                                    </View>
                                                ))}
                                            </View>
                                            
                                            {/* Debug info - remove in production */}
                                            {/* <Text style={{ color: colors.placeholder, fontSize: 10, marginTop: 8, textAlign: 'center' }}>
                                                Debug: {uploadingRef.current ? 'Uploading' : 'Idle'} | Progress: {progressRef.current}%
                                            </Text> */}
                                        </View>
                                    )}

                                    {/* Upload Complete */}
                                    {uploadComplete && (
                                        <MotiView
                                            from={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{
                                                type: "spring",
                                                duration: 500,
                                            }}
                                            style={styles.uploadCompleteContainer}
                                        >
                                            <View style={[styles.successIcon, { backgroundColor: colors.success || '#4CAF50' }]}>
                                                <Ionicons
                                                    name="checkmark"
                                                    size={24}
                                                    color="white"
                                                />
                                            </View>
                                            <Text style={[styles.successText, { color: colors.text }]}>
                                                {uploadMessage}
                                            </Text>
                                        </MotiView>
                                    )}
                                </MotiView>
                            )}
                        </MotiView>

                        {/* Instructions */}
                        {!selectedFile && (
                            <MotiView
                                from={{ opacity: 0, translateY: 30 }}
                                animate={{ opacity: 1, translateY: 0 }}
                                transition={{
                                    delay: 300,
                                    type: "spring",
                                    duration: 600,
                                }}
                                style={styles.instructionsContainer}
                            >
                                <View style={styles.instructionItem}>
                                    <View style={[styles.instructionIcon, { backgroundColor: colors.secondaryColor }]}>
                                        <Text style={[styles.instructionNumber, { color: colors.primaryColor }]}>1</Text>
                                    </View>
                                    <Text style={[styles.instructionText, { color: colors.text }]}>
                                        Upload your PDF document securely
                                    </Text>
                                </View>
                                
                                <View style={styles.instructionItem}>
                                    <View style={[styles.instructionIcon, { backgroundColor: colors.secondaryColor }]}>
                                        <Text style={[styles.instructionNumber, { color: colors.primaryColor }]}>2</Text>
                                    </View>
                                    <Text style={[styles.instructionText, { color: colors.text }]}>
                                        AI analyzes and understands the content
                                    </Text>
                                </View>
                                
                                <View style={styles.instructionItem}>
                                    <View style={[styles.instructionIcon, { backgroundColor: colors.secondaryColor }]}>
                                        <Text style={[styles.instructionNumber, { color: colors.primaryColor }]}>3</Text>
                                    </View>
                                    <Text style={[styles.instructionText, { color: colors.text }]}>
                                        Start an intelligent conversation
                                    </Text>
                                </View>
                            </MotiView>
                        )}
                    </View>

                    {/* Start Button */}
                    {uploadComplete && (
                        <MotiView
                            from={{ opacity: 0, translateY: 50 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{
                                type: "spring",
                                duration: 600,
                            }}
                            style={styles.buttonContainer}
                        >
                            <CustomButton
                                title="Start Conversation"
                                onPress={handleStartConversation}
                            />
                        </MotiView>
                    )}
                    
                    <View style={{ height: insets.bottom }} />
                </AbstractContentContainer>
            </LinearGradient>
            {/* Add this temporarily for debugging - remove after testing
            {isUploading && (
                <View style={{ 
                    position: 'absolute', 
                    top: 100, 
                    left: 20, 
                    right: 20, 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    padding: 10, 
                    borderRadius: 5,
                    zIndex: 1000
                }}>
                    <Text style={{ color: 'white', fontSize: 12 }}>
                        DEBUG: Progress: {uploadProgress}% | Message: {uploadMessage}
                    </Text>
                </View>
            )} */}
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
    contentContainer: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
    },
    uploadContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    uploadArea: {
        width: '100%',
        height: 280,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    uploadIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    uploadTitle: {
        fontSize: 20,
        fontFamily: 'Poppins-SemiBold',
        marginBottom: 8,
        textAlign: 'center',
    },
    uploadSubtitle: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
    },
    supportedFormats: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: colors.surface,
    },
    formatText: {
        fontSize: 12,
        fontFamily: 'Poppins-Regular',
    },
    fileSelectedContainer: {
        width: '100%',
        alignItems: 'center',
    },
    fileInfo: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: colors.primaryBorder,
    },
    fileIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    fileDetails: {
        flex: 1,
    },
    fileName: {
        fontSize: 16,
        fontFamily: 'Poppins-Medium',
        marginBottom: 4,
    },
    fileSize: {
        fontSize: 12,
        fontFamily: 'Poppins-Regular',
    },
    progressContainer: {
        width: '100%',
        marginBottom: 20,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    progressStage: {
        fontSize: 14,
        fontFamily: 'Poppins-SemiBold',
    },
    progressPercentage: {
        fontSize: 14,
        fontFamily: 'Poppins-Bold',
    },
    progressText: {
        fontSize: 12,
        fontFamily: 'Poppins-Regular',
        marginBottom: 12,
        textAlign: 'center',
        opacity: 0.8,
    },
    progressBarContainer: {
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 16,
    },
    progressBar: {
        height: '100%',
        borderRadius: 3,
    },
    progressShimmer: {
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        borderRadius: 4,
    },
    progressSteps: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    progressStep: {
        alignItems: 'center',
        flex: 1,
    },
    stepDot: {
        width: 20,
        height: 20,
        borderRadius: 4,
        marginBottom: 4,
        justifyContent:'center',
        alignItems:'center',
    },
    stepLabel: {
        fontSize: 10,
        fontFamily: 'Poppins-Medium',
        textAlign: 'center',
    },
    uploadCompleteContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: colors.successBackground || 'rgba(76, 175, 80, 0.1)',
        borderWidth: 1,
        borderColor: colors.success || '#4CAF50',
    },
    successIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    successText: {
        fontSize: 14,
        fontFamily: 'Poppins-Medium',
    },
    instructionsContainer: {
        width: '100%',
    },
    instructionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    instructionIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    instructionNumber: {
        fontSize: 16,
        fontFamily: 'Poppins-Bold',
    },
    instructionText: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        flex: 1,
    },
    buttonContainer: {
        paddingHorizontal: 24,
        paddingBottom: 20,
    },
});

export default NewChatScreen;
