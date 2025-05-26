import { loadConversationHistories } from '../utils/storage.js';
import { loadChatHistories } from './management/chatManager.js';

export let messageGroups = {};
export let currentMessageIndex = {};
export let _currentPersonality = 'Default';
export let conversationHistories = loadConversationHistories() || {};

export const getCurrentPersonality = () => _currentPersonality;
export const setCurrentPersonality = (personality) => {
  _currentPersonality = personality;
};

export function initializeMessageGroups() {
  const chatHistories = loadChatHistories();
  
  Object.keys(messageGroups).forEach(personality => {
    delete messageGroups[personality];
  });
  
  Object.keys(chatHistories).forEach(personality => {
    if (!messageGroups[personality]) {
      messageGroups[personality] = {};
    }
    
    Object.keys(chatHistories[personality] || {}).forEach(chatId => {
      if (!messageGroups[personality][chatId]) {
        messageGroups[personality][chatId] = [];
      }
      
      const chat = chatHistories[personality][chatId];
      const messages = chat.messages || [];
      
      let currentUserMessage = null;
      
      for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        
        if (msg.role === 'user') {
          currentUserMessage = {
            content: msg.content,
            timestamp: msg.timestamp || new Date().toISOString()
          };
          
          messageGroups[personality][chatId].push({
            userMessage: currentUserMessage,
            aiResponses: []
          });
        } else if (msg.role === 'assistant' && currentUserMessage) {
          const lastGroupIndex = messageGroups[personality][chatId].length - 1;
          
          if (lastGroupIndex >= 0) {
            messageGroups[personality][chatId][lastGroupIndex].aiResponses.push({
              content: msg.content,
              timestamp: msg.timestamp || new Date().toISOString()
            });
          }
        }
      }
    });
  });
  
  console.log("Message groups initialized:", messageGroups);
}

initializeMessageGroups();