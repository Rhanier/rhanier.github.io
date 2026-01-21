document.addEventListener('DOMContentLoaded', function() {
    // Array com nomes dos dias em português
    const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
    
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
});
