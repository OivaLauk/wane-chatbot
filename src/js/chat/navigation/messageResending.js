import { config } from '../../../API.js';
import Anthropic from '@anthropic-ai/sdk';
import { formatText } from '../../utils/formatting.js';
import { 
  getCurrentChatId, 
  saveConversationHistories 
} from '../../utils/storage.js';
import { 
  getBotMemory, 
  getBotTemperature, 
  getBotMaxTokens 
} from '../../profile/settings.js';
import { personality } from '../../../personalities/core/personalityManager.js';
import { updateArrowButtonVisibility } from '../handlers/navigationHandlers.js';
import {
  messageGroups,
  currentMessageIndex,
  getCurrentPersonality
} from '../state.js';
import { updateDisplayedAIMessage, optimizeSystemPrompt } from './messageDisplay.js';
import { updateNavigationIndicators } from './navIndicators.js';
import { loadChatHistories } from '../management/chatManager.js';

const anthropic = new Anthropic({ apiKey: config.CLAUDE_API_KEY, dangerouslyAllowBrowser: true });

export async function resendLastUserMessage() {
  const currentPers = getCurrentPersonality();
  const currentChatId = getCurrentChatId();
  
  if (!currentMessageIndex[currentPers]) {
    currentMessageIndex[currentPers] = {};
  }
  currentMessageIndex[currentPers][currentChatId] = -1;
  
  const chatHistories = loadChatHistories();
  
  if (!chatHistories[currentPers] || 
      !chatHistories[currentPers][currentChatId] ||
      !chatHistories[currentPers][currentChatId].messages ||
      chatHistories[currentPers][currentChatId].messages.length === 0) {
    console.error("resendLastUserMessage: No valid conversation history found.");
    return;
  }

  const messages = chatHistories[currentPers][currentChatId].messages;
  
  const originalMessages = [...chatHistories[currentPers][currentChatId].messages];
  
  let lastUserMessageContent = null;
  let lastUserMessageIndexInHistory = -1;

  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'user') {
      lastUserMessageContent = messages[i].content;
      lastUserMessageIndexInHistory = i;
      break;
    }
  }

  if (lastUserMessageContent === null) {
    console.error("resendLastUserMessage: No user message found.");
    return;
  }

  const chatContainer = document.querySelector('.chat');
  const botMessages = chatContainer.querySelectorAll('.bot-message:not(.introduction-container)');
  if (botMessages.length === 0) {
    console.error("No bot messages found in the DOM");
    return;
  }
  
  const lastBotMessage = botMessages[botMessages.length - 1];
  const messageContent = lastBotMessage.querySelector('p:not(.bot-name)');
  
  if (!messageContent) {
    console.error("Message content element not found");
    return;
  }
  
  const leftArrow = lastBotMessage.querySelector('.left-arrow-button');
  const rightArrow = lastBotMessage.querySelector('.right-arrow-button');
  
  messageContent.innerHTML = 'Regenerating response...';
  
  const truncatedMessages = messages.slice(0, lastUserMessageIndexInHistory + 1);
  
  try {
    
    const selectedPersonalityPrompt = optimizeSystemPrompt(personality(currentPers, 'system'));
    const memory = getBotMemory();
    const recentHistory = [...truncatedMessages].slice(-memory);
    
    const apiMessages = recentHistory.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    }));
    
    const requestData = {
      model: 'claude-3-haiku-20240307',
      max_tokens: getBotMaxTokens(),
      temperature: getBotTemperature(),
      system: selectedPersonalityPrompt,
      messages: apiMessages
    };
    
    const response = await anthropic.messages.create(requestData);
    const content = response.content[0].text;
    
    messageContent.innerHTML = formatText(content);
    
    chatHistories[currentPers][currentChatId].messages = [
      ...truncatedMessages,
      {
        role: 'assistant',
        content: content,
        timestamp: new Date().toISOString()
      }
    ];
    console.log("Updated conversation history with new response");
    saveConversationHistories(chatHistories);
    
    const newResponse = {
      content,
      timestamp: new Date().toISOString()
    };

    if (!messageGroups[currentPers]) {
      messageGroups[currentPers] = {};
    }
        
    if (!messageGroups[currentPers][currentChatId]) {
      messageGroups[currentPers][currentChatId] = [];
    }
        
    const matchingGroupIndex = messageGroups[currentPers][currentChatId].findIndex(
      group => group.userMessage.content === lastUserMessageContent
    );
        
    if (matchingGroupIndex >= 0) {

      const existingResponses = 
        messageGroups[currentPers][currentChatId][matchingGroupIndex].aiResponses || [];
          
      messageGroups[currentPers][currentChatId][matchingGroupIndex].aiResponses = [
        ...existingResponses,
        newResponse
      ];
          
    } else {

      messageGroups[currentPers][currentChatId].push({
        userMessage: {
          content: lastUserMessageContent,
          timestamp: new Date().toISOString()
        },
        aiResponses: [newResponse]
      });
    }
        
    currentMessageIndex[currentPers][currentChatId] = -1;

    const updatedGroup = messageGroups[currentPers][currentChatId][
      messageGroups[currentPers][currentChatId].length - 1
    ];
    
    updateNavigationIndicators(lastBotMessage, updatedGroup);
    
    if (rightArrow) {
      rightArrow.disabled = false;
      rightArrow.style.pointerEvents = 'auto';
    }
    
    if (leftArrow) {
      leftArrow.disabled = false;
      
      const newLeftArrow = leftArrow.cloneNode(true);
      leftArrow.parentNode.replaceChild(newLeftArrow, leftArrow);
      
      newLeftArrow.addEventListener('click', function() {
        
        const currentChatId = getCurrentChatId();
        const currentPers = getCurrentPersonality();
        
        if (!messageGroups[currentPers] || !messageGroups[currentPers][currentChatId]) return;
        const chatMessageGroups = messageGroups[currentPers][currentChatId];
        if (!chatMessageGroups || chatMessageGroups.length === 0) return;

        const lastGroup = chatMessageGroups[chatMessageGroups.length - 1];
        
        if (!lastGroup || !lastGroup.aiResponses || lastGroup.aiResponses.length <= 1) {
          return;
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
    }
    
    if (rightArrow) {
      rightArrow.disabled = false;
      
      const newRightArrow = rightArrow.cloneNode(true);
      rightArrow.parentNode.replaceChild(newRightArrow, rightArrow);
      
      newRightArrow.addEventListener('click', function() {
        
        const currentChatId = getCurrentChatId();
        const currentPers = getCurrentPersonality();
        
        if (!messageGroups[currentPers] || !messageGroups[currentPers][currentChatId]) return;
        const chatMessageGroups = messageGroups[currentPers][currentChatId];
        if (!chatMessageGroups || chatMessageGroups.length === 0) return;
        
        const lastGroup = chatMessageGroups[chatMessageGroups.length - 1];
        
        if (!lastGroup || !lastGroup.aiResponses || lastGroup.aiResponses.length === 0) {
          return;
        }
        
        let currentIndex = currentMessageIndex[currentPers][currentChatId];
        
        if (currentIndex !== -1) {
          currentMessageIndex[currentPers][currentChatId] -= 1;
          updateDisplayedAIMessage(lastGroup);
        } else {
          resendLastUserMessage();
        }
      });
    }
    
    try {
      updateArrowButtonVisibility();
    } catch (error) {
      console.error("Error updating arrow button visibility:", error);
      const botMessages = document.querySelectorAll('.bot-message:not(.introduction-container)');
      if (botMessages.length > 0) {
        botMessages.forEach((msg, i) => {
          const isLast = i === botMessages.length - 1;
          const container = msg.querySelector('.resend-container');
          if (container) {
            container.style.display = isLast ? 'flex' : 'none';
          }
        });
      }
    }
    
  } catch (error) {
    console.error("Error regenerating response:", error);
    messageContent.innerHTML = "Error regenerating response. Please try again.";
    
    if (leftArrow) leftArrow.disabled = false;
    if (rightArrow) rightArrow.disabled = false;
  }
}