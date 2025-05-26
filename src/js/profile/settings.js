import { exportAllUserData } from '../utils/exportData.js';
import { importUserData } from '../utils/importData.js';

export function showSettings() {
  let settingsModal = document.getElementById('settingsModal');
  if (!settingsModal) {
    settingsModal = document.createElement('div');
    settingsModal.id = 'settingsModal';
    settingsModal.className = 'profile-form settings-form';
    
    settingsModal.innerHTML = `
      <h2>Settings</h2>
      
      <div class="settings-form-content">
        <!-- Bot Configuration Section -->
        <div class="settings-section">
          <h3>Bot Configuration</h3>
          
          <div class="settings-group">
            <label for="memoryInput" class="settings-label">Bot memory:</label>
            <div class="settings-input-group">
              <input
                type="number"
                id="memoryInput"
                class="settings-input"
                min="1"
                max="100"
                placeholder="Enter memory value (1-100)"
              />
              <p class="settings-description">Number of messages to remember (1-100). Higher values use more context.</p>
            </div>
          </div>
          
          <div class="settings-group">
            <label for="temperatureInput" class="settings-label">Temperature:</label>
            <div class="settings-input-group">
              <input
                type="number"
                id="temperatureInput"
                class="settings-input"
                min="0"
                max="1"
                step="0.1"
                placeholder="0.0 - 1.0"
              />
              <p class="settings-description">Controls creativity (0-1). Higher values = more creative, lower values = more logical.</p>
            </div>
          </div>
          
          <div class="settings-group">
            <label for="maxtokensInput" class="settings-label">Max tokens:</label>
            <div class="settings-input-group">
              <input 
                type="number"
                id="maxtokensInput"
                class="settings-input"
                min="100"
                max="4096"
                placeholder="100 - 4096"
              />
              <p class="settings-description">Maximum length of response (100-4096). Higher values allow longer responses.</p>
            </div>
          </div>
        </div>
        
        <!-- Data Management Section -->
        <div class="data-section">
          <h3>Manage Data</h3>          
          <div class="data-group">
            <button id="exportButton" class="settings-button">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 12l-4-4h2.5V3h3v5H12l-4 4z"/>
                <path d="M13 13H3v-2H1v4h14v-4h-2v2z"/>
              </svg>
              Export Data
            </button>
            <button id="importButton" class="settings-button">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 4l4 4h-2.5v5h-3V8H4l4-4z"/>
                <path d="M13 13H3v-2H1v4h14v-4h-2v2z"/>
              </svg>
              Import Data
            </button>
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="modal-buttons">
          <button type="button" id="settingsCancelButton" class="cancel-button">Cancel</button>
          <button type="button" id="settingsSaveButton" class="save-button">Save Changes</button>
        </div>
      </div>
    `;
    document.body.appendChild(settingsModal);
    
    setupSettingsModalListeners();
  } else {
    settingsModal.classList.remove('hidden');
  }

  loadSettingsValues();
}


function loadSettingsValues() {

  const memoryInput = document.getElementById('memoryInput');
  const savedMemory = localStorage.getItem('botMemory') || '10';
  if (memoryInput) {
    memoryInput.value = savedMemory;
  }
  
  const temperatureInput = document.getElementById('temperatureInput');
  const savedTemperature = localStorage.getItem('botTemperature') || '1.0';
  if (temperatureInput) {
    temperatureInput.value = savedTemperature;
  }
  
  const maxtokensInput = document.getElementById('maxtokensInput');
  const savedMaxTokens = localStorage.getItem('botMaxTokens') || '2048';
  if (maxtokensInput) {
    maxtokensInput.value = savedMaxTokens;
  }
}

function setupSettingsModalListeners() {
  const memoryInput = document.getElementById('memoryInput');
  if (memoryInput) {
    memoryInput.addEventListener('input', function() {
      let value = parseInt(this.value);
      if (isNaN(value)) {
        this.value = '';
      } else if (value > 100) {
        this.value = 100;
      } else if (value < 1) {
        this.value = 1;
      }
    });
  }
  
  const temperatureInput = document.getElementById('temperatureInput');
  if (temperatureInput) {
    temperatureInput.addEventListener('input', function() {
      let value = parseFloat(this.value);
      if (isNaN(value)) {
        this.value = '';
      } else if (value > 1) {
        this.value = 1;
      } else if (value < 0) {
        this.value = 0;
      }
    });
  }
  
  const maxtokensInput = document.getElementById('maxtokensInput');
  if (maxtokensInput) {
    maxtokensInput.addEventListener('input', function() {
      let value = parseInt(this.value);
      if (isNaN(value)) {
        this.value = '';
      } else if (value > 4096) {
        this.value = 4096;
      } else if (value < 100) {
        this.value = 100;
      }
    });
  }
  
  const saveButton = document.getElementById('settingsSaveButton');
  const cancelButton = document.getElementById('settingsCancelButton');
  
  if (saveButton) {
    saveButton.addEventListener('click', () => {
      const memoryValue = document.getElementById('memoryInput').value.trim() || '10';
      localStorage.setItem('botMemory', memoryValue);
      
      const memoryElement = document.getElementById('memory');
      if (memoryElement) {
        memoryElement.value = memoryValue;
      }
      
      const temperatureValue = document.getElementById('temperatureInput').value.trim() || '1.0';
      localStorage.setItem('botTemperature', temperatureValue);
      
      const maxTokensValue = document.getElementById('maxtokensInput').value.trim() || '2048';
      localStorage.setItem('botMaxTokens', maxTokensValue);
      
      document.getElementById('settingsModal').classList.add('hidden');
    });
  }
  
  if (cancelButton) {
    cancelButton.addEventListener('click', () => {
      document.getElementById('settingsModal').classList.add('hidden');
    });
  }

  // Exporting data functionality
  const exportButton = document.getElementById('exportButton');
  if (exportButton) {
    exportButton.addEventListener('click', () => {
      try {
        const result = exportAllUserData();
        if (result.success) {
          alert("Your data has been exported successfully!");
        } else {
          alert(`Export failed: ${result.message}`);
        }
      } catch (error) {
        console.error("Export error:", error);
        alert("Failed to export data. See console for details.");
      }
    });
  }
  
  // Importing data functionality
  const importButton = document.getElementById('importButton');
  if (importButton) {
    importButton.addEventListener('click', () => {
      try {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        fileInput.style.display = 'none';
        
        fileInput.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (!file) return;
          
          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              const result = importUserData(event.target.result);
              
              if (result.success) {
                alert(`Import successful!\n\nImported: ${result.stats.personalities} personalities, ${result.stats.personas} personas, and chat data.`);
                
                setTimeout(() => {
                  window.location.reload();
                }, 500);
              } else {
                alert(`Import failed: ${result.message}`);
              }
            } catch (error) {
              console.error("Import error:", error);
              alert("Failed to import data. See console for details.");
            }
          };
          
          reader.readAsText(file);
        });
        
        document.body.appendChild(fileInput);
        fileInput.click();
        
        setTimeout(() => {
          document.body.removeChild(fileInput);
        }, 100);
      } catch (error) {
        console.error("Import setup error:", error);
        alert("Failed to setup import. See console for details.");
      }
    });
  }
}

export function setupSettingsButtons() {

  const settingsButton = document.getElementById('settingsButton');
  const settingsButtonHome = document.getElementById('settingsButtonHome');
  
  if (settingsButton) {
    settingsButton.addEventListener('click', showSettings);
  }
  
  if (settingsButtonHome) {
    settingsButtonHome.addEventListener('click', showSettings);
  }
}

export function getBotMemory() {
  const savedMemory = localStorage.getItem('botMemory');
  return parseInt(savedMemory || '10');
}

export function getBotTemperature() {
  const savedTemperature = localStorage.getItem('botTemperature');
  return parseFloat(savedTemperature || '1.0');
}

export function getBotMaxTokens() {
  const savedMaxTokens = localStorage.getItem('botMaxTokens');
  return parseInt(savedMaxTokens || '2048');
}