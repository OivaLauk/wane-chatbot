import { 
  getChatsForPersonality, 
  renameChat, 
  deleteChat,
  setActiveChat
} from '../management/chatManager.js';
import { switchView } from '../../ui/layout.js';
import { displayConversationHistory } from '../history/conversationDisplay.js';
import { updatePersonalityCardButtons } from '../../../personalities/core/personalityManager.js';
import { renderPersonalityCards } from '../../../personalities/personalityManager.js';

let chatListModal = null;

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

export function showChatListModal(personalityName) {
  if (!chatListModal) {
    chatListModal = document.createElement('div');
    chatListModal.id = 'chatListModal';
    chatListModal.className = 'modal chat-list-modal';
    document.body.appendChild(chatListModal);
  }
  
  const chats = getChatsForPersonality(personalityName);
  
  chatListModal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>Chats with ${personalityName}</h2>
        <button class="close-button">&times;</button>
      </div>
      <div class="modal-body">
        ${chats.length > 0 ? `
          <div class="chat-list">
            ${chats.map(chat => `
              <div class="chat-item" data-chat-id="${chat.id}">
                <div class="chat-item-info">
                  <div class="chat-name-container">
                    <h3 class="chat-name">${chat.name}</h3>
                    <button class="edit-name-btn" title="Rename chat">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                      </svg>
                    </button>
                  </div>
                  <p class="chat-details">
                    <span class="chat-date">Last updated: ${formatDate(chat.updatedAt)}</span><br>
                    <span class="chat-persona">Persona: ${chat.personaName}</span>
                  </p>
                </div>
                <div class="chat-item-actions">
                  <button class="open-chat-btn">Open</button>
                  <button class="delete-chat-btn" title="Delete chat">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <p class="no-chats-message">No chats found with ${personalityName}</p>
        `}
      </div>
    </div>
  `;
  
  chatListModal.classList.remove('hidden');
  
  setupChatListEventListeners(personalityName);
}

function setupChatListEventListeners(personalityName) {
  const closeButton = chatListModal.querySelector('.close-button');
  if (closeButton) {
    closeButton.addEventListener('click', () => {
      chatListModal.classList.add('hidden');
    });
  }
  
  const openChatButtons = chatListModal.querySelectorAll('.open-chat-btn');
  openChatButtons.forEach(button => {
    button.addEventListener('click', () => {
      const chatItem = button.closest('.chat-item');
      const chatId = chatItem.dataset.chatId;
      
      setActiveChat(personalityName, chatId);
      chatListModal.classList.add('hidden');
      
      switchView(false);
      displayConversationHistory(personalityName);
    });
  });
  
  const editNameButtons = chatListModal.querySelectorAll('.edit-name-btn');
  editNameButtons.forEach(button => {
    button.addEventListener('click', () => {
      const chatItem = button.closest('.chat-item');
      const chatId = chatItem.dataset.chatId;
      const chatNameEl = chatItem.querySelector('.chat-name');
      const currentName = chatNameEl.textContent;
      
      const newName = prompt('Enter new chat name:', currentName);
      if (newName && newName.trim() !== '') {
        renameChat(personalityName, chatId, newName.trim());
        chatNameEl.textContent = newName.trim();
      }
    });
  });
  
  const deleteChatButtons = chatListModal.querySelectorAll('.delete-chat-btn');
  deleteChatButtons.forEach(button => {
    button.addEventListener('click', () => {
      const chatItem = button.closest('.chat-item');
      const chatId = chatItem.dataset.chatId;
      
      if (confirm('Are you sure you want to delete this chat? This action cannot be undone.')) {
        deleteChat(personalityName, chatId);
        chatItem.remove();
        
        const chatItems = chatListModal.querySelectorAll('.chat-item');
        if (chatItems.length === 0) {
          const chatList = chatListModal.querySelector('.chat-list');
          if (chatList) {
            chatList.innerHTML = `<p class="no-chats-message">No chats found with ${personalityName}</p>`;
          }
        }
        
        updatePersonalityCardButtons(personalityName);
      }
    });
  });
  
  setupModalCloseListener(personalityName);
}

function setupModalCloseListener(personalityName) {
  const closeButton = chatListModal.querySelector('.close-button');
  closeButton.addEventListener('click', () => {
    renderPersonalityCards();
  });
}