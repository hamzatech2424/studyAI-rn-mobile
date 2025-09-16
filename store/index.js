import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slices/authSlice'


export const store = configureStore({
  reducer: {
    auth: authSlice
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