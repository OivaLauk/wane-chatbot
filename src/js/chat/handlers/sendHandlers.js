import { formatText } from '../../utils/formatting.js';
import { scrollToBottom } from '../../ui/scrolling.js';
import { generateResponse } from '../generation/responseGenerator.js';
import { _currentPersonality } from '../state.js';
import { updateArrowButtonVisibility } from './navigationHandlers.js';
import { editUserMessage } from './editHandlers.js';
import { deleteUserMessage } from './deleteHandlers.js';
import { getActiveChatDetails } from '../management/chatManager.js';
import { getPersonalities } from '../../../personalities/core/personalityManager.js';
import { resendLastUserMessage } from '../navigation/messageResending.js';
import { updateDisplayedAIMessage } from '../navigation/messageDisplay.js';
import { messageGroups, currentMessageIndex } from '../state.js';
import { getCurrentChatId } from '../../utils/storage.js';
import { getCurrentPersonality } from '../state.js';
import { getCurrentUserPersona } from '../../utils/userPersonas.js';

export function navigateToOlderMessage() {
  const currentPers = getCurrentPersonality();
  const currentChatId = getCurrentChatId();
  
  if (!messageGroups[currentPers] || !messageGroups[currentPers][currentChatId]) return;
  const chatMessageGroups = messageGroups[currentPers][currentChatId];
  if (!chatMessageGroups || chatMessageGroups.length === 0) return;
  
  const lastGroup = chatMessageGroups[chatMessageGroups.length - 1];
  if (!lastGroup || !lastGroup.aiResponses || lastGroup.aiResponses.length <= 1) {
    return;
  }
  
  if (!currentMessageIndex[currentPers]) {
    currentMessageIndex[currentPers] = {};
  }
  
  const totalResponses = lastGroup.aiResponses.length;
  let currentIndex = currentMessageIndex[currentPers][currentChatId] || -1;
  
  if (currentIndex === -1) {
    if (totalResponses > 1) {
      currentMessageIndex[currentPers][currentChatId] = 0;
    } else {
      return;
    }
  } else if (currentIndex < totalResponses - 1) {
    currentMessageIndex[currentPers][currentChatId] += 1;
  } else {
    return;
  }
  
  updateDisplayedAIMessage(lastGroup);
}

export function navigateToNewerMessageOrRegenerate() {
  const currentPers = getCurrentPersonality();
  const currentChatId = getCurrentChatId();
  
  if (!messageGroups[currentPers] || !messageGroups[currentPers][currentChatId]) return;
  const chatMessageGroups = messageGroups[currentPers][currentChatId];
  if (!chatMessageGroups || chatMessageGroups.length === 0) return;
  
  const lastGroup = chatMessageGroups[chatMessageGroups.length - 1];
  if (!lastGroup || !lastGroup.aiResponses || lastGroup.aiResponses.length === 0) {
    return;
  }
  
  if (!currentMessageIndex[currentPers]) {
    currentMessageIndex[currentPers] = {};
  }
  
  let currentIndex = currentMessageIndex[currentPers][currentChatId] || -1;
  
  if (currentIndex !== -1) {
    currentMessageIndex[currentPers][currentChatId] -= 1;
    updateDisplayedAIMessage(lastGroup);
  } else {
    resendLastUserMessage();
  }
}

export async function sendMessage() {
  const chatbox = document.getElementById('chatbox');
  const message = chatbox.value.trim();
  
  if (!message) return;
  
  chatbox.value = '';
  chatbox.style.height = 'auto';
  
  const { personalityName, chatId } = getActiveChatDetails();
  if (!personalityName || !chatId) {
    console.error('No active chat for sending message');
    alert('Please select a personality to chat with');
    return;
  }
  
  const chatContainer = document.querySelector('.chat');
  
  const userMessageDiv = document.createElement('div');
  userMessageDiv.className = 'user-message';
  
  const userName = document.createElement('p');
  userName.className = 'user-name';
  userName.textContent = getCurrentUserPersona();
  
  const userPic = document.createElement('div');
  userPic.className = 'profile-pic user-pic';
  
  let userAvatarSrc = './assets/user-circle.svg';
  const personas = JSON.parse(localStorage.getItem('userPersonas') || '{}');
  const currentPersona = localStorage.getItem('currentUserPersona');
  if (currentPersona && personas[currentPersona] && personas[currentPersona].avatar) {
    userAvatarSrc = personas[currentPersona].avatar;
  }
  userPic.innerHTML = `<img src="${userAvatarSrc}" alt="User" />`;
  
  const userMessageText = document.createElement('p');
  userMessageText.innerHTML = formatText(message);
  
  userMessageDiv.appendChild(userName);
  userMessageDiv.appendChild(userPic);
  userMessageDiv.appendChild(userMessageText);
  
  const buttonsContainer = document.createElement('div');
  buttonsContainer.className = 'message-buttons';
  
  const editButton = document.createElement('button');
  editButton.className = 'edit-button';
  editButton.innerHTML = `<img src="./assets/edit.svg" alt="Edit" />`;
  editButton.addEventListener('click', function() {
    editUserMessage(userMessageDiv);
  });
  
  const deleteButton = document.createElement('button');
  deleteButton.className = 'delete-button';
  deleteButton.innerHTML = `<img src="./assets/trash.svg" alt="Delete" />`;
  deleteButton.addEventListener('click', function() {
    deleteUserMessage(userMessageDiv);
  });
  
  buttonsContainer.appendChild(editButton);
  buttonsContainer.appendChild(deleteButton);
  userMessageDiv.appendChild(buttonsContainer);
  
  chatContainer.appendChild(userMessageDiv);
  scrollToBottom(chatContainer);
  
  const typingDiv = document.createElement('div');
  typingDiv.className = 'typing-indicator';
  typingDiv.innerHTML = '<span></span><span></span><span></span>';
  chatContainer.appendChild(typingDiv);
  scrollToBottom(chatContainer);
  
  try {
    // Generate response and add it to the chat
    const response = await generateResponse(message);
    
    typingDiv.remove();
    
    const botMessageDiv = document.createElement('div');
    const botMessageText = document.createElement('p');
    const botName = document.createElement('p');
    
    botName.textContent = personalityName;
    botName.className = 'bot-name';
    
    const botPic = document.createElement('div');
    botPic.className = 'profile-pic bot-pic';
    
    let botAvatarSrc = './assets/default-pfp.svg';
    const personalities = getPersonalities();
    if (personalities[personalityName] && personalities[personalityName].avatar) {
      botAvatarSrc = personalities[personalityName].avatar;
    }
    botPic.innerHTML = `<img src="${botAvatarSrc}" alt="Bot" />`;
    
    botMessageText.innerHTML = formatText(response);
    
    botMessageDiv.className = 'bot-message';
    
    botMessageDiv.appendChild(botName);
    botMessageDiv.appendChild(botPic);
    botMessageDiv.appendChild(botMessageText);
    
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'message-buttons';
    
    const editButton = document.createElement('button');
    editButton.className = 'edit-button';
    editButton.innerHTML = `<img src="./assets/edit.svg" alt="Edit" />`;
    editButton.onclick = function(e) {
      e.stopPropagation();
      editUserMessage(botMessageDiv);
    };
    
    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-button';
    deleteButton.innerHTML = `<img src="./assets/trash.svg" alt="Delete" />`;
    deleteButton.onclick = function(e) {
      e.stopPropagation();
      deleteUserMessage(botMessageDiv);
    };
    
    buttonsContainer.appendChild(editButton);
    buttonsContainer.appendChild(deleteButton);
    botMessageDiv.appendChild(buttonsContainer);
    
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
      navigateToOlderMessage();
    });
    
    rightArrowButton.addEventListener('click', function() {
      navigateToNewerMessageOrRegenerate();
    });
    
    botMessageDiv.appendChild(resendContainer);
    chatContainer.appendChild(botMessageDiv);
    
    scrollToBottom(chatContainer);
    updateArrowButtonVisibility();
  } catch (error) {
    console.error('Error sending message:', error);
    typingDiv.remove();
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = 'Failed to generate a response. Please try again.';
    
    chatContainer.appendChild(errorDiv);
    scrollToBottom(chatContainer);
  }
}