import { store } from "@/store/index.js";
import { resetStateAuth, setUserData } from "@/store/slices/authSlice.js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { BASE_URL } from "../proxy.js";


const USER_DATA = "UserData"

const axiosErrorHandler = (error) => {
    if (error.response) {
        console.log("Error Status Code=>", error?.response?.status)
        return "Something went wrong"
    } else if (error.request) {
        return "No response received. Check your network connection."
    } else {
        return error?.error?.message
    }
}


const syncUser = () => {
    return new Promise((resolve, reject) => {
        post(`${BASE_URL}/api/user/sync`)
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
                console.log(error, "Error in syncUserApiCall")
                reject(axiosErrorHandler(error))
            })
    })
}


const saveUser = (userData, _callback, _errorCallback) => {
    store.dispatch(setUserData(userData))
    AsyncStorage.setItem(USER_DATA, JSON.stringify(userData))
        .then((user) => {
            console.log("User Saved in AsyncStorage")
            _callback(true);
        })
        .catch((error) => {
            console.log(error, 'Error in Saving user in AsyncStorage')
            _errorCallback(error);
        })
}


const removeUser = (_callback = () => false, _errorCallback = () => false) => {
    store.dispatch(resetStateAuth())
    AsyncStorage.removeItem(USER_DATA)
        .then((user) => {
            console.log("User removed from AsyncStorage")
            _callback(true);
        })
        .catch((error) => {
            console.log(error, 'Error in removed user from AsyncStorage')
            _errorCallback(error);
        })
}


const currentUser = () => {
    return store.getState().auth.user;
}

const logOut = () => {
    return new Promise((resolve, reject) => {
        router.replace('/(authStack)/signInScreen')
        resolve(true)
    })
}


export {
    currentUser,
    logOut,
    removeUser,
    saveUser,
    syncUser
};


