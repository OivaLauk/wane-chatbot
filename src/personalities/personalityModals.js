import { addPersonality, deletePersonality as removePersonality, getPersonalities } from './core/personalityManager.js';
import { renderPersonalityCards } from './personalityManager.js';
import { defaultPersonalities } from './defaultPersonalities.js';

export function editPersonalityFromHome(personalityName) {
  const personalities = getPersonalities();
  if (!personalities || !personalities[personalityName]) {
    console.error(`Personality "${personalityName}" not found`);
    return;
  }
  
  let modal = document.getElementById('editPersonalityModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'editPersonalityModal';
    modal.className = 'personality-form';
    
    modal.innerHTML = `
      <h2>Edit Bot</h2>
      <div class="form-avatar-container">
        <div class="form-avatar-preview">
          <img id="modalAvatarPreview" src="./assets/default-pfp.svg" alt="${personalityName}" class="avatar-preview-image">
        </div>
        <div class="form-avatar-controls">
          <label for="modalAvatarInput" class="avatar-upload-btn">Choose Image</label>
          <input type="file" id="modalAvatarInput" accept="image/*" style="display:none">
          <button type="button" id="modalResetAvatar" class="avatar-reset-btn">Reset to Default</button>
        </div>
      </div>
      <input 
        type="text" 
        id="modalPersonalityName" 
        placeholder="Chatbot Name" 
        required
      />
      <textarea
        id="modalSystemPrompt" 
        placeholder="Personality description"
        class="scrollable-textarea" 
        required
      ></textarea>
      <textarea 
        type="text" 
        id="modalIntroMessage" 
        placeholder="Introduction Message"
        class="scrollable-textarea" 
        required
      ></textarea>
      <div class="modal-buttons">
        <button type="button" id="modalCancelButton" class="cancel-button">Cancel</button>
        <button type="button" id="modalSaveButton" class="save-button">Save Changes</button>
      </div>
    `;
    document.body.appendChild(modal);
  } else {
    modal.classList.remove('hidden');
  }
  
  // Fill the form with personality data
  let personalityData;
  if (defaultPersonalities[personalityName]) {
    personalityData = defaultPersonalities[personalityName];
  } else {
    personalityData = personalities[personalityName];
  }
  
  document.getElementById('modalPersonalityName').value = personalityName;
  document.getElementById('modalSystemPrompt').value = personalityData.system || '';
  document.getElementById('modalIntroMessage').value = personalityData.intro || '';
  
  const avatarPreview = document.getElementById('modalAvatarPreview');
  if (personalityData.avatar) {
    avatarPreview.src = personalityData.avatar;
  } else {
    avatarPreview.src = './assets/default-pfp.svg';
  }
  
  const avatarInput = document.getElementById('modalAvatarInput');
  avatarInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        avatarPreview.src = event.target.result;
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  });
  
  const resetButton = document.getElementById('modalResetAvatar');
  resetButton.addEventListener('click', () => {
    avatarPreview.src = './assets/default-pfp.svg';
  });
  
  const saveButton = document.getElementById('modalSaveButton');
  const cancelButton = document.getElementById('modalCancelButton');
  
  const newSaveButton = saveButton.cloneNode(true);
  const newCancelButton = cancelButton.cloneNode(true);
  
  saveButton.parentNode.replaceChild(newSaveButton, saveButton);
  cancelButton.parentNode.replaceChild(newCancelButton, cancelButton);
  
  newSaveButton.addEventListener('click', () => {
    const newName = document.getElementById('modalPersonalityName').value.trim();
    const systemPrompt = document.getElementById('modalSystemPrompt').value.trim();
    const introMessage = document.getElementById('modalIntroMessage').value.trim();
    const avatarSrc = document.getElementById('modalAvatarPreview').src;
    
    if (!newName || !systemPrompt || !introMessage) {
      alert('Please fill out all fields');
      return;
    }
    
    removePersonality(personalityName);
    addPersonality({
      name: newName,
      system: systemPrompt,
      intro: introMessage,
      avatar: avatarSrc
    });
    
    modal.classList.add('hidden');
    renderPersonalityCards();
  });
  
  newCancelButton.addEventListener('click', () => {
    modal.classList.add('hidden');
  });
}

export function showAddPersonalityModal() {
  let addModal = document.getElementById('addPersonalityModal');
  if (!addModal) {
    addModal = document.createElement('div');
    addModal.id = 'addPersonalityModal';
    addModal.className = 'personality-form';
    
    addModal.innerHTML = `
      <h2>Create New Bot</h2>
      <div class="form-avatar-container">
        <div class="form-avatar-preview">
          <img id="addModalAvatarPreview" src="./assets/default-pfp.svg" alt="New Bot" class="avatar-preview-image">
        </div>
        <div class="form-avatar-controls">
          <label for="addModalAvatarInput" class="avatar-upload-btn">Choose Image</label>
          <input type="file" id="addModalAvatarInput" accept="image/*" style="display:none">
          <button type="button" id="addModalResetAvatar" class="avatar-reset-btn">Reset to Default</button>
        </div>
      </div>
      <input 
        type="text" 
        id="addModalPersonalityName" 
        placeholder="Chatbot Name" 
        required
      />
      <textarea
        id="addModalSystemPrompt" 
        placeholder="Personality description"
        class="scrollable-textarea"
        required
      ></textarea>
      <textarea
        type="text" 
        id="addModalIntroMessage" 
        placeholder="Introduction Message"
        class="scrollable-textarea" 
        required
      ></textarea>
      <div class="modal-buttons">
        <button type="button" id="addModalCancelButton" class="cancel-button">Cancel</button>
        <button type="button" id="addModalSaveButton" class="save-button">Add Bot</button>
      </div>
    `;
    document.body.appendChild(addModal);
  } else {
    addModal.classList.remove('hidden');
  }
  
  document.getElementById('addModalPersonalityName').value = '';
  document.getElementById('addModalSystemPrompt').value = '';
  document.getElementById('addModalIntroMessage').value = '';
  
  const avatarInput = document.getElementById('addModalAvatarInput');
  const avatarPreview = document.getElementById('addModalAvatarPreview');
  
  const saveButton = document.getElementById('addModalSaveButton');
  const cancelButton = document.getElementById('addModalCancelButton');
  const resetButton = document.getElementById('addModalResetAvatar');
  
  const newSaveButton = saveButton.cloneNode(true);
  const newCancelButton = cancelButton.cloneNode(true);
  const newResetButton = resetButton.cloneNode(true);
  
  saveButton.parentNode.replaceChild(newSaveButton, saveButton);
  cancelButton.parentNode.replaceChild(newCancelButton, cancelButton);
  resetButton.parentNode.replaceChild(newResetButton, resetButton);
  
  avatarInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        avatarPreview.src = event.target.result;
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  });
  
  newResetButton.addEventListener('click', () => {
    avatarPreview.src = './assets/default-pfp.svg';
  });
  
  newSaveButton.addEventListener('click', () => {
    const name = document.getElementById('addModalPersonalityName').value.trim();
    const systemPrompt = document.getElementById('addModalSystemPrompt').value.trim();
    const introMessage = document.getElementById('addModalIntroMessage').value.trim();
    const avatarSrc = document.getElementById('addModalAvatarPreview').src;
    
    if (!name || !systemPrompt || !introMessage) {
      alert('Please fill out all fields');
      return;
    }
    
    addPersonality({
      name: name,
      system: systemPrompt,
      intro: introMessage,
      avatar: avatarSrc
    });
    addModal.classList.add('hidden');
    renderPersonalityCards();
  });
  
  newCancelButton.addEventListener('click', () => {
    addModal.classList.add('hidden');
  });
}

document.addEventListener('editPersonality', (e) => {
  const { name } = e.detail;
  editPersonalityFromHome(name);
});