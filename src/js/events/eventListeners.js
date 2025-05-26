import { setCurrentPersonality } from '../chat/state.js';
import { clearChat } from '../chat/management/clearChat.js';
import { displayConversationHistory } from '../chat/history/conversationDisplay.js';
import { toggleTheme, initializeTheme } from '../ui/theme.js';
import { initializePersonalityForm } from '../../personalities/createPersonality.js';
import { getPersonalities } from '../../personalities/core/personalityManager.js';

export function initializeModelSelect() {
  const modelSelect = document.getElementById('modelSelect');
  
  modelSelect.addEventListener('change', function() {
    
    setCurrentPersonality(this.value);
    
    const chatContainer = document.querySelector('.chat');
    chatContainer.querySelectorAll('.user-message, .bot-message').forEach(element => {
      if (element.querySelector('#introduction')) {
        return;
      }
      element.remove();
    });
    
    displayConversationHistory(this.value);
  });
}

export function initializeEventListeners() {
    const clearChatBtn = document.getElementById('clearChat');
    if (clearChatBtn) {
        clearChatBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear this chat? This cannot be undone.')) {
                clearChat(true);
            }
        });
    }

    const chatbox = document.getElementById('chatbox');
    if (chatbox) {
        chatbox.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                window.sendMessage();
            }
            
            if (e.key === 'Enter' && e.shiftKey) {
            }
        });
        
        chatbox.addEventListener('input', function() {
            const minHeight = 120;
            const maxHeight = 300;
            
            if (this.scrollHeight > this.clientHeight) {
                const newHeight = Math.min(this.scrollHeight, maxHeight);
                this.style.height = newHeight + 'px';
            }
            
            if (this.value.length > 0) {
                this.classList.add('expanded');
            } else {
                this.style.height = minHeight + 'px';
                this.classList.remove('expanded');
            }
        });
    }

    const themeButton = document.getElementById('themeToggle');
    if (themeButton) {
        themeButton.addEventListener('click', toggleTheme);
        initializeTheme();
    }

    const formToggle = document.getElementById('formToggle');
    const personalityForm = document.getElementById('personalityForm');
    if (formToggle && personalityForm) {
        initializePersonalityForm();
    }
    
    const personalities = getPersonalities();
    if (personalities) {
        const modelSelect = document.getElementById('modelSelect');
        Object.keys(personalities).forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            modelSelect.appendChild(option);
        });
    }

    if (chatbox) {
        setTimeout(() => {
            chatbox.style.height = '120px';
            if (chatbox.value.length > 0) {
                chatbox.style.height = Math.min(Math.max(chatbox.scrollHeight, 80), 200) + 'px';
                chatbox.classList.add('expanded');
            }
        }, 100);
    }
}