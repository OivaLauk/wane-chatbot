export function loadChatHistories() {
  const storedData = localStorage.getItem("chatHistories");
  return storedData ? JSON.parse(storedData) : {};
}


export function saveChatHistories(chatHistories) {
  localStorage.setItem("chatHistories", JSON.stringify(chatHistories));
}


export function generateChatId() {
  return `chat-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}


export function getChatsForPersonality(personalityName) {
  const histories = loadChatHistories();
  if (!histories[personalityName]) {
    return [];
  }
  

  return Object.values(histories[personalityName])
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

export function getChat(personalityName, chatId) {
  const histories = loadChatHistories();
  return histories?.[personalityName]?.[chatId] || null;
}

export function hasChats(personalityName) {
  const histories = loadChatHistories();
  return histories[personalityName] && Object.keys(histories[personalityName]).length > 0;
}


export function getMostRecentChat(personalityName) {
  const chats = getChatsForPersonality(personalityName);
  return chats.length > 0 ? chats[0] : null;
}


export function createNewChat(personalityName, personaName) {
  const chatId = generateChatId();
  const histories = loadChatHistories();
  
  if (!histories[personalityName]) {
    histories[personalityName] = {};
  }
  
  histories[personalityName][chatId] = {
    id: chatId,
    name: `Chat with ${personalityName}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    personaName: personaName || 'Default',
    messages: []
  };
  
  saveChatHistories(histories);
  
  setActiveChat(personalityName, chatId);
  
  return {
    chatId,
    personalityName
  };
}

export function renameChat(personalityName, chatId, newName) {
  const histories = loadChatHistories();
  
  if (!histories[personalityName] || !histories[personalityName][chatId]) {
    return false;
  }
  
  histories[personalityName][chatId].name = newName;
  histories[personalityName][chatId].updatedAt = new Date().toISOString();
  
  saveChatHistories(histories);
  return true;
}

export function deleteChat(personalityName, chatId) {
  const histories = loadChatHistories();
  
  if (!histories[personalityName] || !histories[personalityName][chatId]) {
    return false;
  }
  
  const currentChatId = localStorage.getItem('currentChatId');
  const currentPersonality = localStorage.getItem('currentPersonality');
  
  delete histories[personalityName][chatId];
  saveChatHistories(histories);
  
  if (personalityName === currentPersonality && chatId === currentChatId) {
    clearCurrentChat();
  }
  
  return true;
}

export function addMessageToChat(personalityName, chatId, message) {
  const histories = loadChatHistories();
  
  if (!histories[personalityName] || !histories[personalityName][chatId]) {
    return false;
  }
  
  histories[personalityName][chatId].messages.push(message);
  histories[personalityName][chatId].updatedAt = new Date().toISOString();
  
  saveChatHistories(histories);
  return true;
}

export function getActiveChatDetails() {
  const personalityName = localStorage.getItem('currentPersonality') || '';
  const chatId = localStorage.getItem('currentChatId') || '';
  
  return {
    personalityName,
    chatId
  };
}

export function setActiveChat(personalityName, chatId) {
  localStorage.setItem('currentPersonality', personalityName);
  localStorage.setItem('currentChatId', chatId);
}

export function clearCurrentChat() {
  localStorage.removeItem('currentChatId');
}