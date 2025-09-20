import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  conversations: [],
}

export const conversationSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAllConversations: (state, action) => {
      state.conversations = action.payload
    },
    setNewMessage: (state, action) => {
      const conversationIndex = state.conversations.findIndex(conv => conv.id === action.payload.id);
      if (conversationIndex !== -1) {
        state.conversations[conversationIndex].lastMessage = action.payload.newMessages?.aiMessage?.content;
        state.conversations[conversationIndex].lastMessageAt = action.payload.newMessages?.aiMessage?.createdAt;
        state.conversations[conversationIndex].lastMessageType = "ai";
      }
    },
    resetStateAuth: (state) => initialState,
  },
})

// Action creators are generated for each case reducer function
export const {
  setAllConversations,
  setNewMessage,
  resetStateAuth,
} = conversationSlice.actions

export default conversationSlice.reducer