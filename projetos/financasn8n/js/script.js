// =========================
// 🔧 Utilitários
// =========================

// Converte objeto Date para "mai 2025"
function excelDateToMonthYear(dateObj) {
  return dateObj.toLocaleDateString('pt-BR', {
    month: 'short',
    year: 'numeric'
  }).replace('.', '');
}

// Normaliza texto para comparação
function normalizarTexto(texto) {
  return texto?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// =========================
// 📅 Controles de filtro
// =========================

// Cria os seletores de intervalo de meses (De / Até)
function criarSeletorDeIntervalo(labels) {
  const selectInicio = document.getElementById('mesInicio');
  const selectFim = document.getElementById('mesFim');

  selectInicio.innerHTML = '';
  selectFim.innerHTML = '';

  labels.forEach((label, i) => {
    selectInicio.appendChild(new Option(label, i));
    selectFim.appendChild(new Option(label, i));
  });

  selectInicio.value = 0;
  selectFim.value = labels.length - 1;

  selectInicio.onchange = () => atualizarGraficoGeral();
  selectFim.onchange = () => atualizarGraficoGeral();
}

// Cria botões "Todos / Receitas / Débitos" para o gráfico geral
function criarBotoesGraficoGeral() {
  const container = document.getElementById('filtroGeral');
  container.innerHTML = '';

  ['Todos', 'Receitas', 'Débitos'].forEach(opcao => {
    const btn = document.createElement('button');
    btn.textContent = opcao;
    btn.onclick = () => atualizarGraficoGeral(opcao.toLowerCase());
    container.appendChild(btn);
  });
}

// Cria botões por categoria
function criarBotoes(containerId, categorias, callback) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  const todos = document.createElement('button');
  todos.textContent = 'Todos';
  todos.onclick = () => callback();
  container.appendChild(todos);

  categorias.forEach(cat => {
    const btn = document.createElement('button');
    btn.textContent = cat;
    btn.onclick = () => callback(cat);
    container.appendChild(btn);
  });
}

// =========================
// 📦 Variáveis globais
// =========================

let dadosBrutos = [];
let labels = [];

let chartReceitas, chartDebitos, chartGeral;
let dadosReceitaGeral = [];
let dadosDebitoGeral = [];

// =========================
// 📥 Carregamento e preparo dos dados
// =========================

async function carregarPlanilha() {
  const url = 'https://docs.google.com/spreadsheets/d/1o0QvqWtjUrA20h3t_xo7pwbNAqkLLcnBBZMf0LfAI6o/export?format=xlsx';
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array" });

  const aba = "Página1";
  const sheet = workbook.Sheets[aba];
  const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  const linhas = json.slice(1);

  // Converte cada linha em objeto estruturado
  dadosBrutos = linhas.map(l => {
    const tipo = l[2];
    const categoria = l[3];
    const dataBruta = l[4];
    const valor = parseFloat(l[5]);

    const data = !isNaN(dataBruta)
      ? new Date(Date.UTC(1899, 11, 30) + dataBruta * 86400000)
      : null;

    return { tipo, categoria, data, valor };
  }).filter(l => !isNaN(l.valor) && l.data instanceof Date && !isNaN(l.data));
  // Ordena os dados por data
dadosBrutos.sort((a, b) => a.data - b.data);

  // Gera lista de meses únicos ordenados
  const mesesSet = new Set();
  dadosBrutos.forEach(item => mesesSet.add(excelDateToMonthYear(item.data)));
  labels = Array.from(mesesSet).sort((a, b) => new Date('01 ' + a) - new Date('01 ' + b));

  // Categorias únicas
  const categoriasReceita = [...new Set(dadosBrutos.filter(d => d.tipo?.toLowerCase().includes('receita')).map(d => d.categoria))];
  const categoriasDebito = [...new Set(dadosBrutos.filter(d => d.tipo?.toLowerCase().includes('debito')).map(d => d.categoria))];

  // Inicialização de UI
  criarBotoes('filtrosReceita', categoriasReceita, atualizarGraficoReceita);
  criarBotoes('filtrosDebito', categoriasDebito, atualizarGraficoDebito);
  criarSeletorDeIntervalo(labels);
  criarBotoesGraficoGeral();

  // Primeiros gráficos
  atualizarGraficoReceita();
  atualizarGraficoDebito();
  atualizarGraficoGeral("todos");
}

// =========================
// 📊 Gráficos
// =========================

// Gráfico de Receitas
function atualizarGraficoReceita(filtro = null) {
  const dados = new Array(labels.length).fill(0);

  dadosBrutos.forEach(item => {
    if (item.tipo?.toLowerCase().includes('receita')) {
      const mesAno = excelDateToMonthYear(item.data);
      const index = labels.indexOf(mesAno);
      if (index !== -1 && (!filtro || item.categoria === filtro)) {
        dados[index] += item.valor;
      }
    }
  });

  const ctx = document.getElementById('chartReceitas').getContext('2d');
  if (chartReceitas) chartReceitas.destroy();

  chartReceitas = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: filtro ? `Receitas - ${filtro}` : 'Todas as Receitas',
        data: dados,
        backgroundColor: 'rgba(75, 192, 192, 0.6)'
      }]
    },
    options: { responsive: true, scales: { y: { beginAtZero: true } } }
  });
}

// Gráfico de Débitos
function atualizarGraficoDebito(filtro = null) {
  const dados = new Array(labels.length).fill(0);

  dadosBrutos.forEach(item => {
    if (item.tipo?.toLowerCase().includes('debito')) {
      const mesAno = excelDateToMonthYear(item.data);
      const index = labels.indexOf(mesAno);
      if (index !== -1 && (!filtro || item.categoria === filtro)) {
        dados[index] += item.valor;
      }
    }
  });

  const ctx = document.getElementById('chartDebitos').getContext('2d');
  if (chartDebitos) chartDebitos.destroy();

  chartDebitos = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: filtro ? `Débitos - ${filtro}` : 'Todos os Débitos',
        data: dados,
        backgroundColor: 'rgba(255, 99, 132, 0.6)'
      }]
    },
    options: { responsive: true, scales: { y: { beginAtZero: true } } }
  });
}

// Gráfico Geral (Receitas, Débitos, Diferença)
function atualizarGraficoGeral(filtro = "todos") {
  // Inicializa arrays
  dadosReceitaGeral = new Array(labels.length).fill(0);
  dadosDebitoGeral = new Array(labels.length).fill(0);

  // Preenche dados
  dadosBrutos.forEach(item => {
    const mesAno = excelDateToMonthYear(item.data);
    const index = labels.indexOf(mesAno);
    if (index !== -1) {
      if (item.tipo?.toLowerCase().includes('receita')) {
        dadosReceitaGeral[index] += item.valor;
      } else if (item.tipo?.toLowerCase().includes('debito')) {
        dadosDebitoGeral[index] += item.valor;
      }
    }
  });

  const receitaData = dadosReceitaGeral;
  const debitoData = dadosDebitoGeral;
  const diferencaData = receitaData.map((val, idx) => val - debitoData[idx]);

  const datasets = [];

  if (filtro === "todos" || filtro === "receitas") {
    datasets.push({
      label: 'Receitas',
      data: receitaData,
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
      type: 'bar'
    });
  }

  if (filtro === "todos" || filtro === "débitos" || filtro === "debitos") {
    datasets.push({
      label: 'Débitos',
      data: debitoData,
      backgroundColor: 'rgba(255, 99, 132, 0.6)',
      type: 'bar'
    });
  }

  if (filtro === "todos") {
    datasets.push({
      label: 'Diferença (Receita - Débito)',
      data: diferencaData,
      borderColor: 'rgba(54, 162, 235, 1)',
      backgroundColor: 'transparent',
      borderWidth: 2,
      type: 'line',
      tension: 0.3,
      pointRadius: 3,
      pointBackgroundColor: 'rgba(54, 162, 235, 1)'
    });
  }

  const ctx = document.getElementById('myChart').getContext('2d');
  if (chartGeral) chartGeral.destroy();

  chartGeral = new Chart(ctx, {
    data: {
      labels: labels,
      datasets: datasets
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

// Inicializa
carregarPlanilha();
