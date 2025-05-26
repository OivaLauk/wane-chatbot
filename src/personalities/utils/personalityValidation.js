import { getAssetPath } from '../../js/utils/paths.js';

export function validatePersonality(personality) {

  if (!personality || !personality.name || typeof personality.name !== 'string') {
    console.error('Personality must have a valid name');
    return false;
  }
  
  if (!personality.system || typeof personality.system !== 'string') {
    console.error('Personality must have a valid system prompt');
    return false;
  }
  
  return true;
}

export function sanitizePersonality(personality) {
  if (!personality || typeof personality !== 'object') {
    return null;
  }
  
  // Only include valid properties
  const sanitized = {
    name: String(personality.name || '').trim(),
    system: String(personality.system || '').trim(),
    intro: String(personality.intro || '').trim(),
    avatar: String(personality.avatar || getAssetPath('default-pfp.svg')).trim()
  };
  
  if (!sanitized.name || !sanitized.system) {
    return null;
  }
  
  return sanitized;
}

export function isCompletePersonality(personality) {
  return (
    personality &&
    typeof personality === 'object' &&
    typeof personality.name === 'string' &&
    typeof personality.system === 'string' &&
    personality.name.trim() !== '' &&
    personality.system.trim() !== ''
  );
}