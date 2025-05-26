import {
  conversationHistories,
  getCurrentPersonality
} from '../state.js';

// Find index of message in chat
export function findMessageIndex(messageDiv) {
  if (messageDiv.classList.contains('user-message')) {
    const allUserMessages = document.querySelectorAll('.user-message');
    const userMessageIndex = Array.from(allUserMessages).indexOf(messageDiv);
    
    if (userMessageIndex !== -1) {
      let userMessageCount = 0;
      const messages = conversationHistories[getCurrentPersonality()] || [];
      
      for (let i = 0; i < messages.length; i++) {
        if (messages[i].role === 'user') {
          if (userMessageCount === userMessageIndex) {
            return i;
          }
          userMessageCount++;
        }
      }
    }
  } else if (messageDiv.classList.contains('bot-message')) {
    const allBotMessages = document.querySelectorAll('.bot-message');
    const botMessageIndex = Array.from(allBotMessages).indexOf(messageDiv);
    
    if (botMessageIndex !== -1) {
      let botMessageCount = 0;
      const messages = conversationHistories[getCurrentPersonality()] || [];
      
      for (let i = 0; i < messages.length; i++) {
        if (messages[i].role === 'assistant') {
          if (botMessageCount === botMessageIndex) {
            return i;
          }
          botMessageCount++;
        }
      }
    }
  }
  
  return -1;
}

// Get unformatted text from history
export function extractOriginalText(messageDiv) {
  let index = -1;
  if (messageDiv.classList.contains('user-message')) {
    index = findMessageIndex(messageDiv);
  } else if (messageDiv.classList.contains('bot-message')) {
    const allBotMessages = document.querySelectorAll('.bot-message');
    const botMessageIndex = Array.from(allBotMessages).indexOf(messageDiv);
    
    if (botMessageIndex !== -1) {
      // Find matching message in history
      let botMessageCount = 0;
      const messages = conversationHistories[getCurrentPersonality()] || [];
      
      for (let i = 0; i < messages.length; i++) {
        if (messages[i].role === 'assistant') {
          if (botMessageCount === botMessageIndex) {
            index = i;
            break;
          }
          botMessageCount++;
        }
      }
    }
  }
  
  if (index !== -1 && conversationHistories[getCurrentPersonality()]) {
    return conversationHistories[getCurrentPersonality()][index].content;
  }
  
  return null;
}