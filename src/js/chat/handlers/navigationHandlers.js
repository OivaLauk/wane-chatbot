import { 
  messageGroups,
  currentMessageIndex,
  getCurrentPersonality 
} from '../state.js';
import { getCurrentChatId } from '../../utils/storage.js';
import { updateDisplayedAIMessage } from '../navigation/messageDisplay.js';
import { resendLastUserMessage } from '../navigation/messageResending.js';

export function navigateToOlderMessage() {
  const currentPers = getCurrentPersonality();
  const currentChatId = getCurrentChatId();

  if (!messageGroups[currentPers] || !messageGroups[currentPers][currentChatId]) return;
  const chatMessageGroups = messageGroups[currentPers][currentChatId];
  if (!chatMessageGroups || chatMessageGroups.length === 0) return;

  const lastGroup = chatMessageGroups[chatMessageGroups.length - 1];
  if (!lastGroup || !lastGroup.aiResponses || lastGroup.aiResponses.length <= 1) return;

  if (!currentMessageIndex[currentPers]) currentMessageIndex[currentPers] = {};

  const totalResponses = lastGroup.aiResponses.length;
  let currentIndex = currentMessageIndex[currentPers][currentChatId] || -1;

  if (currentIndex === -1 && totalResponses > 1) {
    currentMessageIndex[currentPers][currentChatId] = 0;
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
  if (!lastGroup || !lastGroup.aiResponses || lastGroup.aiResponses.length === 0) return;

  if (!currentMessageIndex[currentPers]) currentMessageIndex[currentPers] = {};

  let currentIndex = currentMessageIndex[currentPers][currentChatId] || -1;

  if (currentIndex !== -1) {
    currentMessageIndex[currentPers][currentChatId] -= 1;
    updateDisplayedAIMessage(lastGroup);
  } else {
    resendLastUserMessage();
  }
}

export function updateArrowButtonVisibility() {
  const chatContainer = document.querySelector('.chat');
  const botMessages = chatContainer.querySelectorAll('.bot-message:not(.introduction-container)');
  
  if (botMessages.length <= 0) return;
  
  // Remove arrow buttons from all but the last bot message
  botMessages.forEach((messageEl, index) => {
    const isLastMessage = index === botMessages.length - 1;
    const resendContainer = messageEl.querySelector('.resend-container');
    
    if (!isLastMessage && resendContainer) {
      resendContainer.remove();
    }
  });
}

// Readd arrow buttons (for example if messages were deleted)
export function readdResendArrows() {
  const chatContainer = document.querySelector('.chat');
  const botMessages = chatContainer.querySelectorAll('.bot-message:not(.introduction-container)');
  
  if (botMessages.length <= 0) return;
  
  botMessages.forEach(messageEl => {
    const resendContainer = messageEl.querySelector('.resend-container');
    if (resendContainer) {
      resendContainer.remove();
    }
  });
  
  const lastBotMessage = botMessages[botMessages.length - 1];
  if (!lastBotMessage) return;
  
  const resendContainer = document.createElement('div');
  resendContainer.className = 'resend-container';
  
  const leftArrowButton = document.createElement('button');
  leftArrowButton.className = 'arrow-button left-arrow-button';
  leftArrowButton.innerHTML = `<img src="./assets/arrow-badge-left.svg" alt="Left Arrow" />`;
  
  const rightArrowButton = document.createElement('button');
  rightArrowButton.className = 'arrow-button right-arrow-button';
  rightArrowButton.innerHTML = `<img src="./assets/arrow-badge-right.svg" alt="Right Arrow" />`;
  
  leftArrowButton.addEventListener('click', navigateToOlderMessage);
  rightArrowButton.addEventListener('click', navigateToNewerMessageOrRegenerate);
  
  resendContainer.appendChild(leftArrowButton);
  resendContainer.appendChild(rightArrowButton);
  lastBotMessage.appendChild(resendContainer);
  
  const currentPers = getCurrentPersonality();
  const currentChatId = getCurrentChatId();
  
  if (messageGroups[currentPers]?.[currentChatId]?.length > 0) {
    const lastGroup = messageGroups[currentPers][currentChatId][
      messageGroups[currentPers][currentChatId].length - 1
    ];
    
    if (lastGroup) {
      updateDisplayedAIMessage(lastGroup);
    }
  }
}