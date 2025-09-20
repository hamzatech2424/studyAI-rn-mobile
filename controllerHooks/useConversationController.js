import { useApiClient } from "@/services/apiClient";
import { useDispatch } from "react-redux";
import { setAllConversations, setNewMessage } from "../store/slices/conversationSlice";

const useConversationController = () => {
    const apiClient = useApiClient();
    const dispatch = useDispatch();

    const axiosErrorHandler = (error) => {
        if (error.response?.status == 401) {
            return "Session expired"
        }
        else if (error.response) {
            console.log("Error Status Code=>", error?.response?.status)
            return "Something went wrong"
        }
        else if (error.request) {
            return "No response received. Check your network connection."
        } else {
            return error?.error?.message
        }
    }


    const getConversations = () => {
        return new Promise((resolve, reject) => {
            apiClient.get(`/api/chat/all`)
                .then(response => {
                    if (response.status == 200) {
                        if (response?.data?.success) {
                            const successObject = {
                                data: response?.data?.data?.chats,
                                message: response?.data?.data?.message
                            }
                            resolve(successObject)
                        }
                    }
                    else {
                        reject("System not working");
                    }
                })
                .then(response => {
                    resolve(response?.data)
                })
                .catch(error => {
                    reject(axiosErrorHandler(error))
                })
        })
    }

    const getConversationsHandler = (_callback = () => false, _errorCallback = () => false) => {
        getConversations()
            .then(response => {
                dispatch(setAllConversations(response?.data))
                _callback(response?.data)
            })
            .catch(error => {
                _errorCallback(error)
            })
    }

    const getSingleConversation = (chatId) => {
        return new Promise((resolve, reject) => {
            apiClient.get(`/api/chat/single/${chatId}`)
                .then(response => {
                    if (response.status == 200) {
                        if (response?.data?.success) {
                            const successObject = {
                                data: response?.data?.data?.chat,
                                message: response?.data?.data?.message
                            }
                            resolve(successObject)
                        }
                    }
                    else {
                        reject("System not working");
                    }
                })
                .then(response => {
                    resolve(response?.data)
                })
                .catch(error => {
                    reject(axiosErrorHandler(error))
                })
        })
    }


    const sendMessage = (chatId, message) => {
        let body = {
            question: message,
            k: 10
        }
        return new Promise((resolve, reject) => {
            apiClient.post(`/api/chat/message/${chatId}`, body)
                .then(response => {
                    if (response.status == 200) {
                        if (response?.data?.success) {
                            const successObject = {
                                data: response?.data?.data?.chat,
                                message: response?.data?.data?.message
                            }
                            resolve(successObject)
                        }
                    }
                    else {
                        reject("System not working");
                    }
                })
                .then(response => {
                    resolve(response?.data)
                })
                .catch(error => {
                    reject(axiosErrorHandler(error))
                })
        })
    }


    const sendMessageHandler = (chatId, message, _callback = () => false, _errorCallback = () => false) => {
        sendMessage(chatId, message)
            .then(response => {
                _callback(response?.data)
                dispatch(setNewMessage(response?.data))
            })
            .catch(error => {
                console.log(error,"error")
                _errorCallback(error)
            })
    }

    return { getConversationsHandler, getSingleConversation, sendMessageHandler }
}

export default useConversationController;