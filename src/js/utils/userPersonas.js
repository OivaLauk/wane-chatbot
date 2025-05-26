// Current chat persona mapping - keeps track of which persona is used in which chat
const activeChatPersonas = {};

export function loadUserPersonas() {
  const personas = localStorage.getItem('userPersonas');
  return personas ? JSON.parse(personas) : {};
}

export function saveUserPersonas(personas) {
  localStorage.setItem('userPersonas', JSON.stringify(personas));
}

export function getCurrentUserPersona() {
  const currentChatId = localStorage.getItem('currentChatId');
  const currentPers = localStorage.getItem('currentPersonality');
  
  if (activeChatPersonas[currentPers] && 
      activeChatPersonas[currentPers][currentChatId]) {
    return activeChatPersonas[currentPers][currentChatId];
  }
  
  try {
    const histories = JSON.parse(localStorage.getItem('chatHistories') || '{}');
    if (histories[currentPers]?.[currentChatId]?.personaName) {
      if (!activeChatPersonas[currentPers]) activeChatPersonas[currentPers] = {};
      activeChatPersonas[currentPers][currentChatId] = histories[currentPers][currentChatId].personaName;
      return histories[currentPers][currentChatId].personaName;
    }
  } catch (e) {
    console.error('Error reading chat history:', e);
  }
  
  return localStorage.getItem('currentUserPersona') || 'You';
}

export function setCurrentUserPersona(personaName, personalityName, chatId) {
  // Don't allow null or undefined
  if (!personaName) personaName = 'User';
  
  if (!activeChatPersonas[personalityName]) {
    activeChatPersonas[personalityName] = {};
  }
  activeChatPersonas[personalityName][chatId] = personaName;
  
  localStorage.setItem('currentUserPersona', personaName);
  
  updateChatPersona(personalityName, chatId, personaName);
  
  updateUIWithPersona(personaName);
}

function updateUIWithPersona(personaName) {
  document.querySelectorAll('.user-name').forEach(element => {
    element.textContent = personaName;
  });
  
  const personas = loadUserPersonas();
  const avatarSrc = personas[personaName]?.avatar || './assets/user-circle.svg';
  
  document.querySelectorAll('.user-pic img').forEach(img => {
    img.src = avatarSrc;
  });
}

function updateChatPersona(personalityName, chatId, personaName) {
  try {
    const histories = JSON.parse(localStorage.getItem('chatHistories') || '{}');
    
    if (histories[personalityName] && histories[personalityName][chatId]) {
      histories[personalityName][chatId].personaName = personaName;
      localStorage.setItem('chatHistories', JSON.stringify(histories));
    }
  } catch (e) {
    console.error('Error updating chat history:', e);
  }
}

export function initializePersonaState() {
  
  try {
    const histories = JSON.parse(localStorage.getItem('chatHistories') || '{}');
    
    Object.keys(histories).forEach(personalityName => {
      activeChatPersonas[personalityName] = {};
      
      Object.keys(histories[personalityName] || {}).forEach(chatId => {
        const chat = histories[personalityName][chatId];
        if (chat && chat.personaName) {
          activeChatPersonas[personalityName][chatId] = chat.personaName;
        }
      });
    });
    
  } catch (e) {
    console.error('Error initializing persona state:', e);
  }
}