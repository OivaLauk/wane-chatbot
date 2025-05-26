import { 
  saveConversationHistories,
} from './storage.js';
import {
  _currentPersonality,
  conversationHistories,
  initializeMessageGroups
} from '../chat/state.js';

export function cleanupRegeneratedMessages() {
  console.log("Cleaning up regenerated messages");
  
  Object.keys(conversationHistories).forEach(personality => {
    if (!conversationHistories[personality]) return;
    
    Object.keys(conversationHistories[personality]).forEach(chatId => {
      const chat = conversationHistories[personality][chatId];
      if (!chat || !Array.isArray(chat.messages)) return;
      
      const messages = chat.messages;
      const cleanedMessages = [];
      
      // Keep only the last AI response for each user message
      let lastUserMsgIndex = -1;
      
      for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        
        if (msg.role === 'user') {
          // Always keep user messages
          cleanedMessages.push(msg);
          lastUserMsgIndex = cleanedMessages.length - 1;
        } else if (msg.role === 'assistant') {

          const isLastMessage = i === messages.length - 1;
          const nextIsUser = !isLastMessage && messages[i + 1].role === 'user';
          
          if (isLastMessage || nextIsUser) {
            cleanedMessages.push(msg);
          }
        }
      }
      
      chat.messages = cleanedMessages;
    });
  });
  
  saveConversationHistories(conversationHistories);
  
  initializeMessageGroups();
}

// Function to clean up conversation history
export function cleanConversationHistory() {
  Object.keys(conversationHistories).forEach(personalityName => {
    if (!conversationHistories[personalityName]) return;
    
    const personalityChats = conversationHistories[personalityName];
    
    Object.keys(personalityChats).forEach(chatId => {
      const chat = personalityChats[chatId];
      
      if (chat && Array.isArray(chat.messages)) {
        chat.messages = chat.messages.map(msg => {
          let content = msg.content;

          if (Array.isArray(content)) {
            if (content[0] && !content[0].text) {
              content = "(empty message)";
            } else if (content[0] && content[0].text) {
              content = content[0].text;
            }
          }
          
          return {
            role: msg.role,
            content: content,
            timestamp: msg.timestamp || new Date().toISOString()
          };
        });
      }
    });
  });
  
  saveConversationHistories(conversationHistories);
}