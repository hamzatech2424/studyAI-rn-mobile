import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  conversations: {},
}

export const conversationSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAllConversations: (state, action) => {
      state.conversations = action.payload
    },
    resetStateAuth: (state) => initialState,
  },
})

// Action creators are generated for each case reducer function
export const {
  setAllConversations,
  resetStateAuth,
} = conversationSlice.actions

export default conversationSlice.reducer