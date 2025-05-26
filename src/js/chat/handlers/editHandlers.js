import { formatText } from '../../utils/formatting.js';
import { findMessageIndex, extractOriginalText } from './utils.js';
import {
  conversationHistories,
  getCurrentPersonality
} from '../state.js';
import { saveConversationHistories, getCurrentChatId } from '../../utils/storage.js';
import { loadChatHistories, saveChatHistories } from '../management/chatManager.js';

export function editUserMessage(messageDiv) {
  const messageText = messageDiv.querySelector('p:not(.user-name):not(.bot-name)');
  const buttonContainer = messageDiv.querySelector('.message-buttons');
  const originalMessage = messageText.innerHTML;
  
  const resendContainer = messageDiv.querySelector('.resend-container');
  if (resendContainer) {
    resendContainer.style.display = 'none';
  }

  const inputBox = document.createElement('textarea');
  const editControls = document.createElement('div');
  const confirmButton = document.createElement('button');
  const cancelButton = document.createElement('button');

  messageDiv.classList.add('editing'); 

  // Get raw text from history and keep line breaks
  const rawText = extractOriginalText(messageDiv);
  
  if (rawText) {
    inputBox.value = rawText;
  } else {
    inputBox.value = messageText.innerHTML
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<div>/gi, '\n')
      .replace(/<span class="ai-thought">(.*?)<\/span>/gi, '*$1*')
      .replace(/<strong class="triple-asterisk">(.*?)<\/strong>/gi, '***$1***')
      .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<em>(.*?)<\/em>/gi, '*$1*')
      .replace(/<i>(.*?)<\/i>/gi, '*$1*')
      .replace(/<pre><code class="([^"]*)">([\s\S]+?)<\/code><\/pre>/gi, '```$1\n$2\n```')
      .replace(/<\/div>|<\/?p>/gi, '')
      .replace(/&nbsp;/g, ' ');
  }
  
  inputBox.className = 'edit-input';
  editControls.className = 'edit-controls';
  
  inputBox.style.width = (messageDiv.clientWidth - 24) + 'px';
  inputBox.style.boxSizing = 'border-box';
  
  inputBox.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.max(this.scrollHeight, 100) + 'px';
  });
  
  inputBox.style.height = 'auto';
  inputBox.style.height = Math.max(inputBox.scrollHeight, 100) + 'px';
  
  confirmButton.innerHTML = `<img src="./assets/check.svg" alt="Save" />`;
  cancelButton.innerHTML = `<img src="./assets/x.svg" alt="Cancel" />`;
  
  confirmButton.className = 'confirm-button';
  cancelButton.className = 'cancel-button';

  setTimeout(() => {
    inputBox.style.height = 'auto';
    inputBox.style.height = (inputBox.scrollHeight) + 'px';
  }, 0);

  confirmButton.onclick = () => {
    const newMessage = inputBox.value.trim();
    if (newMessage) {
      messageText.innerHTML = formatText(newMessage);
      messageDiv.replaceChild(messageText, inputBox);
      messageDiv.replaceChild(buttonContainer, editControls);
      
      if (resendContainer) {
        resendContainer.style.display = 'flex';
      }
      
      const index = findMessageIndex(messageDiv);
      if (index !== -1 && conversationHistories[getCurrentPersonality()]) {
        conversationHistories[getCurrentPersonality()][index].content = newMessage;
        saveConversationHistories(conversationHistories);
      }
      
      const currentPers = getCurrentPersonality();
      const currentChatId = getCurrentChatId();
      const histories = loadChatHistories();
      
      if (histories[currentPers] && histories[currentPers][currentChatId]) {
        const allMessages = document.querySelectorAll('.user-message, .bot-message:not(.introduction-container)');
        const messageIndex = Array.from(allMessages).indexOf(messageDiv);
        
        if (messageIndex !== -1 && histories[currentPers][currentChatId].messages[messageIndex]) {
          histories[currentPers][currentChatId].messages[messageIndex].content = newMessage;
          histories[currentPers][currentChatId].updatedAt = new Date().toISOString();
          
          saveChatHistories(histories);
        }
      }
    }
    messageDiv.classList.remove('editing');
  };

  cancelButton.onclick = () => {
    messageText.innerHTML = originalMessage;
    messageDiv.replaceChild(messageText, inputBox);
    messageDiv.replaceChild(buttonContainer, editControls);
    
    if (resendContainer) {
      resendContainer.style.display = 'flex';
    }
    messageDiv.classList.remove('editing');
  };

  editControls.appendChild(confirmButton);
  editControls.appendChild(cancelButton);
  messageDiv.replaceChild(inputBox, messageText);
  messageDiv.replaceChild(editControls, buttonContainer);
  inputBox.focus();
}