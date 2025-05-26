import { saveUserPersonas, loadUserPersonas } from '../utils/userPersonas.js';

let profileModal = null;

export function showProfile() {
  profileModal = document.getElementById('userProfileModal');
  if (!profileModal) {
    profileModal = document.createElement('div');
    profileModal.id = 'userProfileModal';
    profileModal.className = 'profile-form';
    
    profileModal.innerHTML = `
      <h2>User Profile</h2>
      <div class="profile-form-content">
        <div class="personas-section">
          <h3>User Personas</h3>
          <p class="section-description">Create different personas to use in your conversations.</p>
          
          <div class="personas-list" id="personasList">
          </div>
          
          <div class="add-persona-section">
            <h4>Create New Persona</h4>
            <div class="persona-avatar-container">
              <div class="persona-avatar-preview">
                <img id="personaAvatarPreview" src="./assets/user-circle.svg" alt="Persona" class="avatar-preview-image">
              </div>
              <div class="persona-avatar-controls">
                <label for="personaAvatarInput" class="avatar-upload-btn">Choose Image</label>
                <input type="file" id="personaAvatarInput" accept="image/*" style="display:none">
                <button type="button" id="personaResetAvatar" class="avatar-reset-btn">Reset to Default</button>
              </div>
            </div>
            <input 
              type="text" 
              id="personaName" 
              placeholder="Persona Name"
              class="persona-input" 
            />
            <textarea
              id="personaDescription"
              placeholder="Describe this persona (e.g., background and interests)"
              class="persona-textarea"
            ></textarea>
            <button type="button" id="addPersonaButton" class="add-persona-button">Add Persona</button>
          </div>
        </div>
      </div>
      
      <div class="modal-buttons">
        <button type="button" id="profileCancelButton" class="cancel-button">Cancel</button>
        <button type="button" id="profileSaveButton" class="save-button">Save Changes</button>
      </div>
    `;
    document.body.appendChild(profileModal);
    
    setupProfileModalListeners();
  } else {
    profileModal.classList.remove('hidden');
  }
  
  refreshPersonasList();
}


function setupProfileModalListeners() {
  const avatarInput = document.getElementById('profileAvatarInput');
  const avatarPreview = document.getElementById('profileAvatarPreview');
  
  if (avatarInput) {
    avatarInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (event) => {
          avatarPreview.src = event.target.result;
        };
        reader.readAsDataURL(e.target.files[0]);
      }
    });
  }
  
  const resetButton = document.getElementById('profileResetAvatar');
  if (resetButton) {
    resetButton.addEventListener('click', () => {
      avatarPreview.src = './assets/user-circle.svg';
    });
  }
  
  const personaAvatarInput = document.getElementById('personaAvatarInput');
  const personaAvatarPreview = document.getElementById('personaAvatarPreview');
  
  if (personaAvatarInput) {
    personaAvatarInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (event) => {
          personaAvatarPreview.src = event.target.result;
        };
        reader.readAsDataURL(e.target.files[0]);
      }
    });
  }

  const personaResetButton = document.getElementById('personaResetAvatar');
  if (personaResetButton) {
    personaResetButton.addEventListener('click', () => {
      personaAvatarPreview.src = './assets/user-circle.svg';
    });
  }
  
  const addPersonaButton = document.getElementById('addPersonaButton');
  if (addPersonaButton) {
    addPersonaButton.addEventListener('click', addNewPersona);
  }
  
  const saveButton = document.getElementById('profileSaveButton');
  const cancelButton = document.getElementById('profileCancelButton');
  
  if (saveButton) {
    saveButton.addEventListener('click', () => {
      const personas = loadUserPersonas();
      
      const avatarPreview = document.getElementById('profileAvatarPreview');
      if (avatarPreview && avatarPreview.src) {
        localStorage.setItem('userAvatar', avatarPreview.src);
      }
      
      document.querySelectorAll('.persona-item').forEach(item => {
        const nameElement = item.querySelector('.persona-name');
        if (!nameElement) return;
        
        const personaName = nameElement.textContent;
        const personaDesc = item.querySelector('.persona-description')?.textContent || '';
        
        if (personas[personaName]) {
          personas[personaName].description = personaDesc;
        }
      });
      
      saveUserPersonas(personas);
      
      profileModal.classList.add('hidden');
    });
  }
  
  if (cancelButton) {
    cancelButton.addEventListener('click', () => {
      profileModal.classList.add('hidden');
    });
  }
}

function formatDescription(personaDescription) {
  if(personaDescription.length > 30) {
      return personaDescription = personaDescription.substring(0, 30) + '...';
  } else {
    return personaDescription;
  }
}


function refreshPersonasList() {
  const personasList = document.getElementById('personasList');
  if (!personasList) return;
  
  personasList.innerHTML = '';
  
  const personas = loadUserPersonas();
  
  if (Object.keys(personas).length === 0) {
    personasList.innerHTML = '<p class="no-personas">No personas created yet</p>';
    return;
  }
  
  Object.keys(personas).forEach(name => {
    const personaItem = document.createElement('div');
    personaItem.className = 'persona-item';
    
    const avatarSrc = personas[name].avatar || './assets/user-circle.svg';
    
    personaItem.innerHTML = `
      <div class="persona-info-container">
        <div class="persona-avatar">
          <img src="${avatarSrc}" alt="${name}" class="avatar-preview-image">
        </div>
        <div class="persona-details">
          <h4 class="persona-name">${name}</h4>
          <p class="persona-description">${formatDescription(personas[name].description)}</p>
        </div>
      </div>
      <div class="persona-actions">
        <button class="edit-persona-btn" data-name="${name}">Edit</button>
        <button class="delete-persona-btn" data-name="${name}">Delete</button>
      </div>
    `;
    
    personasList.appendChild(personaItem);
  });
  
  document.querySelectorAll('.edit-persona-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const personaName = e.target.dataset.name;
      editUserPersona(personaName);
    });
  });
  
  document.querySelectorAll('.delete-persona-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const personaName = e.target.dataset.name;
      deleteUserPersona(personaName);
    });
  });
}


function addNewPersona() {
  const nameInput = document.getElementById('personaName');
  const descriptionInput = document.getElementById('personaDescription');
  const avatarPreview = document.getElementById('personaAvatarPreview');
  const addPersonaButton = document.getElementById('addPersonaButton');
  const cancelEditButton = document.getElementById('cancelEditButton');
  
  const name = nameInput.value.trim();
  const description = descriptionInput.value.trim();
  const avatar = avatarPreview.src;
  
  if (!name) {
    alert('Please enter a name for your persona');
    return;
  }
  
  const personas = loadUserPersonas();
  
  const isEditing = addPersonaButton && addPersonaButton.dataset.editingPersonaName;
  
  if (isEditing) {
    const originalName = addPersonaButton.dataset.editingPersonaName;
    
    if (originalName !== name) {
      delete personas[originalName];
    }
    
    if (originalName !== name && personas[name]) {
      if (!confirm(`A persona named "${name}" already exists. Do you want to overwrite it?`)) {
        return;
      }
    }
  } else {
    if (personas[name]) {
      if (!confirm(`A persona named "${name}" already exists. Do you want to overwrite it?`)) {
        return;
      }
    }
  }
  
  personas[name] = {
    description: description || '',
    avatar: avatar,
  };
  
  saveUserPersonas(personas);
  
  nameInput.value = '';
  descriptionInput.value = '';
  avatarPreview.src = './assets/user-circle.svg';
  
  if (addPersonaButton) {
    addPersonaButton.textContent = 'Add Persona';
    delete addPersonaButton.dataset.editingPersonaName;
    delete addPersonaButton.dataset.editingPersonaData;
  }
  
  if (cancelEditButton) {
    cancelEditButton.style.display = 'none';
  }
  
  refreshPersonasList();
}

function editUserPersona(personaName) {
  const personas = loadUserPersonas();
  
  if (!personas[personaName]) {
    console.error('Persona not found:', personaName);
    return;
  }
  
  const addPersonaButton = document.getElementById('addPersonaButton');

  if (addPersonaButton) {
    addPersonaButton.dataset.editingPersonaName = personaName;
    addPersonaButton.dataset.editingPersonaData = JSON.stringify(personas[personaName]);
    
    addPersonaButton.textContent = 'Save Changes';
  }
  
  document.getElementById('personaName').value = personaName;
  document.getElementById('personaDescription').value = personas[personaName].description;
  
  const personaAvatarPreview = document.getElementById('personaAvatarPreview');
  if (personas[personaName].avatar) {
    personaAvatarPreview.src = personas[personaName].avatar;
  } else {
    personaAvatarPreview.src = './assets/user-circle.svg';
  }
  
  document.getElementById('personaName').focus();
  
  let cancelEditButton = document.getElementById('cancelEditButton');
  if (!cancelEditButton) {
    cancelEditButton = document.createElement('button');
    cancelEditButton.id = 'cancelEditButton';
    cancelEditButton.type = 'button';
    cancelEditButton.className = 'cancel-edit-button';
    cancelEditButton.textContent = 'Cancel Edit';
    
    addPersonaButton.parentNode.insertBefore(cancelEditButton, addPersonaButton);
    
    cancelEditButton.addEventListener('click', () => {
      cancelPersonaEdit();
    });
  } else {
    cancelEditButton.style.display = 'inline-block';
  }
}

function cancelPersonaEdit() {
  const addPersonaButton = document.getElementById('addPersonaButton');
  const cancelEditButton = document.getElementById('cancelEditButton');
  
  document.getElementById('personaName').value = '';
  document.getElementById('personaDescription').value = '';
  document.getElementById('personaAvatarPreview').src = './assets/user-circle.svg';
  
  if (addPersonaButton) {
    addPersonaButton.textContent = 'Add Persona';
    delete addPersonaButton.dataset.editingPersonaName;
    delete addPersonaButton.dataset.editingPersonaData;
  }
  
  if (cancelEditButton) {
    cancelEditButton.style.display = 'none';
  }
  
  refreshPersonasList();
}

function deleteUserPersona(personaName) {
  if (!confirm(`Are you sure you want to delete the persona "${personaName}"?`)) {
    return;
  }
  
  const personas = loadUserPersonas();
  
  if (!personas[personaName]) {
    console.error('Persona not found:', personaName);
    return;
  }
  
  delete personas[personaName];
  saveUserPersonas(personas);
  
  if (localStorage.getItem('currentUserPersona') === personaName) {
    localStorage.removeItem('currentUserPersona');
    
    document.querySelectorAll('.user-name').forEach(element => {
      element.textContent = 'You';
    });
    document.querySelectorAll('.user-pic img').forEach(img => {
      img.src = './assets/user-circle.svg';
    });
  }
  
  refreshPersonasList();
}


export function setupProfileButtons() {
  const userButton = document.getElementById('userButton');
  const userButtonHome = document.getElementById('userButtonHome');
  
  if (userButton) {
    userButton.addEventListener('click', showProfile);
  }
  
  if (userButtonHome) {
    userButtonHome.addEventListener('click', showProfile);
  }
  
  const savedAvatar = localStorage.getItem('userAvatar');
  if (savedAvatar) {
    document.querySelectorAll('.user-pic img').forEach(img => {
      img.src = savedAvatar;
    });
  }
}