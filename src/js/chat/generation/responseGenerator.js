import Anthropic from '@anthropic-ai/sdk';
import { personality } from '../../../personalities/core/personalityManager.js';
import { config } from '../../../API.js';
import { getBotMemory, getBotTemperature, getBotMaxTokens } from '../../profile/settings.js';
import { getCurrentUserPersona } from '../../utils/userPersonas.js';
import { optimizeSystemPrompt } from '../navigation/messageDisplay.js';
import {
  getCurrentPersonality,
  setCurrentPersonality
} from '../state.js';
import {
  getCurrentChatMessages,
  saveUserMessage,
  saveAIResponse,
  updateChatNameFromFirstMessage
} from '../management/chatUpdater.js';
import { getActiveChatDetails } from '../management/chatManager.js';
import { messageGroups } from '../state.js';
import { getCurrentChatId } from '../../utils/storage.js';

const anthropic = new Anthropic({ apiKey: config.CLAUDE_API_KEY, dangerouslyAllowBrowser: true });

function prepareChatMessages(messages) {
  const apiMessages = messages.map((msg) => {
    let messageText = msg.content || "(empty message)";
    
    if (msg.role === 'user') {
      const currentPersona = getCurrentUserPersona();
      if (currentPersona && currentPersona !== 'You') {
        const personas = JSON.parse(localStorage.getItem('userPersonas') || '{}');
        const personaInfo = personas[currentPersona];
        if (personaInfo && personaInfo.description) {
          messageText = `[Speaking as: ${currentPersona}]\n[Persona: ${personaInfo.description}]\n\n${messageText}`;
        } else {
          messageText = `[Speaking as: ${currentPersona}]\n\n${messageText}`;
        }
      }
    }
    
    return {
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: messageText
    };
  });
  
  return apiMessages;
}

// Main function to generate AI response
export async function generateResponse(message) {
  try {
    const selectedModelPersonality = document.getElementById('modelSelect').value;
    setCurrentPersonality(selectedModelPersonality);

    const currentPers = getCurrentPersonality();
    
    const { chatId } = getActiveChatDetails();
    if (!chatId) {
      console.error('No active chat for generating response');
      return "Error: No active chat.";
    }
    
    saveUserMessage(message);
    
    updateChatNameFromFirstMessage(message);
    
    const selectedPersonalityPrompt = optimizeSystemPrompt(personality(currentPers, 'system'));

    // Makes sure the bot doesn't take on the user's persona
    const enhancedSystemPrompt = `${selectedPersonalityPrompt}
    IMPORTANT: You are the "${currentPers}" personality as described above. Respond according to this personality ONLY, not based on any user persona information. The user may be roleplaying or using a persona, but you must maintain your own distinct personality regardless of how the user presents themselves.`;

    const memory = getBotMemory();
    const recentMessages = getCurrentChatMessages().slice(-memory);
    
    // Get messages for Claude API
    const apiMessages = prepareChatMessages(recentMessages, selectedPersonalityPrompt);

    const requestData = {
      model: 'claude-3-haiku-20240307',
      max_tokens: getBotMaxTokens(),
      temperature: getBotTemperature(),
      system: enhancedSystemPrompt,
      messages: apiMessages
    };

    // Generate response
    const response = await anthropic.messages.create(requestData);
    const content = response.content[0].text;

    saveAIResponse(content);
    
    const currentChatId = getCurrentChatId();
    
    if (!messageGroups[currentPers]) {
      messageGroups[currentPers] = {};
    }
    
    if (!messageGroups[currentPers][currentChatId]) {
      messageGroups[currentPers][currentChatId] = [];
    }
    
    let lastGroup = messageGroups[currentPers][currentChatId].length > 0 ? 
      messageGroups[currentPers][currentChatId][messageGroups[currentPers][currentChatId].length - 1] : 
      null;
      
    if (!lastGroup || lastGroup.userMessage.content !== message) {
      messageGroups[currentPers][currentChatId].push({
        userMessage: { content: message, timestamp: new Date().toISOString() },
        aiResponses: [{ content, timestamp: new Date().toISOString() }]
      });
    } else {
      lastGroup.aiResponses.push({ content, timestamp: new Date().toISOString() });
    }
    
    return content;
  } catch (error) {
    console.error('Error generating response:', error);
    throw error;
  }
}

// Function to generate a chat name based on first message
export function generateChatName(userMessage) {
  const truncatedMessage = userMessage.substring(0, 30).trim();
  const chatName = truncatedMessage + (userMessage.length > 30 ? '...' : '');
  return chatName || `Chat with ${getCurrentPersonality()}`;
}