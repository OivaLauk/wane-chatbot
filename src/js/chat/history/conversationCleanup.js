import { messageGroups, conversationHistories } from '../state.js';
import { saveConversationHistories } from '../../utils/storage.js';

// Function to clean up regenerated messages and ensure consistent storage format
export function cleanupRegeneratedMessages() {
  Object.keys(messageGroups).forEach(personalityName => {
    if (!messageGroups[personalityName]) return;
    
    Object.keys(messageGroups[personalityName]).forEach(chatId => {
      const chatMessageGroups = messageGroups[personalityName][chatId];
      
      if (Array.isArray(chatMessageGroups)) {
        chatMessageGroups.forEach(group => {
          if (!Array.isArray(group.aiResponses)) {
            if (group.aiResponse) {
              group.aiResponses = [{ content: group.aiResponse }];
              delete group.aiResponse;
            } else {
              group.aiResponses = [];
            }
          }
        });
      }
    });
  });
  
  saveConversationHistories(conversationHistories);
}