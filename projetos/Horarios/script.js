// Armazenar atividades em localStorage
let activities = JSON.parse(localStorage.getItem('activities')) || [
    { name: 'Almoço', icon: '🍽️', startTime: '11:30', endTime: '13:00', color: '#FFB347', id: 1 },
    { name: 'Escova de Dente', icon: '🪥', startTime: '13:00', endTime: '14:00', color: '#87CEEB', id: 2 }
];

// Elementos do DOM
const modal = document.getElementById('activityModal');
const addActivityBtn = document.getElementById('addActivityBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const activityForm = document.getElementById('activityForm');
const iconOptions = document.querySelectorAll('.icon-option');
const activityIconInput = document.getElementById('activityIcon');
const clock = document.querySelector('.clock');
const activitiesContainer = document.querySelector('.activities');

// Abrir modal
addActivityBtn.addEventListener('click', () => {
    modal.classList.add('show');
});

// Fechar modal
closeModalBtn.addEventListener('click', closeModal);

// Fechar modal ao clicar fora
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// Seleção de ícone
iconOptions.forEach(option => {
    option.addEventListener('click', (e) => {
        e.preventDefault();
        iconOptions.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        activityIconInput.value = option.dataset.icon;
    });
});

// Submeter formulário
activityForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('activityName').value;
    const icon = activityIconInput.value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    const color = document.getElementById('activityColor').value;
    
    const newActivity = {
        name,
        icon,
        startTime,
        endTime,
        color,
        id: Date.now()
    };
    
    activities.push(newActivity);
    localStorage.setItem('activities', JSON.stringify(activities));
    
    renderActivities();
    renderClockSlices();
    closeModal();
    activityForm.reset();
    document.querySelector('.icon-option').classList.add('selected');
    activityIconInput.value = '🎮';
});

function closeModal() {
    modal.classList.remove('show');
}

function convertTimeToAngle(time) {
    const [hours, minutes] = time.split(':').map(Number);
    // Usar apenas 12 horas (módulo 12) e converter minutos
    const totalMinutes = (hours % 12) * 60 + minutes;
    // Cada minuto = 0.5 graus (360 / 720 minutos)
    return (totalMinutes / (12 * 60)) * 360;
}

function renderClockSlices() {
    // Remover fatias antigas
    const oldSlices = clock.querySelectorAll('.activity-slice, .activity-icon-text');
    oldSlices.forEach(slice => slice.remove());
    
    activities.forEach((activity, index) => {
        const startAngle = convertTimeToAngle(activity.startTime);
        let endAngle = convertTimeToAngle(activity.endTime);
        
        // Se endTime é menor que startTime (ex: 23:00 a 01:00), adicionar 360
        if (endAngle <= startAngle) {
            endAngle += 360;
        }
        
        const duration = endAngle - startAngle;
        
        // Criar fatia
        const x1 = 200 + 180 * Math.cos((startAngle - 90) * Math.PI / 180);
        const y1 = 200 + 180 * Math.sin((startAngle - 90) * Math.PI / 180);
        
        const x2 = 200 + 180 * Math.cos((endAngle - 90) * Math.PI / 180);
        const y2 = 200 + 180 * Math.sin((endAngle - 90) * Math.PI / 180);
        
        const largeArc = duration > 180 ? 1 : 0;
        
        const pathData = `M 200,200 L ${x1},${y1} A 180,180 0 ${largeArc},1 ${x2},${y2} Z`;
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathData);
        path.setAttribute('fill', activity.color);
        path.setAttribute('opacity', '0.7');
        path.setAttribute('class', 'activity-slice');
        clock.insertBefore(path, clock.querySelector('.numbers'));
        
        // Adicionar ícone
        const iconAngle = (startAngle + endAngle) / 2;
        const iconX = 200 + 120 * Math.cos((iconAngle - 90) * Math.PI / 180);
        const iconY = 200 + 120 * Math.sin((iconAngle - 90) * Math.PI / 180);
        
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', iconX);
        text.setAttribute('y', iconY);
        text.setAttribute('font-size', '45');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('class', 'activity-icon-text');
        text.textContent = activity.icon;
        clock.insertBefore(text, clock.querySelector('.numbers'));
    });
}

function renderActivities() {
    activitiesContainer.innerHTML = '';
    
    activities.forEach((activity, index) => {
        const activityDiv = document.createElement('div');
        activityDiv.className = 'activity';
        activityDiv.style.background = `linear-gradient(135deg, ${activity.color} 0%, ${adjustColor(activity.color, -30)} 100%)`;
        
        activityDiv.innerHTML = `
            <div class="activity-icon">${activity.icon}</div>
            <div class="activity-details">
                <h3>${activity.name}</h3>
                <p>${activity.startTime} - ${activity.endTime}</p>
            </div>
            <button class="delete-btn" data-id="${activity.id}">✕</button>
        `;
        
        activitiesContainer.appendChild(activityDiv);
        
        activityDiv.querySelector('.delete-btn').addEventListener('click', () => {
            activities = activities.filter(a => a.id !== activity.id);
            localStorage.setItem('activities', JSON.stringify(activities));
            renderActivities();
            renderClockSlices();
        });
    });
}

function adjustColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255))
        .toString(16).slice(1);
}

function updateClock() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    
    // Calcular rotação dos ponteiros em graus
    // segundos: 360/60 = 6 graus por segundo
    const secondDegrees = (seconds / 60) * 360;
    
    // minutos: 360/60 = 6 graus por minuto + 0.1 grau por segundo
    const minuteDegrees = (minutes / 60) * 360 + (seconds / 60) * 6;
    
    // horas: 360/12 = 30 graus por hora + 0.5 grau por minuto
    const hourDegrees = ((hours % 12) / 12) * 360 + (minutes / 60) * 30;
    
    // Aplicar rotação com origem no eixo correto
    document.querySelector('.hand.hour').style.transform = `rotate(${hourDegrees}deg)`;
    document.querySelector('.hand.minute').style.transform = `rotate(${minuteDegrees}deg)`;
    document.querySelector('.hand.second').style.transform = `rotate(${secondDegrees}deg)`;
    
    // Atualizar hora digital
    const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    document.getElementById('currentTime').textContent = timeString;
}

// Inicializar
renderActivities();
renderClockSlices();
updateClock();

// Atualizar relógio a cada segundo
setInterval(updateClock, 1000);

// Adicionar interatividade aos elementos de atividade
activitiesContainer.addEventListener('click', function(e) {
    if (e.target.classList.contains('activity-icon') || e.target.classList.contains('activity-details')) {
        const activity = e.currentTarget.closest('.activity');
        activity.style.transform = 'scale(1.05) rotateZ(2deg)';
        setTimeout(() => {
            activity.style.transform = '';
        }, 200);
    }
});
