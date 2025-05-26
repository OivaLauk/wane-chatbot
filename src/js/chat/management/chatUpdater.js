import { 
  loadChatHistories,
  saveChatHistories,
  addMessageToChat,
  getActiveChatDetails,
  getChat
} from './chatManager.js';


export function saveUserMessage(message) {
  const { personalityName, chatId } = getActiveChatDetails();
  
  if (!personalityName || !chatId) {
    console.error('No active chat to save message to');
    return false;
  }
  
  return addMessageToChat(personalityName, chatId, {
    role: 'user',
    content: message,
    timestamp: new Date().toISOString()
  });
}

export function saveAIResponse(response) {
  const { personalityName, chatId } = getActiveChatDetails();
  
  if (!personalityName || !chatId) {
    console.error('No active chat to save response to');
    return false;
  }
  
  return addMessageToChat(personalityName, chatId, {
    role: 'assistant',
    content: response,
    timestamp: new Date().toISOString()
  });
}

export function getCurrentChatMessages() {
  const { personalityName, chatId } = getActiveChatDetails();
  
  if (!personalityName || !chatId) {
    return [];
  }
  
  const chat = getChat(personalityName, chatId);
  return chat ? chat.messages : [];
}

export function generateChatName(firstMessage) {

  let chatName = firstMessage.trim();
  
  if (chatName.length > 30) {
    chatName = chatName.substring(0, 30) + '...';
  } else if (chatName.length < 3) {
    chatName = 'Untitled Chat';
  }
  
  return chatName;
}

export function updateChatNameFromFirstMessage(message) {
  const { personalityName, chatId } = getActiveChatDetails();
  
  if (!personalityName || !chatId) {
    return false;
  }
  
  const histories = loadChatHistories();
  
  if (!histories[personalityName] || !histories[personalityName][chatId]) {
    return false;
  }
  
  if (histories[personalityName][chatId].messages.length === 1) {
    histories[personalityName][chatId].name = generateChatName(message);
    saveChatHistories(histories);
    return true;
  }
  
  return false;
}