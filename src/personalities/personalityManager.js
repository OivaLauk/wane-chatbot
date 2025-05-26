import { getPersonalities, deletePersonality as removePers } from './core/personalityManager.js';
import { setCurrentPersonality } from '../js/chat/state.js';
import { displayConversationHistory } from '../js/chat/history/conversationDisplay.js';
import { switchView } from '../js/ui/layout.js';
import { editPersonalityFromHome } from './personalityModals.js';
import { hasChats, getMostRecentChat, setActiveChat } from '../js/chat/management/chatManager.js';
import { showPersonaSelector } from '../js/chat/modals/personaSelector.js';
import { showChatListModal } from '../js/chat/modals/chatListModal.js';

// Export the deletePersonality with a different name to avoid conflicts
export const deletePersonality = removePers;

document.addEventListener('editPersonality', (e) => {
  const { name } = e.detail;
  editPersonalityFromHome(name);
});

export function startChatWithPersonality(personalityName) {
  console.log(`Starting chat with ${personalityName}`);
  
  switchView(false);
  
  setCurrentPersonality(personalityName);
  
  const modelSelect = document.getElementById('modelSelect');
  if (modelSelect) {
    modelSelect.value = personalityName;
  }
  
  displayConversationHistory(personalityName);
}


export function renderPersonalityCards() {
  const personalitiesGrid = document.getElementById('personalitiesGrid');
  if (!personalitiesGrid) return;
  
  personalitiesGrid.innerHTML = '';
  
  const personalities = getPersonalities(true);
  
  Object.keys(personalities).forEach(name => {
    const cardData = personalities[name];
    
    const card = document.createElement('div');
    card.className = 'personality-card';
    
    const hasExistingChats = hasChats(name);
    
    card.innerHTML = `
      <div class="personality-card-content">
        <div class="personality-avatar">
          <img src="${cardData.avatar || './assets/default-pfp.svg'}" alt="${name}">
        </div>
        <h3 class="personality-name">${name}</h3>
        <div class="personality-buttons">
          <button class="start-chat-btn">Start New Chat</button>
          ${hasExistingChats ? 
            `<button class="continue-chat-btn">Continue Chat</button>` : 
            ''
          }
        </div>
      </div>
      <div class="personality-actions">
        <button class="all-chats-btn personality-action-btn"><img src="./assets/message.svg" alt="All Chats"></button>
        ${name !== 'Default' ? `
        <button class="personality-edit-btn"><img src="./assets/edit.svg" alt="Edit"></button>
        <button class="personality-delete-btn"><img src="./assets/trash.svg" alt="Delete"></button>
        ` : ''}
      </div>
    `;
    
    
    const startChatBtn = card.querySelector('.start-chat-btn');
    if (startChatBtn) {
      startChatBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showPersonaSelector(name);
      });
    }
    
    const continueChatBtn = card.querySelector('.continue-chat-btn');
    if (continueChatBtn) {
      continueChatBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        
        const mostRecentChat = getMostRecentChat(name);
        if (mostRecentChat) {
          console.log("Continuing chat with:", name, "chat ID:", mostRecentChat.id);
          setActiveChat(name, mostRecentChat.id);
          switchView(false);
          
          setTimeout(() => {
            displayConversationHistory(name);
          }, 50);
        } else {
          console.error("No recent chat found for", name);
        }
      });
    }
    
    const allChatsBtn = card.querySelector('.all-chats-btn');
    if (allChatsBtn) {
      allChatsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showChatListModal(name);
      });
    }
    
    if (name !== 'Default') {
      const editBtn = card.querySelector('.personality-edit-btn');
      const deleteBtn = card.querySelector('.personality-delete-btn');
      
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        editPersonalityFromHome(name);
      });
      
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(`Are you sure you want to delete ${name}?`)) {
          const cardToRemove = e.target.closest('.personality-card');
          if (cardToRemove) {
            cardToRemove.remove();
          }
          
          deletePersonality(name);
        }
      });
    }
    
    personalitiesGrid.appendChild(card);
  });
}

export function addNewPersonalityButton() {
  const personalitiesGrid = document.getElementById('personalitiesGrid');
  if (!personalitiesGrid) return;
  
  const addNewCard = document.createElement('div');
  addNewCard.className = 'personality-card add-new-card';
  addNewCard.innerHTML = `
    <div class="personality-card-content">
      <div class="add-new-icon">+</div>
      <h3 class="personality-name">Add New</h3>
    </div>
  `;
  
  addNewCard.addEventListener('click', () => {
    const createPersonalityModal = document.getElementById('createPersonalityModal');
    if (createPersonalityModal) {
      createPersonalityModal.classList.remove('hidden');
    }
  });
  
  personalitiesGrid.appendChild(addNewCard);
}

export function refreshPersonalityGrid() {
  const personalitiesGrid = document.getElementById('personalitiesGrid');
  if (personalitiesGrid) {
    personalitiesGrid.innerHTML = '';
  }

  renderPersonalityCards();
  
  addNewPersonalityButton();
}