function excelDateToMonthYear(dateObj) {
  return dateObj.toLocaleDateString('pt-BR', {
    month: 'short',
    year: 'numeric'
  }).replace('.', '');
}

let dadosBrutos = [];
let labels = [];

let chartReceitas, chartDebitos, chartGeral;

let dadosReceitaGeral = [];
let dadosDebitoGeral = [];

function criarSeletorDeIntervalo(labels) {
  const selectInicio = document.getElementById('mesInicio');
  const selectFim = document.getElementById('mesFim');

  selectInicio.innerHTML = '';
  selectFim.innerHTML = '';

  labels.forEach((label, i) => {
    const option1 = new Option(label, i);
    const option2 = new Option(label, i);
    selectInicio.appendChild(option1);
    selectFim.appendChild(option2);
  });

  selectInicio.value = 0;
  selectFim.value = labels.length - 1;

  selectInicio.onchange = () => atualizarGraficoGeral();
  selectFim.onchange = () => atualizarGraficoGeral();
}

function criarBotoesGraficoGeral() {
  const container = document.getElementById('filtroGeral');
  container.innerHTML = '';

  const opcoes = ['Todos', 'Receitas', 'Débitos'];

  opcoes.forEach(opcao => {
    const btn = document.createElement('button');
    btn.textContent = opcao;
    btn.onclick = () => atualizarGraficoGeral(opcao.toLowerCase());
    container.appendChild(btn);
  });
}

function normalizarTexto(texto) {
  return texto?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

async function carregarPlanilha() {
  const url = 'https://docs.google.com/spreadsheets/d/1o0QvqWtjUrA20h3t_xo7pwbNAqkLLcnBBZMf0LfAI6o/export?format=xlsx';
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array" });

  const aba = "Página1";
  const sheet = workbook.Sheets[aba];
  const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  const linhas = json.slice(1);

  dadosBrutos = linhas.map(l => ({
    tipo: l[2],
    categoria: l[3],
    data: new Date(l[4]),
    valor: parseFloat(l[5])
  })).filter(l => !isNaN(l.valor) && !isNaN(l.data));

  const mesesSet = new Set();
  dadosBrutos.forEach(item => {
    const mesAno = excelDateToMonthYear(item.data);
    mesesSet.add(mesAno);
  });
  labels = Array.from(mesesSet).sort((a, b) => new Date('01 ' + a) - new Date('01 ' + b));

  const categoriasReceita = [...new Set(dadosBrutos.filter(d => d.tipo?.toLowerCase().includes('receita')).map(d => d.categoria))];
  const categoriasDebito = [...new Set(dadosBrutos.filter(d => d.tipo?.toLowerCase().includes('debito')).map(d => d.categoria))];

  criarBotoes('filtrosReceita', categoriasReceita, atualizarGraficoReceita);
  criarBotoes('filtrosDebito', categoriasDebito, atualizarGraficoDebito);

  atualizarGraficoReceita();
  atualizarGraficoDebito();
  criarSeletorDeIntervalo(labels);
  criarBotoesGraficoGeral();
  atualizarGraficoGeral("todos");
}

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

function atualizarGraficoGeral(filtro = "todos") {
  dadosReceitaGeral = new Array(labels.length).fill(0);
  dadosDebitoGeral = new Array(labels.length).fill(0);

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

carregarPlanilha();
