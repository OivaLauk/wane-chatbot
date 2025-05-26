import { initializeEventListeners } from './js/events/eventListeners.js';
import { 
  getPersonalities, 
  initializePersonalities
} from './personalities/core/personalityManager.js';
import { initializePersonalityForm } from './personalities/createPersonality.js';
import { sendMessage } from './js/chat/handlers/sendHandlers.js';
import { 
  clearChat 
} from './js/chat/management/clearChat.js';
import { 
  displayConversationHistory 
} from './js/chat/history/conversationDisplay.js';
import { toggleTheme, initializeTheme } from './js/ui/theme.js';
import { renderPersonalityCards } from './personalities/personalityManager.js';
import { setupHomePageEventListeners } from './js/ui/homeUI.js';
import { setupProfileButtons } from './js/profile/profile.js';
import { setupSettingsButtons } from './js/profile/settings.js';
import { 
  cleanupRegeneratedMessages
} from './js/chat/history/conversationCleanup.js';
import { cleanConversationHistory } from './js/chat/history/conversationDisplay.js';
import { setCurrentPersonality, initializeMessageGroups, getCurrentPersonality } from './js/chat/state.js';
import { initAutoResize } from './js/ui/textareaAutoResize.js';
import { initializePersonaState } from './js/utils/userPersonas.js';

// Make functions available globally
window.sendMessage = sendMessage;
window.clearChat = clearChat;
window.toggleTheme = toggleTheme;

window.addEventListener('DOMContentLoaded', () => {
  if (!localStorage.getItem('wane_personalities')) {
    import('./personalities/defaultPersonalities.js').then(module => {
      const { defaultPersonalities } = module;
      localStorage.setItem('wane_personalities', JSON.stringify(defaultPersonalities));
    });
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  try {
    
    // Set up theme first to avoid flash of wrong theme
    initializeTheme();
    
    // Clean up data
    cleanupRegeneratedMessages();
    cleanConversationHistory();
    
    // Initialize personalities
    initializePersonalities();
    
    // Initialize user personas
    initializePersonaState();
    
    // Initialize UI components in the correct order
    initializeMessageGroups();
    initializeEventListeners();
    initializePersonalityForm();
    
    // Set up model select dropdown
    initializeModelSelect();
    
    // Set up UI event handlers
    setupHomePageEventListeners(); 
    setupProfileButtons();
    setupSettingsButtons();
    
    // Render personality cards on the homepage
    renderPersonalityCards();
    
    // Initialize auto-resize for textareas
    initAutoResize();
    
  } catch (error) {
    console.error("Initialization error:", error);
  }
});

function initializeModelSelect() {
  const modelSelect = document.getElementById('modelSelect');
  if (!modelSelect) {
    console.error("Model select element not found");
    return;
  }
  
  modelSelect.innerHTML = '';
  
  const personalities = getPersonalities();
  Object.keys(personalities).forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    modelSelect.appendChild(option);
  });
  
  const currentPersonality = getCurrentPersonality();
  if (currentPersonality && modelSelect.querySelector(`option[value="${currentPersonality}"]`)) {
    modelSelect.value = currentPersonality;
  }
  
  modelSelect.addEventListener('change', function() {
    setCurrentPersonality(this.value);
    
    const chatContainer = document.querySelector('.chat');
    if (chatContainer) {
      chatContainer.querySelectorAll('.user-message, .bot-message').forEach(el => {
        if (!el.querySelector('#introduction')) {
          el.remove();
        }
      });
    }

    displayConversationHistory(this.value);
  });
}