import { useApiClient } from "@/services/apiClient";
import { useDispatch } from "react-redux";
import { setAllConversations } from "../store/slices/conversationSlice";

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

    return { getConversationsHandler }
}

export default useConversationController;