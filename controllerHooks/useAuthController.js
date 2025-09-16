import { useApiClient } from "@/services/apiClient";
import { setUserData } from "@/store/slices/authSlice";
import { useDispatch } from "react-redux";

const useAuthController = () => {
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

    const syncUser = () => {
        return new Promise((resolve, reject) => {
            apiClient.post(`/api/user/sync`)
                .then(response => {
                    if (response.status == 200) {
                        if (response?.data?.success) {
                            const successObject = {
                                data: response?.data?.data?.user,
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

    const syncUserHandler = (_callback = () => false, _errorCallback = () => false) => {
        syncUser()
            .then(response => {
                dispatch(setUserData(response?.data))
                _callback(response?.data)
            })
            .catch(error => {
                _errorCallback(error)
            })
    }

    return { syncUser, syncUserHandler }
}

export default useAuthController;