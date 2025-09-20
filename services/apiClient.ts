import { logOut } from "@/controllerHooks/authController";
import { useAuth } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Alert } from "react-native";
import { BASE_URL } from "../proxy";

let isHandlingSessionExpiry = false;
export const TOKEN_KEY = "API_JWT_TOKEN"; 

export const useApiClient = () => {
  const { getToken, signOut } = useAuth();

  const api = axios.create({
    baseURL: BASE_URL,
  });

  const handleTokenExpiration = async () => {
    if (isHandlingSessionExpiry) return;
    isHandlingSessionExpiry = true;

    Alert.alert(
      "Session Expired",
      "Your session has expired. Please log in again.",
      [
        {
          text: "OK",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(TOKEN_KEY);
              await signOut();
              await logOut();
            } finally {
              isHandlingSessionExpiry = false;
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  // 🔑 Get token (from storage or Clerk)
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

  // Request interceptor
  api.interceptors.request.use(async (config) => {
    try {
      const token = await getStoredToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.log("❌ Error fetching token:", err);
    }

    if (__DEV__) {
      console.log("🚀 Axios Request Details:");
      console.log("📡 Method:", config.method?.toUpperCase());
      console.log("🌐 URL:", config.url);
      console.log("🔑 Headers:", config.headers);
      console.log("📦 Request Body:", config.data);
      console.log("🔍 Params:", config.params);
      console.log("⏰ Timestamp:", new Date().toISOString());
    }

    return config;
  });

  // Response interceptor
  api.interceptors.response.use(
    (res) => res,
    async (error) => {
      if (error.response?.status === 401) {
        console.log("⚠️ Session expired, handling logout...");
        await AsyncStorage.removeItem(TOKEN_KEY); // clear expired token
        await handleTokenExpiration();
      }
      return Promise.reject(error);
    }
  );

  return api;
};
