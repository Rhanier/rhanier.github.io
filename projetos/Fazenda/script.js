// ========== ESTADO DA APLICAÇÃO ==========
const AppState = {
    cattle: JSON.parse(localStorage.getItem('cattle')) || [],
    pastures: JSON.parse(localStorage.getItem('pastures')) || [],
    map: null,
    mapMarkers: [],
    mapPastures: [],
    pasturePoints: [],
    pasturePolygons: [],
    pastureMarkers: [],
    currentPhotoData: null
};

// Cores verde gradiente para os pastos (1 = claro, 10 = escuro)
const PASTURE_COLORS = [
    '#90ee90', '#83de83', '#76ce77', '#69be6a', '#5cae5e',
    '#4f9e51', '#428e45', '#357e38', '#286e2c', '#1b5e20'
];

// ========== UTILIDADES ==========
const Utils = {
    getPastureColor: (index) => PASTURE_COLORS[index % PASTURE_COLORS.length],
    
    escapeHtml: (text) => {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    },
    
    showSuccess: (message) => {
        const msg = document.getElementById('successMessage');
        if (msg) {
            msg.textContent = message;
            msg.classList.add('show');
            setTimeout(() => msg.classList.remove('show'), 3000);
        }
    },
    
    showError: (message) => {
        alert('❌ ' + message);
    }
};

// ========== GERENCIAMENTO DE DADOS ==========
const DataManager = {
    saveCattle: () => {
        try {
            localStorage.setItem('cattle', JSON.stringify(AppState.cattle));
            return true;
        } catch (e) {
            Utils.showError('Erro ao salvar dados: ' + e.message);
            return false;
        }
    },
    
    savePastures: () => {
        try {
            localStorage.setItem('pastures', JSON.stringify(AppState.pastures));
            return true;
        } catch (e) {
            Utils.showError('Erro ao salvar pastos: ' + e.message);
            return false;
        }
    },
    
    generateCattleId: () => {
        const count = AppState.cattle.length + 2;
        return `VACA-${String(count).padStart(3, '0')}`;
    }
};

// ========== GERENCIAMENTO DE FOTOS ==========
const PhotoManager = {
    processFile: (file) => {
        if (!file) return;
        
        // Validar tipo de arquivo
        if (!file.type.match('image.*')) {
            Utils.showError('Por favor, selecione apenas imagens');
            return;
        }
        
        // Validar tamanho (máx 5MB)
        if (file.size > 5 * 1024 * 1024) {
            Utils.showError('Imagem muito grande. Máximo: 5MB');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
            const preview = document.getElementById('photoPreview');
            if (preview) {
                preview.innerHTML = `
                    <div style="position: relative;">
                        <img src="${event.target.result}" alt="Preview da foto" style="max-width: 300px; max-height: 300px; border-radius: 8px; border: 2px solid #e0e0e0;">
                        <button type="button" 
                                style="position: absolute; top: 10px; right: 10px; background: #ff6b6b; color: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; font-size: 18px;" 
                                onclick="PhotoManager.clear()"
                                aria-label="Remover foto">✕</button>
                    </div>
                `;
                AppState.currentPhotoData = event.target.result;
                const form = document.getElementById('cattleForm');
                if (form) form.photoData = event.target.result;
            }
        };
        reader.onerror = () => {
            Utils.showError('Erro ao ler arquivo de imagem');
        };
        reader.readAsDataURL(file);
    },
    
    clear: () => {
        const preview = document.getElementById('photoPreview');
        if (preview) preview.innerHTML = '';
        
        const photoInput = document.getElementById('cattlePhoto');
        const captureInput = document.getElementById('cattlePhotoCapture');
        
        if (photoInput) photoInput.value = '';
        if (captureInput) captureInput.value = '';
        
        AppState.currentPhotoData = null;
        const form = document.getElementById('cattleForm');
        if (form) form.photoData = '';
    }
};

// ========== GERENCIAMENTO DE GADO ==========
const CattleManager = {
    register: (formElement) => {
        const idInput = document.getElementById('cattleId');
        const raceInput = document.getElementById('cattleRace');
        const weightInput = document.getElementById('cattleWeight');
        const ageInput = document.getElementById('cattleAge');
        const commentInput = document.getElementById('cattleComment');
        
        if (!idInput || !raceInput) {
            Utils.showError('Formulário incompleto');
            return false;
        }
        
        const id = idInput.value.trim();
        const race = raceInput.value.trim();
        const weightRaw = weightInput ? weightInput.value.trim() : '';
        const weight = weightRaw === '' ? null : parseFloat(weightRaw);
        const age = ageInput ? ageInput.value.trim() : '';
        const comment = commentInput ? commentInput.value.trim() : '';
        
        // Validações
        if (!id || !race ) {
            Utils.showError('Preencha os campos obrigatórios (ID e Raça).');
            return false;
        }
        
        if (weight !== null && weight <= 0) {
            Utils.showError('O peso deve ser maior que zero');
            return false;
        }
        
        // Verificar ID duplicado
        if (AppState.cattle.some(c => c.id === id)) {
            Utils.showError('Já existe um gado com este ID');
            return false;
        }

        const cattleData = {
            id,
            race,
            weight: weight === null ? 'N/A' : weight,
            age: age || 'N/A',
            photo: formElement.photoData || '',
            comment,
            date: new Date().toLocaleDateString('pt-BR'),
            history: [],
            pasture: AppState.pastures.length > 0 ? AppState.pastures[0].name : 'Sem pasto'
        };

        // Adicionar à história
        cattleData.history.push({
            date: cattleData.date,
            weight: cattleData.weight,
            comment: cattleData.comment,
            photo: cattleData.photo
        });

        AppState.cattle.push(cattleData);
        
        if (!DataManager.saveCattle()) {
            AppState.cattle.pop();
            return false;
        }

        formElement.reset();
        PhotoManager.clear();
        formElement.photoData = '';
        
        // Gerar novo ID para próximo cadastro
        idInput.value = DataManager.generateCattleId();
        
        Utils.showSuccess(`✓ Gado "${id}" cadastrado com sucesso!`);
        // setTimeout(() => showSection('visualizacao'), 1500);
        return true;
    },
    
    delete: (index) => {
        if (index < 0 || index >= AppState.cattle.length) return false;
        
        // const cattle = AppState.cattle[index];
        // if (!confirm(`Tem certeza que deseja excluir o gado "${cattle.id}"?`)) {
        //     return false;
        // }
        
        AppState.cattle.splice(index, 1);
        if (DataManager.saveCattle()) {
            displayCattle();
            Utils.showSuccess('✓ Gado excluído com sucesso!');
            return true;
        }
        return false;
    }
};

// ========== GERENCIAMENTO DE PASTOS ==========
const PastureManager = {
    updateList: () => {
        const list = document.getElementById('pasturesList');
        if (!list) return;
        
        if (AppState.pastures.length === 0) {
            list.innerHTML = '<p style="color: #999; text-align: center;">Nenhum pasto cadastrado</p>';
            return;
        }

        list.innerHTML = AppState.pastures.map((pasture, index) => {
            const cattleInPasture = AppState.cattle.filter(c => c.pasture === pasture.name);
            const color = Utils.getPastureColor(index);
            const safeName = Utils.escapeHtml(pasture.name);
            const safeArea = Utils.escapeHtml(pasture.area);
            
            // Garantir que o pasto tenha pontos válidos
            const firstPoint = pasture.points && pasture.points[0] ? pasture.points[0] : { lat: 0, lng: 0 };
            
            return `
                <div class="pasture-list-item" 
                     style="background: white; padding: 12px; margin-bottom: 10px; border-radius: 6px; border-left: 4px solid ${color}; cursor: pointer; transition: all 0.3s;" 
                     onmouseover="this.style.boxShadow='0 2px 8px rgba(0,0,0,0.15)'" 
                     onmouseout="this.style.boxShadow='none'"
                     onclick="focusPastureOnMap('${safeName}', ${firstPoint.lat}, ${firstPoint.lng})"
                     role="button"
                     tabindex="0"
                     aria-label="Ver pasto ${safeName} no mapa">
                    <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
                        <div style="flex: 1;">
                            <strong style="color: #333;">#${index + 1} ${safeName}</strong>
                        </div>
                        <span style="background: ${color}; color: white; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: bold;" aria-label="${cattleInPasture.length} gados">🐄 ${cattleInPasture.length}</span>
                        <button class="btn-secondary" 
                                style="padding: 4px 8px; font-size: 12px; border-radius: 4px; background: #f44336; color: white; border: none; cursor: pointer;"
                                onclick="event.stopPropagation(); deletePasture('${safeName}')"
                                onmouseover="this.style.background='#d32f2f'"
                                onmouseout="this.style.background='#f44336'"
                                aria-label="Excluir pasto ${safeName}">
                            🗑️
                        </button>
                    </div>
                    <small style="color: #999;">Área: ${safeArea} ha</small>
                </div>
            `;
        }).join('');
    },
    
    add: () => {
        const nameInput = document.getElementById('pastureName');
        const areaInput = document.getElementById('pastureArea');
        
        if (!nameInput || !areaInput) return false;
        
        const name = nameInput.value.trim();
        const area = areaInput.value.trim();

        // Validações
        if (!name) {
            Utils.showError('Preencha o nome do pasto');
            return false;
        }
        
        if (AppState.pasturePoints.length < 3) {
            Utils.showError('Adicione no mínimo 3 pontos no mapa para formar o pasto');
            return false;
        }
        
        // Verificar duplicação de nome
        if (AppState.pastures.some(p => p.name === name)) {
            Utils.showError('Já existe um pasto com este nome');
            return false;
        }

        const newPasture = { 
            name, 
            area: area || '0', 
            points: AppState.pasturePoints.slice(),
            date: new Date().toLocaleDateString('pt-BR')
        };
        
        AppState.pastures.push(newPasture);
        
        if (!DataManager.savePastures()) {
            AppState.pastures.pop();
            return false;
        }

        nameInput.value = '';
        areaInput.value = '';
        MapManager.clearPasturePoints();
        MapManager.init();
        
        Utils.showSuccess(`✓ Pasto #${AppState.pastures.length} "${name}" adicionado com sucesso!`);
        return true;
    },
    
    delete: (pastureName) => {
        if (!pastureName) return false;
        
        // Confirmar exclusão
        const confirmMsg = `Tem certeza que deseja excluir o pasto "${pastureName}"?`;
        if (!confirm(confirmMsg)) return false;
        
        // Verificar se há gados no pasto
        const cattleInPasture = AppState.cattle.filter(c => c.pasture === pastureName);
        if (cattleInPasture.length > 0) {
            const warningMsg = `Este pasto possui ${cattleInPasture.length} gado(s). Os gados ficarão sem pasto atribuído. Continuar?`;
            if (!confirm(warningMsg)) return false;
            
            // Remover pasto dos gados
            cattleInPasture.forEach(cattle => {
                cattle.pasture = '';
            });
            DataManager.saveCattle();
        }
        
        // Encontrar índice do pasto
        const pastureIndex = AppState.pastures.findIndex(p => p.name === pastureName);
        if (pastureIndex === -1) {
            Utils.showError('Pasto não encontrado');
            return false;
        }
        
        // Remover pasto do array
        AppState.pastures.splice(pastureIndex, 1);
        
        // Salvar e atualizar interface
        if (DataManager.savePastures()) {
            MapManager.init();
            Utils.showSuccess(`✓ Pasto "${pastureName}" excluído com sucesso!`);
            return true;
        }
        return false;
    },
    
    focusOnMap: (pastureName, lat, lng) => {
        if (AppState.map && lat && lng) {
            AppState.map.setView([lat, lng], 16);
        }
    }
};

// ========== GERENCIAMENTO DE MAPA ==========
const MapManager = {
    init: () => {
        if (AppState.map) {
            AppState.map.remove();
        }
        
        // Calcular centro dos pastos ou usar padrão (Brasil central)
        let mapCenter = [-22.9, -47.5];
        let mapZoom = 13;
        
        if (AppState.pastures.length > 0 && 
            AppState.pastures[0].points && 
            AppState.pastures[0].points.length > 0) {
            mapCenter = [
                AppState.pastures[0].points[0].lat, 
                AppState.pastures[0].points[0].lng
            ];
            mapZoom = 14;
        }
        
        try {
            AppState.map = L.map('map').setView(mapCenter, mapZoom);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19,
                minZoom: 3
            }).addTo(AppState.map);

            // Limpar estado dos pontos do pasto
            MapManager.clearPasturePoints();

            // Renderizar elementos do mapa
            MapManager.renderPastures();
            MapManager.renderCattle();
            MapManager.setupClickHandler();
            
            PastureManager.updateList();
        } catch (error) {
            Utils.showError('Erro ao inicializar mapa: ' + error.message);
        }
    },
    
    renderPastures: () => {
        AppState.mapMarkers = [];
        AppState.mapPastures = [];
        
        AppState.pastures.forEach((pasture, index) => {
            if (!pasture.points || pasture.points.length < 3) return;
            
            const points = pasture.points.map(p => [p.lat, p.lng]);
            const color = Utils.getPastureColor(index);
            const safeName = Utils.escapeHtml(pasture.name);
            
            const polygon = L.polygon(points, {
                color: color,
                fillColor: color,
                fillOpacity: 0.4,
                weight: 3
            }).addTo(AppState.map);

            const cattleInPasture = AppState.cattle.filter(c => c.pasture === pasture.name);
            const popupText = `
                <div style="min-width: 150px;">
                    <strong>#${index + 1} ${safeName}</strong><br>
                    Área: ${pasture.area} ha<br>
                    🐄 Gados: ${cattleInPasture.length}<br>
                    <button class="btn-submit" style="margin-top: 8px; padding: 6px 12px; width: 100%;" onclick="openPastureDetails('${safeName}')">Ver Detalhes</button>
                </div>
            `;
            
            polygon.bindPopup(popupText);
            AppState.mapPastures.push(polygon);
        });
    },
    
    renderCattle: () => {
        AppState.cattle.forEach(c => {
            const pasture = AppState.pastures.find(p => p.name === c.pasture);
            if (!pasture || !pasture.points || pasture.points.length === 0) return;
            
            // Usar ponto central do pasto
            const centerPoint = pasture.points[0];
            const safeCattleId = Utils.escapeHtml(c.id);
            const safeCattleRace = Utils.escapeHtml(c.race);
            
            const marker = L.circleMarker([centerPoint.lat, centerPoint.lng], {
                radius: 8,
                fillColor: '#FFC107',
                color: '#FF8C00',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8
            }).addTo(AppState.map);
            
            marker.bindPopup(`
                <div style="min-width: 120px;">
                    🐄 <strong>${safeCattleId}</strong><br>
                    Raça: ${safeCattleRace}<br>
                    Peso: ${c.weight} kg
                </div>
            `);
            
            AppState.pastureMarkers.push(marker);
        });
    },
    
    setupClickHandler: () => {
        if (!AppState.map) return;
        
        AppState.map.on('click', (e) => {
            const newPoint = { lat: e.latlng.lat, lng: e.latlng.lng };
            AppState.pasturePoints.push(newPoint);
            
            // Adicionar marcador visual
            const marker = L.circleMarker([newPoint.lat, newPoint.lng], {
                radius: 6,
                fillColor: '#2196F3',
                color: '#1976D2',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8
            }).addTo(AppState.map);
            
            AppState.pastureMarkers.push(marker);
            
            // Desenhar linhas conectando pontos
            if (AppState.pasturePoints.length > 1) {
                const lastPoint = AppState.pasturePoints[AppState.pasturePoints.length - 2];
                const line = L.polyline([
                    [lastPoint.lat, lastPoint.lng], 
                    [newPoint.lat, newPoint.lng]
                ], {
                    color: '#2196F3',
                    weight: 2,
                    opacity: 0.7,
                    dashArray: '5, 5'
                }).addTo(AppState.map);
                
                AppState.pasturePolygons.push(line);
            }
            
            // Fechar o polígono quando tiver 3+ pontos
            if (AppState.pasturePoints.length >= 3) {
                const firstPoint = AppState.pasturePoints[0];
                const lastPoint = AppState.pasturePoints[AppState.pasturePoints.length - 1];
                const closeLine = L.polyline([
                    [lastPoint.lat, lastPoint.lng], 
                    [firstPoint.lat, firstPoint.lng]
                ], {
                    color: '#2196F3',
                    weight: 2,
                    opacity: 0.7,
                    dashArray: '5, 5'
                }).addTo(AppState.map);
                
                AppState.pasturePolygons.push(closeLine);
            }
            
            const pointsCountEl = document.getElementById('pointsCount');
            if (pointsCountEl) {
                pointsCountEl.textContent = `Pontos adicionados: ${AppState.pasturePoints.length}`;
            }
        });
    },
    
    clearPasturePoints: () => {
        AppState.pasturePoints = [];
        
        AppState.pastureMarkers.forEach(marker => {
            if (AppState.map) AppState.map.removeLayer(marker);
        });
        AppState.pastureMarkers = [];
        
        AppState.pasturePolygons.forEach(poly => {
            if (AppState.map) AppState.map.removeLayer(poly);
        });
        AppState.pasturePolygons = [];
        
        const pointsCountEl = document.getElementById('pointsCount');
        if (pointsCountEl) {
            pointsCountEl.textContent = 'Pontos adicionados: 0';
        }
    }
};

// ========== GERENCIAMENTO DE DETALHES E HISTÓRICO ==========
const DetailsManager = {
    openCattleDetails: (index) => {
        if (index < 0 || index >= AppState.cattle.length) return;
        
        const c = AppState.cattle[index];
        const modal = document.getElementById('detailModal');
        const content = document.getElementById('modalContent');
        
        if (!modal || !content) return;

        const historyHTML = c.history.map(h => {
            const safeComment = h.comment ? Utils.escapeHtml(h.comment) : '';
            return `
                <div class="history-entry">
                    <div class="history-date">📅 ${h.date}</div>
                    <div class="history-weight">⚖️ Peso: ${h.weight} kg</div>
                    ${safeComment ? `<div class="history-comment">💬 "${safeComment}"</div>` : ''}
                    ${h.photo ? `<img src="${h.photo}" class="history-image" alt="Foto do histórico">` : ''}
                </div>
            `;
        }).join('');

        content.innerHTML = `
            <h2>${Utils.escapeHtml(c.id)}</h2>
            <div style="margin-top: 20px;">
                <h3>ℹ️ Informações Gerais</h3>
                <p><strong>Raça:</strong> ${Utils.escapeHtml(c.race)}</p>
                <p><strong>Idade:</strong> ${Utils.escapeHtml(c.age)} meses</p>
                <p><strong>Pasto Atual:</strong> ${Utils.escapeHtml(c.pasture)}</p>
                
                <h3 style="margin-top: 20px;">📊 Histórico de Peso</h3>
                ${historyHTML || '<p style="color: #999;">Sem histórico adicional</p>'}
                
                <h3 style="margin-top: 20px;">➕ Adicionar Novo Registro</h3>
                <div class="form-group">
                    <label for="newWeight">Peso (kg) *</label>
                    <input type="number" id="newWeight" placeholder="Ex: 520" step="0.1" min="0" required>
                </div>
                <div class="form-group">
                    <label for="newComment">Observação</label>
                    <textarea id="newComment" placeholder="Adicione uma observação..."></textarea>
                </div>
                <div class="form-group">
                    <label for="newPhoto">Foto 📷</label>
                    <input type="file" id="newPhoto" accept="image/*">
                </div>
                <button class="btn-submit" onclick="DetailsManager.addHistory(${index})">➕ Adicionar Registro</button>
            </div>
        `;
        modal.style.display = 'block';
    },
    
    openPastureDetails: (pastureName) => {
        const modal = document.getElementById('detailModal');
        const content = document.getElementById('modalContent');
        
        if (!modal || !content) return;
        
        const safeName = Utils.escapeHtml(pastureName);
        const cattleInPasture = AppState.cattle.filter(c => c.pasture === pastureName);

        let cattleList = cattleInPasture.map((c, idx) => {
            const safeCattleId = Utils.escapeHtml(c.id);
            const safeCattleRace = Utils.escapeHtml(c.race);
            return `
                <div style="background: #f9f9f9; padding: 10px; border-radius: 6px; margin-bottom: 8px;">
                    <input type="checkbox" 
                           id="cattle_${idx}" 
                           onchange="DetailsManager.updateCattleAssignment('${pastureName}', '${c.id}', this.checked)" 
                           checked
                           aria-label="Remover ${safeCattleId} deste pasto">
                    <label for="cattle_${idx}" style="margin-left: 8px; cursor: pointer;">
                        🐄 ${safeCattleId} (${safeCattleRace}) - ${c.weight} kg
                    </label>
                </div>
            `;
        }).join('');

        const allCattle = AppState.cattle.filter(c => c.pasture !== pastureName).map((c, idx) => {
            const safeCattleId = Utils.escapeHtml(c.id);
            const safeCattleRace = Utils.escapeHtml(c.race);
            return `
                <div style="background: #f9f9f9; padding: 10px; border-radius: 6px; margin-bottom: 8px;">
                    <input type="checkbox" 
                           id="add_cattle_${idx}" 
                           onchange="DetailsManager.updateCattleAssignment('${pastureName}', '${c.id}', this.checked)"
                           aria-label="Adicionar ${safeCattleId} a este pasto">
                    <label for="add_cattle_${idx}" style="margin-left: 8px; cursor: pointer;">
                        🐄 ${safeCattleId} (${safeCattleRace}) - ${c.weight} kg
                    </label>
                </div>
            `;
        }).join('');

        content.innerHTML = `
            <h2>📍 ${safeName}</h2>
            <div style="margin-top: 20px;">
                <h3>🐄 Gados Neste Pasto (${cattleInPasture.length})</h3>
                ${cattleList || '<p style="color: #999;">Nenhum gado neste pasto</p>'}
                
                <h3 style="margin-top: 20px;">➕ Adicionar Gados</h3>
                ${allCattle || '<p style="color: #999;">Todos os gados já estão atribuídos a pastos</p>'}
                
                <button class="btn-submit" style="margin-top: 20px;" onclick="closeModal()">✓ Fechar</button>
            </div>
        `;
        modal.style.display = 'block';
    },
    
    updateCattleAssignment: (pastureName, cattleId, isAdding) => {
        const cattleIndex = AppState.cattle.findIndex(c => c.id === cattleId);
        if (cattleIndex === -1) return;
        
        if (isAdding) {
            AppState.cattle[cattleIndex].pasture = pastureName;
        } else {
            AppState.cattle[cattleIndex].pasture = 'Sem pasto';
        }
        
        DataManager.saveCattle();
        MapManager.init();
    },
    
    addHistory: (index) => {
        if (index < 0 || index >= AppState.cattle.length) return;
        
        const weightInput = document.getElementById('newWeight');
        const commentInput = document.getElementById('newComment');
        const photoInput = document.getElementById('newPhoto');
        
        if (!weightInput) return;
        
        const weight = parseFloat(weightInput.value);
        const comment = commentInput ? commentInput.value.trim() : '';
        
        if (!weight || weight <= 0) {
            Utils.showError('Preencha um peso válido (maior que zero)');
            return;
        }

        const processHistory = (photoData) => {
            AppState.cattle[index].history.push({
                date: new Date().toLocaleDateString('pt-BR'),
                weight: weight,
                comment: comment,
                photo: photoData || ''
            });

            AppState.cattle[index].weight = weight;
            
            if (DataManager.saveCattle()) {
                closeModal();
                displayCattle();
                Utils.showSuccess('✓ Registro adicionado com sucesso!');
            }
        };

        if (photoInput && photoInput.files && photoInput.files[0]) {
            const file = photoInput.files[0];
            
            // Validar arquivo
            if (!file.type.match('image.*')) {
                Utils.showError('Selecione apenas imagens');
                return;
            }
            
            if (file.size > 5 * 1024 * 1024) {
                Utils.showError('Imagem muito grande. Máximo: 5MB');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => processHistory(e.target.result);
            reader.onerror = () => Utils.showError('Erro ao ler imagem');
            reader.readAsDataURL(file);
        } else {
            processHistory('');
        }
    }
};

// ========== EXIBIÇÃO DE GADOS ==========
function displayCattle() {
    const container = document.getElementById('cattleContainer');
    if (!container) return;
    
    if (AppState.cattle.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>Nenhum gado cadastrado ainda</h3>
                <p>Comece adicionando seu primeiro gado na seção de cadastro</p>
            </div>
        `;
        return;
    }

    container.innerHTML = AppState.cattle.map((c, index) => {
        const safeId = Utils.escapeHtml(c.id);
        const safeRace = Utils.escapeHtml(c.race);
        const safePasture = Utils.escapeHtml(c.pasture);
        
        return `
            <div class="cattle-card">
                ${c.photo 
                    ? `<img src="${c.photo}" alt="Foto de ${safeId}" loading="lazy">` 
                    : '<div style="width:100%;height:200px;background:#ddd;display:flex;align-items:center;justify-content:center;color:#999;flex-direction:column;"><span style="font-size: 48px;">🐄</span><span>Sem foto</span></div>'}
                <div class="cattle-info">
                    <div class="cattle-id">${safeId}</div>
                    <div class="cattle-detail">🏷️ Raça: ${safeRace}</div>
                    <div class="cattle-detail">⚖️ Peso: ${c.weight} kg</div>
                    <div class="cattle-detail">📅 Data: ${c.date}</div>
                    <div class="cattle-detail">📍 Pasto: ${safePasture}</div>
                    <div class="cattle-actions">
                        <button class="btn-small btn-view" onclick="viewDetails(${index})" aria-label="Ver detalhes de ${safeId}">Detalhes</button>
                        <button class="btn-small btn-delete" onclick="deleteCattle(${index})" aria-label="Excluir ${safeId}">Excluir</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ========== NAVEGAÇÃO ENTRE SEÇÕES ==========
function showSection(sectionId) {
    if (!sectionId) return;
    
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');
    }

    if (sectionId === 'visualizacao') {
        displayCattle();
    } else if (sectionId === 'mapa') {
        // Pequeno delay para garantir que o container do mapa está renderizado
        setTimeout(() => MapManager.init(), 100);
    } else if (sectionId === 'cadastro') {
        // Atualizar ID automático quando voltar para cadastro
        const cattleIdInput = document.getElementById('cattleId');
        if (cattleIdInput && !cattleIdInput.value) {
            cattleIdInput.value = DataManager.generateCattleId();
        }
    }
}

// ========== FUNÇÕES DE COMPATIBILIDADE GLOBAL ==========
function captureCattlePhoto() {
    const input = document.getElementById('cattlePhotoCapture');
    if (input) input.click();
}

function uploadCattlePhoto() {
    const input = document.getElementById('cattlePhoto');
    if (input) input.click();
}

function clearPhoto() {
    PhotoManager.clear();
}

function addPasture() {
    PastureManager.add();
}

function clearPasturePoints() {
    MapManager.clearPasturePoints();
}

function focusPastureOnMap(pastureName, lat, lng) {
    PastureManager.focusOnMap(pastureName, lat, lng);
}

function viewDetails(index) {
    DetailsManager.openCattleDetails(index);
}

function openPastureDetails(pastureName) {
    DetailsManager.openPastureDetails(pastureName);
}

function updateCattleAssignment(pastureName, cattleId, isAdding) {
    DetailsManager.updateCattleAssignment(pastureName, cattleId, isAdding);
}

function addHistory(index) {
    DetailsManager.addHistory(index);
}

function deleteCattle(index) {
    CattleManager.delete(index);
}

function deletePasture(pastureName) {
    PastureManager.delete(pastureName);
}

function closeModal() {
    const modal = document.getElementById('detailModal');
    if (modal) modal.style.display = 'none';
}

function initMap() {
    MapManager.init();
}

function updatePasturesList() {
    PastureManager.updateList();
}

// ========== INICIALIZAÇÃO ==========
function initializeApp() {
    // Auto-gerar ID inicial
    const cattleIdInput = document.getElementById('cattleId');
    if (cattleIdInput) {
        cattleIdInput.value = DataManager.generateCattleId();
    }
    
    // Event handlers para fotos
    const photoInput = document.getElementById('cattlePhoto');
    const captureInput = document.getElementById('cattlePhotoCapture');
    
    if (photoInput) {
        photoInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                PhotoManager.processFile(e.target.files[0]);
            }
        });
    }
    
    if (captureInput) {
        captureInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                PhotoManager.processFile(e.target.files[0]);
            }
        });
    }
    
    // Event handler para formulário de cadastro
    const cattleForm = document.getElementById('cattleForm');
    if (cattleForm) {
        cattleForm.addEventListener('submit', (e) => {
            e.preventDefault();
            CattleManager.register(cattleForm);
        });
    }
    
    // Fechar modal ao clicar fora
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('detailModal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Tecla ESC fecha modal
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            const modal = document.getElementById('detailModal');
            if (modal && modal.style.display === 'block') {
                closeModal();
            }
        }
    });
    
    // Exibir gados cadastrados
    displayCattle();
}

// Inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
