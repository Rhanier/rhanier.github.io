// Emojis padrão para cada dia
const defaultEmojis = ['🎸', '👩‍👧‍👦', '🧹', '🐰', '🧚', '🐹', '🐻'];
const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

// Carregar emojis salvos do localStorage
function loadEmojis() {
    const saved = localStorage.getItem('dayEmojis');
    return saved ? JSON.parse(saved) : [...defaultEmojis];
}

// Salvar emojis no localStorage
function saveEmojis(emojis) {
    localStorage.setItem('dayEmojis', JSON.stringify(emojis));
}

// Aplicar emojis aos cards
function applyEmojis(emojis) {
    const dayCards = document.querySelectorAll('.day-card');
    dayCards.forEach((card, index) => {
        card.querySelector('.creature').textContent = emojis[index];
    });
}

document.addEventListener('DOMContentLoaded', function() {
    // Carregar emojis salvos
    const emojis = loadEmojis();
    applyEmojis(emojis);
    
    // Pegar o dia atual (0 = Domingo, 1 = Segunda, ..., 6 = Sexta)
    const today = new Date();
    let dayOfWeek = today.getDay();
    
    // Ajustar para começar de Segunda (0 = Segunda, 6 = Domingo)
    dayOfWeek = (dayOfWeek + 6) % 7;
    
    // Destacar o dia de hoje
    const dayCards = document.querySelectorAll('.day-card');
    dayCards[dayOfWeek].classList.add('today');
    dayCards[dayOfWeek].querySelector('.creature').style.display = 'block';
    
    // Atualizar texto com dia atual
    document.getElementById('today-day').textContent = diasSemana[dayOfWeek];
    
    // Remover interatividade - não permitir clique em outros dias
    dayCards.forEach((card) => {
        card.style.cursor = 'default';
    });
    
    // Modal de configurações
    const modal = document.getElementById('emoji-modal');
    const settingsBtn = document.getElementById('settings-btn');
    const closeBtn = document.querySelector('.close');
    const daySelect = document.getElementById('day-select');
    const emojiInput = document.getElementById('emoji-input');
    const changeBtn = document.getElementById('change-emoji-btn');
    const resetBtn = document.getElementById('reset-btn');
    
    // Abrir modal
    settingsBtn.addEventListener('click', function() {
        modal.style.display = 'block';
    });
    
    // Fechar modal
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    // Fechar modal clicando fora
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Funcionalidade do seletor de emoji
    
    changeBtn.addEventListener('click', function() {
        const selectedDay = daySelect.value;
        const newEmoji = emojiInput.value.trim();
        
        if (selectedDay === '' || newEmoji === '') {
            alert('Por favor, selecione um dia e digite um emoji');
            return;
        }
        
        const dayIndex = parseInt(selectedDay);
        emojis[dayIndex] = newEmoji;
        saveEmojis(emojis);
        applyEmojis(emojis);
        
        // Limpar inputs
        daySelect.value = '';
        emojiInput.value = '';
        
        alert(`Emoji de ${diasSemana[dayIndex]} alterado para ${newEmoji}`);
        modal.style.display = 'none';
    });
    
    resetBtn.addEventListener('click', function() {
        if (confirm('Restaurar todos os emojis para o padrão?')) {
            const defaultEmojis = ['🎸', '👩‍👧‍👦', '🧹', '🐰', '🧚', '🐹', '🐻'];
            saveEmojis(defaultEmojis);
            applyEmojis(defaultEmojis);
            daySelect.value = '';
            emojiInput.value = '';
            alert('Emojis restaurados ao padrão!');
            modal.style.display = 'none';
        }
    });
});
