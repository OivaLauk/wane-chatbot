import { 
  getCurrentChatId, 
} from '../../utils/storage.js';
import {
  currentMessageIndex,
  getCurrentPersonality
} from '../state.js';

export function updateNavigationIndicators(messageElement, messageGroup) {
  
  const currentChatId = getCurrentChatId();
  const currentPers = getCurrentPersonality();
  
  if (!currentMessageIndex[currentPers] || typeof currentMessageIndex[currentPers][currentChatId] === 'undefined') {
    if (!currentMessageIndex[currentPers]) currentMessageIndex[currentPers] = {};
    currentMessageIndex[currentPers][currentChatId] = -1; 
  }
  const currentIndex = currentMessageIndex[currentPers][currentChatId];
  const totalResponses = messageGroup?.aiResponses?.length || 0;

  if (totalResponses > 1 && currentIndex === -1) {
    console.log("Multiple responses available, latest selected");
  }

  const atLatest = currentIndex === -1;
  const atOldest = totalResponses <= 1 ? true : currentIndex >= totalResponses - 2;
  
  const leftArrow = messageElement.querySelector('.left-arrow-button');
  const rightArrow = messageElement.querySelector('.right-arrow-button');

  if (leftArrow) {
    leftArrow.disabled = atOldest;
    leftArrow.style.opacity = atOldest ? '0.5' : '1';
    console.log(`Left arrow disabled: ${atOldest}, totalResponses: ${totalResponses}, currentIndex: ${currentIndex}`);
  }

  if (rightArrow) {
    rightArrow.disabled = false;
    rightArrow.style.opacity = atLatest ? '0.75' : '1';
    rightArrow.title = atLatest ? "Regenerate response" : "Next response";
    const img = rightArrow.querySelector('img');
    if (img) {
        img.alt = atLatest ? 'Regenerate' : 'Next';
    }
  }

  let versionIndicator = messageElement.querySelector('.version-indicator');
  if (atLatest || totalResponses <= 1) {
    if (versionIndicator) {
      versionIndicator.remove();
    }
    messageElement.classList.remove('selected-message');
  } else {
    if (!versionIndicator) {
      versionIndicator = document.createElement('div');
      versionIndicator.className = 'version-indicator';
      messageElement.appendChild(versionIndicator);
    }
    const versionNumber = totalResponses - 1 - currentIndex;
    versionIndicator.textContent = `V${versionNumber}/${totalResponses}`;
    messageElement.classList.add('selected-message');
  }
  
}