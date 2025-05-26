import { findMessageIndex } from './utils.js';
import {
  conversationHistories,
  getCurrentPersonality,
  initializeMessageGroups
} from '../state.js';
import { saveConversationHistories } from '../../utils/storage.js';
import { getCurrentChatId } from '../../utils/storage.js';
import { loadChatHistories, saveChatHistories } from '../management/chatManager.js';
import { readdResendArrows } from './navigationHandlers.js';

export function deleteUserMessage(messageDiv) {
  if (confirm('Are you sure you want to delete this message and all messages after it?')) {
    const currentPers = getCurrentPersonality();
    const currentChatId = getCurrentChatId();
    const histories = loadChatHistories();
    
    const index = findMessageIndex(messageDiv);
    if (index !== -1 && conversationHistories[currentPers]) {
      conversationHistories[currentPers].splice(index);
      saveConversationHistories(conversationHistories);
    }
    
    if (histories[currentPers] && histories[currentPers][currentChatId]) {
      const allMessages = document.querySelectorAll('.user-message, .bot-message:not(.introduction-container)');
      const messageIndex = Array.from(allMessages).indexOf(messageDiv);
      
      if (messageIndex !== -1) {
        histories[currentPers][currentChatId].messages = 
          histories[currentPers][currentChatId].messages.slice(0, messageIndex);
        histories[currentPers][currentChatId].updatedAt = new Date().toISOString();
        
        saveChatHistories(histories);
      }
    }
    
    initializeMessageGroups();
    
    let currentElement = messageDiv;
    const messagesToDelete = [];
    
    while (currentElement) {
      messagesToDelete.push(currentElement);
      currentElement = currentElement.nextElementSibling;
    }
    
    messagesToDelete.forEach(element => element.remove());
    messagesToDelete.forEach(element => {
      if(histories[currentPers][currentChatId].messages === element) {
        localStorage.removeItem("chatHistories", element)
      }
    })
  }
  readdResendArrows();
}