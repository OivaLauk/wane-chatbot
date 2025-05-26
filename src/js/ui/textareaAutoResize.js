export function initAutoResize() {
  document.addEventListener('input', function(event) {
    if (event.target.classList.contains('edit-input') || event.target.classList.contains('chatbox')) {
      autoResize(event.target);
    }
  });
  
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes && mutation.addedNodes.length > 0) {
        for (let i = 0; i < mutation.addedNodes.length; i++) {
          const node = mutation.addedNodes[i];
          if (node.classList && (node.classList.contains('edit-input') || node.classList.contains('chatbox'))) {
            autoResize(node);
          }
        }
      }
    });
  });
  
  observer.observe(document.body, { 
    childList: true, 
    subtree: true 
  });
}

function autoResize(element) {
  element.style.height = 'auto';
  element.style.height = Math.max(element.scrollHeight, 100) + 'px';
}