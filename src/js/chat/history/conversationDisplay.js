import { getPersonalities } from '../../../personalities/core/personalityManager.js';
import { 
  createNewChat as originalCreateNewChat,
  getCurrentChatId
} from '../../utils/storage.js';
import { editUserMessage } from '../handlers/editHandlers.js';
import { deleteUserMessage } from '../handlers/deleteHandlers.js';
import { formatText } from '../../utils/formatting.js';
import { 
  updateDisplayedAIMessage 
} from '../navigation/messageDisplay.js';
import { 
  resendLastUserMessage 
} from '../navigation/messageResending.js';
import {
  messageGroups,
  currentMessageIndex,
  conversationHistories,
  initializeMessageGroups,
  getCurrentPersonality,
  setCurrentPersonality
} from '../state.js';
import { displayIntroductionMessage } from './introductionMessages.js';
import { updateArrowButtonVisibility } from '../handlers/navigationHandlers.js';
import { saveChatHistories, loadChatHistories } from '../management/chatManager.js';
import { getCurrentUserPersona, setCurrentUserPersona } from '../../utils/userPersonas.js';

export function createNewChat(personalityName, name = null) {
  const chatId = generateChatId();
  const histories = loadChatHistories();
  
  if (!histories[personalityName]) {
    histories[personalityName] = {};
  }
  
  let userPersona = getCurrentUserPersona();
  
  // Create chat with persona name
  histories[personalityName][chatId] = {
    id: chatId,
    name: name || `Chat with ${personalityName}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [],
    personaName: userPersona
  };
  
  setCurrentUserPersona(userPersona, personalityName, chatId);
  
  saveChatHistories(histories);
  return { chatId };
}

export function displayConversationHistory(personalityName) {
  setCurrentPersonality(personalityName);
  const currentPers = getCurrentPersonality();
  
  initializeMessageGroups();
  
  const introductionEl = document.querySelector('#introduction');
  if (introductionEl) {
    displayIntroductionMessage(personalityName);
  }
  
  const chatContainer = document.querySelector('.chat');
  chatContainer.querySelectorAll('.user-message, .bot-message').forEach(element => {
    if (element.querySelector('#introduction')) {
      return;
    }
    element.remove();
  });
  
  let currentChatId = localStorage.getItem('currentChatId');
  
  const histories = loadChatHistories();
  if (!histories[currentPers] || !histories[currentPers][currentChatId]) {
    const personalityChatIds = histories[currentPers] ? Object.keys(histories[currentPers]) : [];
    
    if (personalityChatIds.length > 0) {
      currentChatId = personalityChatIds.sort((a, b) => {
        const chatA = histories[currentPers][a];
        const chatB = histories[currentPers][b];
        return new Date(chatB.updatedAt || 0) - new Date(chatA.updatedAt || 0);
      })[0];
      
      localStorage.setItem('currentChatId', currentChatId);
    } else {

      const result = originalCreateNewChat(currentPers, getCurrentUserPersona());
      currentChatId = result.chatId;
    }
  }
  
  if (!histories[currentPers] || !histories[currentPers][currentChatId]) {
    return;
  }
  
  const chatMessages = histories[currentPers][currentChatId].messages || [];
  
  // Build message UI from history
  if (Array.isArray(chatMessages)) {
    chatMessages.forEach(msg => {
      const messageElement = document.createElement('div');
      messageElement.className = msg.role === 'user' ? 'user-message' : 'bot-message';
      
      const nameElement = document.createElement('p');
      nameElement.className = msg.role === 'user' ? 'user-name' : 'bot-name';
      
      // Make sure we use the persona name stored with the chat
      if (msg.role === 'user') {
        if (histories[currentPers][currentChatId].personaName) {
          nameElement.textContent = histories[currentPers][currentChatId].personaName;
        } else {
          nameElement.textContent = localStorage.getItem('currentUserPersona') || 'You';
        }
      } else {
        nameElement.textContent = personalityName;
      }
      messageElement.appendChild(nameElement);
      
      const picElement = document.createElement('div');
      picElement.className = msg.role === 'user' ? 'profile-pic user-pic' : 'profile-pic bot-pic';
      
      let imgSrc = msg.role === 'user' ? './assets/user-circle.svg' : './assets/default-pfp.svg';
      
      const personalities = getPersonalities();
      if (msg.role === 'assistant' && personalities[personalityName] && personalities[personalityName].avatar) {
        imgSrc = personalities[personalityName].avatar;
      }
      
      picElement.innerHTML = `<img src="${imgSrc}" alt="${msg.role === 'user' ? 'User' : 'Bot'}" />`;
      messageElement.appendChild(picElement);
    
      const messageContent = document.createElement('p');
      messageContent.innerHTML = formatText(msg.content);
      messageElement.appendChild(messageContent);
    
      const buttonsContainer = document.createElement('div');
      buttonsContainer.className = 'message-buttons';
      
      const editButton = document.createElement('button');
      editButton.className = 'edit-button';
      editButton.innerHTML = `<img src="./assets/edit.svg" alt="Edit" />`;
      
      editButton.onclick = function(e) {
        e.stopPropagation();
        editUserMessage(messageElement);
      };
      
      const deleteButton = document.createElement('button');
      deleteButton.className = 'delete-button';
      deleteButton.innerHTML = `<img src="./assets/trash.svg" alt="Delete" />`;
      
      deleteButton.onclick = function(e) {
        e.stopPropagation();
        deleteUserMessage(messageElement);
      };
      
      buttonsContainer.appendChild(editButton);
      buttonsContainer.appendChild(deleteButton);
      
      messageElement.appendChild(buttonsContainer);
      
      if (msg.role === 'assistant' && !messageElement.classList.contains('introduction-container')) {
        const resendContainer = document.createElement('div');
        resendContainer.className = 'resend-container';
        
        const leftArrowButton = document.createElement('button');
        leftArrowButton.className = 'arrow-button left-arrow-button';
        leftArrowButton.innerHTML = `<img src="./assets/arrow-badge-left.svg" alt="Left Arrow" />`;
        
        const rightArrowButton = document.createElement('button');
        rightArrowButton.className = 'arrow-button right-arrow-button';
        rightArrowButton.innerHTML = `<img src="./assets/arrow-badge-right.svg" alt="Right Arrow" />`;
        
        resendContainer.appendChild(leftArrowButton);
        resendContainer.appendChild(rightArrowButton);
        
        leftArrowButton.addEventListener('click', function() {
          const currentChatId = getCurrentChatId();
          const currentPers = getCurrentPersonality();

          if (!messageGroups[currentPers]) {
            messageGroups[currentPers] = {};
            return;
          }
          
          if (!messageGroups[currentPers][currentChatId]) {
            messageGroups[currentPers][currentChatId] = [];
            return;
          }
          
          const chatMessageGroups = messageGroups[currentPers][currentChatId];
          if (!chatMessageGroups || chatMessageGroups.length === 0) return;

          const lastGroup = chatMessageGroups[chatMessageGroups.length - 1];
          
          if (!lastGroup || !lastGroup.aiResponses || lastGroup.aiResponses.length <= 1) {
            return;
          }

          if (!currentMessageIndex[currentPers]) {
            currentMessageIndex[currentPers] = {};
          }
          
          if (currentMessageIndex[currentPers][currentChatId] === undefined) {
            currentMessageIndex[currentPers][currentChatId] = -1;
          }

          const totalResponses = lastGroup.aiResponses.length;
          let currentIndex = currentMessageIndex[currentPers][currentChatId];

          if (currentIndex === -1) {
            if (totalResponses > 1) {
              currentMessageIndex[currentPers][currentChatId] = 0;
            } else {
              return;
            }
          } else if (currentIndex < totalResponses - 2) {
            currentMessageIndex[currentPers][currentChatId] += 1;
          } else {
            return;
          }
          
          updateDisplayedAIMessage(lastGroup);
        });

        rightArrowButton.addEventListener('click', function() {
          const currentChatId = getCurrentChatId();
          const currentPers = getCurrentPersonality();

          if (!messageGroups[currentPers]) {
            messageGroups[currentPers] = {};
            return;
          }
          
          if (!messageGroups[currentPers][currentChatId]) {
            messageGroups[currentPers][currentChatId] = [];
            return;
          }
          
          const chatMessageGroups = messageGroups[currentPers][currentChatId];
          if (!chatMessageGroups || chatMessageGroups.length === 0) return;
          
          const lastGroup = chatMessageGroups[chatMessageGroups.length - 1];

          if (!lastGroup || !lastGroup.aiResponses || lastGroup.aiResponses.length === 0) {
            return;
          }

          if (!currentMessageIndex[currentPers]) {
            currentMessageIndex[currentPers] = {};
          }
          
          if (currentMessageIndex[currentPers][currentChatId] === undefined) {
            currentMessageIndex[currentPers][currentChatId] = -1;
          }

          let currentIndex = currentMessageIndex[currentPers][currentChatId];

          if (currentIndex !== -1) {
            currentMessageIndex[currentPers][currentChatId] -= 1;
            updateDisplayedAIMessage(lastGroup);
          } else {
            resendLastUserMessage();
          }
        });
        
        messageElement.appendChild(resendContainer);
      }
      
      chatContainer.appendChild(messageElement);
    });
  }
  updateArrowButtonVisibility();

  // Update the current persona based on the loaded chat
  if (histories[currentPers] && histories[currentPers][currentChatId] && 
      histories[currentPers][currentChatId].personaName) {
    setCurrentUserPersona(
      histories[currentPers][currentChatId].personaName,
      currentPers,
      currentChatId
    );
  }
}

export function cleanConversationHistory() {
  const histories = loadChatHistories();
  
  Object.keys(conversationHistories).forEach(personalityName => {
    if (!conversationHistories[personalityName]) return;
    
    const personalityChats = conversationHistories[personalityName];
    
    Object.keys(personalityChats).forEach(chatId => {
      const chat = personalityChats[chatId];
      
      if (chat && Array.isArray(chat.messages)) {
        chat.messages = chat.messages.map(msg => {
          let content = msg.content;
          
          if (Array.isArray(content)) {
            if (content[0] && !content[0].text) {
              content = "(empty message)";
            } else if (content[0] && content[0].text) {
              content = content[0].text;
            }
          }
          
          return {
            role: msg.role,
            content: content,
            timestamp: msg.timestamp || new Date().toISOString()
          };
        });
      }
    });
  });
  
  saveChatHistories(histories);
}