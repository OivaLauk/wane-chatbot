import { switchView } from './layout.js';
import { toggleTheme } from './theme.js';
import { 
  deletePersonality as removePersonality 
} from '../../personalities/core/personalityManager.js';
import { renderPersonalityCards } from '../../personalities/personalityManager.js';
import { 
  showAddPersonalityModal
} from '../../personalities/personalityModals.js';
import { displayConversationHistory } from '../chat/history/conversationDisplay.js';
import { showProfile } from '../profile/profile.js';
import { showSettings } from '../profile/settings.js';


export function setupHomePageEventListeners() {
  try {
    
    const backToHomeBtn = document.getElementById('backToHome');
    if (backToHomeBtn) {
      backToHomeBtn.addEventListener('click', () => {
        switchView(true);
        
        const mainWrapper = document.getElementById('mainWrapper');
        mainWrapper.classList.remove('no-side-panel');
        
        renderPersonalityCards();
      });
    }
    
    // Add keyboard shortcut to return to home
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const mainWrapper = document.getElementById('mainWrapper');
        const homeContainer = document.getElementById('homeContainer');
        
        if (mainWrapper && homeContainer && 
            mainWrapper.style.display !== 'none' && 
            homeContainer.style.display === 'none') {
          
          switchView(true);
          mainWrapper.classList.remove('no-side-panel');
          renderPersonalityCards();
        }
      }
    });
    
    const homeThemeToggle = document.getElementById('homeThemeToggle');
    if (homeThemeToggle) {
      homeThemeToggle.addEventListener('click', toggleTheme);
    }
    
    const homeAddPersonality = document.getElementById('homeAddPersonality');
    if (homeAddPersonality) {
      homeAddPersonality.addEventListener('click', function(e) {
        e.preventDefault();
        try {
          showAddPersonalityModal();
        } catch (err) {
          console.error("Error showing add personality modal:", err);
        }
      });
    }

    connectButtonPairs();
  } catch (error) {
    console.error("Error setting up home page event listeners:", error);
  }
}

function connectButtonPairs() {
  
  const userButtonHome = document.getElementById('userButtonHome');
  const settingsButtonHome = document.getElementById('settingsButtonHome');
  
  if (userButtonHome) {
    userButtonHome.addEventListener('click', (e) => {
      e.preventDefault();
      showProfile();
    });
  }
  
  if (settingsButtonHome) {
    settingsButtonHome.addEventListener('click', (e) => {
      e.preventDefault();
      showSettings();
    });
  }
}

export function startChatWithPersonality(personalityName) {
  
  switchView(false);
  
  const mainWrapper = document.getElementById('mainWrapper');
  mainWrapper.classList.add('no-side-panel');
  
  const modelSelect = document.getElementById('modelSelect');
  modelSelect.value = personalityName;
  
  displayConversationHistory(personalityName);
}

export function deletePersonality(name) {
  if (confirm(`Are you sure you want to delete "${name}"?`)) {
    removePersonality(name);
    renderPersonalityCards();
  }
}