export function saveConversationHistories(histories) {
  try {
    localStorage.setItem('conversationHistories', JSON.stringify(histories));
  } catch (error) {
    console.error('Error saving conversation histories:', error);
  }
}

export function loadConversationHistories() {
  try {
    const histories = localStorage.getItem('conversationHistories');
    if (!histories) {
      return {};
    }
    return JSON.parse(histories);
  } catch (error) {
    console.error('Error loading conversation histories:', error);
    return {};
  }
}

export function generateChatId() {
  return Date.now().toString(36);
}

export function createNewChat(personalityName) {
  const chatId = generateChatId();
  const histories = loadConversationHistories();
  
  if (!histories[personalityName]) {
    histories[personalityName] = {};
  }
  
  histories[personalityName][chatId] = {
    id: chatId,
    createdAt: new Date().toISOString(),
    messages: [],
    name: `Chat with ${personalityName}`
  };
  
  saveConversationHistories(histories);
  
  localStorage.setItem('currentChatId', chatId);
  localStorage.setItem('currentPersonality', personalityName);
  
  return chatId;
}

export function getCurrentChatId() {
  return localStorage.getItem('currentChatId');
}

export function getChat(personalityName, chatId) {
  const histories = loadConversationHistories();
  
  if (!histories[personalityName] || !histories[personalityName][chatId]) {
    return null;
  }
  
  return histories[personalityName][chatId];
}