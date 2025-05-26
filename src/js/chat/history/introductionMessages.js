import { personality, getPersonalities } from '../../../personalities/core/personalityManager.js';
import { getCurrentUserPersona } from '../../utils/userPersonas.js';
import { getCurrentPersonality } from '../state.js';
import { getActiveChatDetails, loadChatHistories } from '../management/chatManager.js';

function replaceUserPlaceholders(text) {
  if (!text) return text;
  
  const { personalityName, chatId } = getActiveChatDetails();
  const currentPers = getCurrentPersonality();
  const histories = loadChatHistories();
  
  // Get user name from the current chat
  let userName = 'You';
  if (histories[currentPers]?.[chatId]?.personaName) {
    userName = histories[currentPers][chatId].personaName;
  } else {
    userName = getCurrentUserPersona();
  }
  
  if (userName === personalityName) {
    userName = 'You';
  }
  
  return text.replace(/{{user}}/g, userName);
}

// Function to create introduction message
export function createIntroductionMessage(personalityName) {
  const chatContainer = document.querySelector('.chat');
  if (!chatContainer) return;
  
  const personalities = getPersonalities();
  if (!personalities || !personalities[personalityName]) return;
  
  const botMessageDiv = document.createElement('div');
  botMessageDiv.className = 'bot-message introduction-container';
  
  const botName = document.createElement('p');
  botName.innerHTML = personalityName;
  botName.className = 'bot-name';
  
  const botPic = document.createElement('div');
  botPic.className = 'profile-pic bot-pic';
  
  let imgSrc = './assets/default-pfp.svg';
  if (personalities[personalityName] && personalities[personalityName].avatar) {
    imgSrc = personalities[personalityName].avatar;
  }
  botPic.innerHTML = `<img src="${imgSrc}" alt="${personalityName}" />`;
  
  const introMessageText = document.createElement('p');
  introMessageText.id = 'introduction';
  
  // Get introduction text and replace {{user}} with user personas name
  const introText = personalities[personalityName].intro || "Hi! How can I help you today?";
  introMessageText.innerHTML = replaceUserPlaceholders(introText);
  
  botMessageDiv.appendChild(botName);
  botMessageDiv.appendChild(botPic);
  botMessageDiv.appendChild(introMessageText);
  
  chatContainer.appendChild(botMessageDiv);
}

export function displayIntroductionMessage(personalityName) {
  const introductionEl = document.querySelector('#introduction');
  if (!introductionEl) return;
  
  const personalityIntro = personality(personalityName, 'intro');
  
  const botMessageContainer = introductionEl.closest('.bot-message');
  if (botMessageContainer) {
    let nameElement = botMessageContainer.querySelector('.bot-name');
    if (!nameElement) {
      nameElement = document.createElement('p');
      nameElement.className = 'bot-name';
      botMessageContainer.prepend(nameElement);
    }
    nameElement.textContent = personalityName;
    
    let picElement = botMessageContainer.querySelector('.profile-pic');
    if (!picElement) {
      picElement = document.createElement('div');
      picElement.className = 'profile-pic bot-pic';
      botMessageContainer.insertBefore(picElement, introductionEl);
    }
    
    let imgSrc = './assets/default-pfp.svg';
    const personalities = getPersonalities();
    if (!personalities[personalityName]) return;
    if (personalities[personalityName].avatar) {
      imgSrc = personalities[personalityName].avatar;
    }
    
    picElement.innerHTML = `<img src="${imgSrc}" alt="${personalityName}" />`;
    
    const introText = personalityIntro || "Hi! How can I help you today?";
    introductionEl.textContent = replaceUserPlaceholders(introText);
    
    const resendContainer = botMessageContainer.querySelector('.resend-container');
    if (resendContainer) {
      resendContainer.remove();
    }
    
    const buttonsContainer = botMessageContainer.querySelector('.message-buttons');
    if (buttonsContainer) {
      buttonsContainer.remove();
    }
    
    botMessageContainer.classList.add('introduction-container');
  }
}