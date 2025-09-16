import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  user: {},
  enums: {},
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUserData: (state, action) => {
      state.user = action.payload
    },
    setEnums: (state, action) => {
      state.enums = action.payload
    },
    resetStateAuth: (state) => initialState,
  },
})

// Action creators are generated for each case reducer function
export const {
  setUserData,
  setEnums,
  resetStateAuth,
} = authSlice.actions

export default authSlice.reducer