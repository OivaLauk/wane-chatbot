// Exporting userdata into a JSON file
export function exportAllUserData() {
  const userData = {
    personalities: JSON.parse(localStorage.getItem('personalities') || '{}'),
    chatHistories: JSON.parse(localStorage.getItem('chatHistories') || '{}'),
    userPersonas: JSON.parse(localStorage.getItem('userPersonas') || '{}'),
    settings: {
      theme: localStorage.getItem('theme') || 'light',
      botMemory: localStorage.getItem('botMemory') || '10',
      botTemperature: localStorage.getItem('botTemperature') || '0.7',
      botMaxTokens: localStorage.getItem('botMaxTokens') || '4000'
    },
    currentPersonality: localStorage.getItem('currentPersonality') || 'Default',
    currentChatIds: JSON.parse(localStorage.getItem('currentChatIds') || '{}'),
    exportDate: new Date().toISOString(),
    version: '2.0'
  };

  const jsonData = JSON.stringify(userData, null, 2);
  
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const date = new Date();
  const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  const filename = `wane_backup_${formattedDate}.json`;
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);

  return { success: true, message: "Data exported successfully" };
}

export function initExportButton() {
  const exportButton = document.getElementById('exportButton');
  if (exportButton) {
    exportButton.addEventListener('click', () => {
      const result = exportAllUserData();
      if (result.success) {
        alert("Your data has been exported successfully!");
      } else {
        alert(`Export failed: ${result.message}`);
      }
    });
  }
}