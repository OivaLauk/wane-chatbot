// Handler for switching from homepage to chat view and back.
export function switchView(showHome = true) {
  console.log(`Switching to ${showHome ? 'home' : 'chat'} view`);
  
  const homeContainer = document.getElementById('homeContainer');
  const mainWrapper = document.getElementById('mainWrapper');
  const modelSelect = document.getElementById('modelSelect');
  const modelLabel = document.querySelector('.model-label');
  const userButton = document.getElementById('userButton');
  const settingsButton = document.getElementById('settingsButton');
  
  if (!homeContainer || !mainWrapper) {
    console.error("Required containers not found in DOM");
    return;
  }
  
  if (showHome) {
    homeContainer.style.display = 'block';
    mainWrapper.style.display = 'none';
    
    // Show buttons on home screen
    if (userButton) userButton.style.display = 'flex';
    if (settingsButton) settingsButton.style.display = 'flex';
    
    if (modelSelect) modelSelect.style.display = 'inline-block';
    if (modelLabel) modelLabel.style.display = 'inline-block';
  } else {
    homeContainer.style.display = 'none';
    mainWrapper.style.display = 'block';
    mainWrapper.classList.remove('hidden');
    
    // Hide buttons during chat
    if (userButton) userButton.style.display = 'none';
    if (settingsButton) settingsButton.style.display = 'none';
    
    const currentPersonality = localStorage.getItem('currentPersonality');
    
    if (modelSelect && currentPersonality) {
      modelSelect.style.display = 'none';
      modelSelect.value = currentPersonality;
    }
    
    const title = document.querySelector('.title');
    if (title && currentPersonality) {
      title.textContent = `Chatting with ${currentPersonality}`;
    }
    
    if (modelLabel) modelLabel.style.display = 'none';
  }
}

export function toggleSidePanel() {
  const mainWrapper = document.getElementById('mainWrapper');
  if (mainWrapper) {
    mainWrapper.classList.toggle('no-side-panel');
  }
}