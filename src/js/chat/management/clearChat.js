import { 
  loadChatHistories,
  saveChatHistories,
  getActiveChatDetails
} from './chatManager.js';
import { initializeMessageGroups } from '../state.js';
import { displayIntroductionMessage, createIntroductionMessage } from '../history/introductionMessages.js';
import { updateArrowButtonVisibility } from '../handlers/navigationHandlers.js';

export function clearChat(clearAll = false) {
  const { personalityName, chatId } = getActiveChatDetails();
  const histories = loadChatHistories();
  
  if (!personalityName || !histories[personalityName]) return;
  
  if (clearAll && chatId && histories[personalityName][chatId]) {
    histories[personalityName][chatId].messages = [];
    histories[personalityName][chatId].updatedAt = new Date().toISOString();
  }
  
  saveChatHistories(histories);
  
  initializeMessageGroups();
  
  const chatContainer = document.querySelector('.chat');
  if (chatContainer) {
    const introMessageElement = chatContainer.querySelector('.introduction-container');
    chatContainer.innerHTML = '';
    if (introMessageElement) {
      chatContainer.appendChild(introMessageElement);
      displayIntroductionMessage(personalityName);
    } else {
      createIntroductionMessage(personalityName);
    }
  }
  
  updateArrowButtonVisibility();
}