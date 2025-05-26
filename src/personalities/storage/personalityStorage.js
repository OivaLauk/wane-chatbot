import { defaultPersonalities } from '../defaultPersonalities.js';

const STORAGE_KEY = 'wane_personalities'; 

export function loadPersonalitiesFromStorage() {
  try {
    const storedPersonalities = localStorage.getItem(STORAGE_KEY);
    
    if (!storedPersonalities) {
      return { ...defaultPersonalities };
    }
    
    const parsed = JSON.parse(storedPersonalities);
    
    if (!parsed || Object.keys(parsed).length === 0) {
      return { ...defaultPersonalities };
    }
    
    return parsed;
  } catch (error) {
    console.error('Error loading personalities:', error);
    return { ...defaultPersonalities };
  }
}

export function savePersonalitiesToStorage(personalities) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(personalities));
    return true;
  } catch (error) {
    console.error('Error saving personalities:', error);
    return false;
  }
}

export function importPersonalitiesFromJson(jsonString) {
  try {
    const personalities = JSON.parse(jsonString);
    
    if (!personalities || typeof personalities !== 'object') {
      throw new Error('Invalid JSON format');
    }
    
    return personalities;
  } catch (error) {
    console.error('Error importing personalities:', error);
    return null;
  }
}

export function exportPersonalitiesToJson(personalities) {
  try {
    return JSON.stringify(personalities, null, 2);
  } catch (error) {
    console.error('Error exporting personalities:', error);
    return null;
  }
}

export function migratePersonalityStorage() {
  try {
    const isFirstRun = !localStorage.getItem('app_initialized');
    
    if (isFirstRun) {
      console.log("First application run - initializing with defaults only");
      localStorage.setItem('wane_personalities', JSON.stringify(defaultPersonalities));
      localStorage.setItem('app_initialized', 'true');
      return;
    }
    
    const oldData = localStorage.getItem('personalities');
    if (oldData) {
      console.log("Migrating from 'personalities' to 'wane_personalities'");
      localStorage.setItem('wane_personalities', oldData);
      localStorage.removeItem('personalities');
    }
    
    if (!localStorage.getItem('wane_personalities')) {
      console.log("No personalities found, initializing defaults");
      localStorage.setItem('wane_personalities', JSON.stringify(defaultPersonalities));
    }
  } catch (error) {
    console.error("Error during personality storage migration:", error);
  }
}