//Importing user data from a JSON file
// List of default personality names to prevent duplication
const DEFAULT_PERSONALITIES = [
  'Default', 
  'Rude programming assistant', 
  'Devious pranker', 
  'Pick up line generator'
];

export function importUserData(jsonData) {
  try {
    const importedData = JSON.parse(jsonData);
    
    if (!importedData.personalities) {
      return { success: false, message: "Invalid data format: personalities missing" };
    }
    
    const existingPersonalities = JSON.parse(localStorage.getItem('personalities') || '{}');
    const existingConversations = JSON.parse(localStorage.getItem('chatHistories') || '{}');
    const existingPersonas = JSON.parse(localStorage.getItem('userPersonas') || '{}');
    
    const mergedPersonalities = { ...existingPersonalities };
    Object.keys(importedData.personalities).forEach(name => {
      if (DEFAULT_PERSONALITIES.includes(name) && existingPersonalities[name]) {
        console.log(`Keeping existing default personality: ${name}`);
        return;
      }
      mergedPersonalities[name] = importedData.personalities[name];
    });
    
    const mergedConversations = { ...existingConversations };
    
    if (importedData.chatHistories) {
      Object.keys(importedData.chatHistories).forEach(personalityName => {
        if (!mergedConversations[personalityName]) {
          mergedConversations[personalityName] = {};
        }
        
        const importedChats = importedData.chatHistories[personalityName];
        Object.keys(importedChats).forEach(chatId => {
          if (!mergedConversations[personalityName][chatId]) {
            mergedConversations[personalityName][chatId] = importedChats[chatId];
          }
        });
      });
    }
    else if (importedData.conversationHistories && !importedData.chatHistories) {
      Object.keys(importedData.conversationHistories).forEach(personalityName => {
        if (!mergedConversations[personalityName]) {
          mergedConversations[personalityName] = {};
        }
        
        const importedChats = importedData.conversationHistories[personalityName];
        Object.keys(importedChats).forEach(chatId => {
          if (!mergedConversations[personalityName][chatId]) {
            mergedConversations[personalityName][chatId] = importedChats[chatId];
          }
        });
      });
    }
    
    const mergedPersonas = { ...existingPersonas };
    if (importedData.userPersonas) {
      Object.keys(importedData.userPersonas).forEach(name => {
        mergedPersonas[name] = importedData.userPersonas[name];
      });
    }
    
    localStorage.setItem('personalities', JSON.stringify(mergedPersonalities));
    localStorage.setItem('chatHistories', JSON.stringify(mergedConversations));
    localStorage.removeItem('conversationHistories');
    localStorage.setItem('userPersonas', JSON.stringify(mergedPersonas));
    
    if (importedData.settings) {
      if (importedData.settings.theme) {
        localStorage.setItem('theme', importedData.settings.theme);
      }
      if (importedData.settings.botMemory) {
        localStorage.setItem('botMemory', importedData.settings.botMemory);
      }
      if (importedData.settings.botTemperature) {
        localStorage.setItem('botTemperature', importedData.settings.botTemperature);
      }
      if (importedData.settings.botMaxTokens) {
        localStorage.setItem('botMaxTokens', importedData.settings.botMaxTokens);
      }
    }
    
    return { 
      success: true, 
      message: "Data imported successfully",
      stats: {
        personalities: Object.keys(mergedPersonalities).length,
        conversations: countAllChats(mergedConversations),
        personas: Object.keys(mergedPersonas).length
      }
    };
  } catch (error) {
    console.error("Import error:", error);
    return { success: false, message: `Import failed: ${error.message}` };
  }
}

function countAllChats(conversations) {
  let count = 0;
  Object.keys(conversations).forEach(personality => {
    count += Object.keys(conversations[personality]).length;
  });
  return count;
}

export function initImportButton() {
  const importButton = document.getElementById('importButton');
  
  if (importButton) {
    importButton.addEventListener('click', () => {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.json';
      fileInput.style.display = 'none';
      
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = importUserData(event.target.result);
          
          if (result.success) {
            alert(`Import successful!\n\nImported: ${result.stats.personalities} personalities, ${result.stats.personas} personas, and chat data.`);
            
            // Reload page to reflect changes
            setTimeout(() => {
              window.location.reload();
            }, 500);
          } else {
            alert(`Import failed: ${result.message}`);
          }
        };
        
        reader.readAsText(file);
      });
      
      document.body.appendChild(fileInput);
      fileInput.click();
      
      setTimeout(() => {
        document.body.removeChild(fileInput);
      }, 100);
    });
  }
}

// Backup prompt before importing
export function confirmImport() {
  return confirm(
    "Importing data will merge with your existing data.\n\n" +
    "• New personalities will be added\n" +
    "• Default personalities won't be overwritten\n" +
    "• New chat histories will be added\n\n" +
    "Do you want to continue?"
  );
}