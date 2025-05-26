import { 
  loadPersonalitiesFromStorage, 
  savePersonalitiesToStorage,
  migratePersonalityStorage 
} from '../storage/personalityStorage.js';
import { hasChats, getMostRecentChat, setActiveChat } from '../../js/chat/management/chatManager.js';
import { switchView } from '../../js/ui/layout.js';
import { displayConversationHistory } from '../../js/chat/history/conversationDisplay.js';
import { defaultPersonalities } from '../defaultPersonalities.js';

let _personalities = {};

export function initializePersonalities() {
  migratePersonalityStorage();
  
  _personalities = loadPersonalitiesFromStorage();
  
  if (Object.keys(_personalities).length === 0) {
    _personalities = { ...defaultPersonalities };
    savePersonalitiesToStorage(_personalities);
  }
  
  return _personalities;
}

export function personality(name, property) {
  if (!_personalities[name]) {
    console.warn(`Personality '${name}' not found.`);
    return property === 'name' ? name : '';
  }
  
  const defaults = {
    name: name,
    system: 'You are a helpful assistant.',
    intro: 'Hello! How can I help you?',
    avatar: '/assets/default-pfp.svg'
  };
  
  return _personalities[name][property] || defaults[property] || '';
}

export function getPersonalities(forceRefresh = false) {
  if (forceRefresh) {
    _personalities = loadPersonalitiesFromStorage();
  }
  return _personalities;
}

export function addPersonality(config) {
  if (!config || !config.name) {
    console.error("Invalid personality configuration");
    return false;
  }
  
  const { name } = config;
  
  _personalities[name] = {
    ..._personalities[name],
    ...config
  };
  
  savePersonalitiesToStorage(_personalities);
  return true;
}

export function updatePersonality(name, updates) {
  if (!_personalities[name]) {
    console.warn(`Cannot update: Personality '${name}' not found.`);
    return false;
  }
  
  _personalities[name] = {
    ..._personalities[name],
    ...updates
  };
  
  savePersonalitiesToStorage(_personalities);
  return true;
}

export function deletePersonality(name) {
  if (!_personalities[name]) {
    console.warn(`Cannot delete: Personality '${name}' not found.`);
    return false;
  }
  
  if (Object.keys(_personalities).length <= 1) {
    console.warn('Cannot delete the only personality.');
    return false;
  }
  
  delete _personalities[name];
  savePersonalitiesToStorage(_personalities);
  return true;
}

export function updatePersonalityCardButtons(personalityName) {
  const cards = document.querySelectorAll('.personality-card');
  
  const card = Array.from(cards).find(card => {
    const nameEl = card.querySelector('.personality-name');
    return nameEl && nameEl.textContent === personalityName;
  });
  
  if (!card) {
    console.log(`Card not found for personality: ${personalityName}`);
    return;
  }
  
  const hasExistingChats = hasChats(personalityName);
  
  const buttonsContainer = card.querySelector('.personality-buttons');
  if (!buttonsContainer) return;
  
  const startChatBtn = buttonsContainer.querySelector('.start-chat-btn');
  const continueChatBtn = buttonsContainer.querySelector('.continue-chat-btn');
  
  if (hasExistingChats) {
    if (!continueChatBtn) {
      const newContinueBtn = document.createElement('button');
      newContinueBtn.className = 'continue-chat-btn';
      newContinueBtn.textContent = 'Continue Chat';
      buttonsContainer.appendChild(newContinueBtn);
      
      newContinueBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        
        const mostRecentChat = getMostRecentChat(personalityName);
        if (mostRecentChat) {
          setActiveChat(personalityName, mostRecentChat.id);
          switchView(false);
          
          setTimeout(() => {
            displayConversationHistory(personalityName);
          }, 50);
        }
      });
    }
  } else {
    if (continueChatBtn) {
      continueChatBtn.remove();
    }
  }
}