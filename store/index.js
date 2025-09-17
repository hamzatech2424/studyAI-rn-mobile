import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slices/authSlice'
import conversationSlice from './slices/conversationSlice'


export const store = configureStore({
  reducer: {
    auth: authSlice,
    conversation: conversationSlice
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Configuration options for `SerializableStateInvariantMiddleware`
        ignoredActions: [], // List actions to ignore
        ignoredPaths: [], // List state paths to ignore
      },
    }),
})