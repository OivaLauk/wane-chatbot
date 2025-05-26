import { loadUserPersonas } from '../../utils/userPersonas.js';
import { createNewChat, setActiveChat } from '../management/chatManager.js';
import { switchView } from '../../ui/layout.js';
import { displayConversationHistory } from '../history/conversationDisplay.js';
import { setCurrentUserPersona } from '../../utils/userPersonas.js';

let personaSelectorModal = null;

function formatDescription(personaDescription) {
  if(personaDescription.length > 30) {
      return personaDescription = personaDescription.substring(0, 30) + '...';
  } else {
    return personaDescription;
  }
}

export function showPersonaSelector(personalityName) {
  if (!personaSelectorModal) {
    personaSelectorModal = document.createElement('div');
    personaSelectorModal.id = 'personaSelectorModal';
    personaSelectorModal.className = 'modal persona-selector-modal';
    document.body.appendChild(personaSelectorModal);
  }
  
  const personas = loadUserPersonas();
  const hasCustomPersonas = Object.keys(personas).length > 0;
  
  personaSelectorModal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>Select Persona for Chat</h2>
        <button class="close-button">&times;</button>
      </div>
      <div class="modal-body">
        <p>Choose which persona you want to use for this chat with ${personalityName}:</p>
        
        <div class="persona-list">
          <div class="persona-item" data-persona="You">
            <div class="persona-info">
              <h3>Default (You)</h3>
              <p>Chat as yourself without a specific persona</p>
            </div>
            <button class="select-persona-btn">Select</button>
          </div>
          
          ${hasCustomPersonas ? 
            Object.entries(personas).map(([name, data]) => `
              <div class="persona-item" data-persona="${name}">
                <div class="persona-info">
                  <h3>${name}</h3>
                  <p>${formatDescription(data.description) || 'No description'}</p>
                </div>
                <button class="select-persona-btn">Select</button>
              </div>
            `).join('') : ''
          }
        </div>
      </div>
    </div>
  `;
  
  personaSelectorModal.classList.remove('hidden');
  
  const closeButton = personaSelectorModal.querySelector('.close-button');
  closeButton.addEventListener('click', () => {
    personaSelectorModal.classList.add('hidden');
  });
  
  const selectButtons = personaSelectorModal.querySelectorAll('.select-persona-btn');
  selectButtons.forEach(button => {
    button.addEventListener('click', () => {
      const personaItem = button.closest('.persona-item');
      const personaName = personaItem.dataset.persona;
      
      const { chatId } = createNewChat(personalityName);
      
      setCurrentUserPersona(personaName, personalityName, chatId);

      setActiveChat(personalityName, chatId);
      
      personaSelectorModal.classList.add('hidden');
      
      switchView(false);
      displayConversationHistory(personalityName);
    });
  });
}
