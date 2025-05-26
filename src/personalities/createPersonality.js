import { addPersonality, deletePersonality as removePersonality, getPersonalities } from './core/personalityManager.js';

let isEditing = false;
let editingName = '';

document.addEventListener('DOMContentLoaded', () => {
    const formToggle = document.getElementById('formToggle');
    if (formToggle) {
        formToggle.addEventListener('click', () => {
            const personalityForm = document.getElementById('personalityForm');
            const isHidden = personalityForm.classList.toggle('hidden');
            formToggle.textContent = isHidden ? 'Add Personality' : 'Close Form';
            
            if (isHidden) {
                const submitButton = document.getElementById('formSubmitButton');
                submitButton.textContent = 'Add Bot';
                personalityForm.reset();
                isEditing = false;
                editingName = '';
            }
        });
    }
});

export function initializePersonalityForm() {
    const formToggle = document.getElementById('formToggle');
    const personalityForm = document.getElementById('personalityForm');
    
    if (formToggle && personalityForm) {
        formToggle.addEventListener('click', () => {
            const isHidden = personalityForm.classList.toggle('hidden');
            formToggle.textContent = isHidden ? 'Add Personality' : 'Close Form';
            
            if (isHidden) {
                const submitButton = document.getElementById('formSubmitButton');
                submitButton.textContent = 'Add Bot';
                personalityForm.reset();
                isEditing = false;
                editingName = '';
            }
        });

        personalityForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('personalityName').value.trim();
            const systemPrompt = document.getElementById('systemPrompt').value.trim();
            const introMessage = document.getElementById('introMessage').value.trim();
            
            if (!name || !systemPrompt) {
                alert('Please fill out all required fields');
                return;
            }

            if (isEditing) {
                removePersonality(editingName);
                
                const modelSelect = document.getElementById('modelSelect');
                const option = Array.from(modelSelect.options).find(opt => opt.value === editingName);
                if (option) {
                    modelSelect.remove(option.index);
                }
            }

            addPersonality(name, systemPrompt, introMessage);
            updatePersonalityDropdown(name);
            
            personalityForm.reset();
            personalityForm.classList.add('hidden');
            formToggle.textContent = 'Add Personality';
            isEditing = false;
            editingName = '';
        });
    }

    if (document.getElementById('customPersonalities')) {
        updateCustomPersonalitiesList();
    }
}

function editPersonality(name) {
    const personalities = loadPersonalities();
    if (!personalities || !personalities[name]) {
        console.error('Personality not found:', name);
        return;
    }

    const personality = personalities[name];
    const personalityForm = document.getElementById('personalityForm');
    const formToggle = document.getElementById('formToggle');
    const submitButton = document.getElementById('formSubmitButton');
    
    document.getElementById('personalityName').value = name;
    document.getElementById('systemPrompt').value = personality.system;
    document.getElementById('introMessage').value = personality.intro;
    
    personalityForm.classList.remove('hidden');
    formToggle.textContent = 'Close Form';
    submitButton.textContent = 'Save Bot';
    
    isEditing = true;
    editingName = name;
}

function updatePersonalityDropdown(personalityName) {
    const modelSelect = document.getElementById('modelSelect');
    const option = document.createElement('option');
    option.value = personalityName;
    option.textContent = personalityName;
    modelSelect.appendChild(option);

    updateCustomPersonalitiesList();
}

function updateCustomPersonalitiesList() {
    const customPersonalities = document.getElementById('customPersonalities');
    customPersonalities.innerHTML = '<h3>Custom Personalities</h3>';

    const personalities = getPersonalities();
    
    Object.keys(personalities).filter(name => name !== 'Default').forEach(name => {
        const item = document.createElement('div');
        item.className = 'personality-item';
        
        const nameSpan = document.createElement('span');
        nameSpan.textContent = name;
        
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';
        
        const editButton = document.createElement('button');
        editButton.className = 'edit-personality';
        editButton.textContent = 'Edit';
        editButton.onclick = () => editPersonality(name);
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-personality';
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => deletePersonality(name);
        
        buttonContainer.appendChild(editButton);
        buttonContainer.appendChild(deleteButton);
        item.appendChild(nameSpan);
        item.appendChild(buttonContainer);
        customPersonalities.appendChild(item);
    });
}

function deletePersonality(name) {
    if (confirm(`Are you sure you want to delete the personality "${name}"?`)) {
        removePersonality(name);
        
        const modelSelect = document.getElementById('modelSelect');
        const option = Array.from(modelSelect.options).find(opt => opt.value === name);
        if (option) {
            modelSelect.remove(option.index);
        }
        
        if (modelSelect.value === name) {
            modelSelect.value = 'Default';
            const event = new Event('change');
            modelSelect.dispatchEvent(event);
        }
        
        updateCustomPersonalitiesList();
    }
}