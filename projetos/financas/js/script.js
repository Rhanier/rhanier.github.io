    function excelDateToMonthYear(serial) {
      const excelEpoch = new Date(1899, 11, 30);
      const date = new Date(excelEpoch.getTime() + serial * 86400000);
      return date.toLocaleDateString('pt-BR', {
        month: 'short',
        year: 'numeric'
      }).replace('.', '');
    }

let chartGeral;
let dadosReceitaGeral = [];
let dadosDebitoGeral = [];
let labelsGeral = [];

let mesesSelecionados = []; // manterá os meses escolhidos pelo usuário

function normalizarTexto(texto) {
  return texto?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function criarSeletorDeIntervalo(labels) {
  const selectInicio = document.getElementById('mesInicio');
  const selectFim = document.getElementById('mesFim');

  // Resetar os selects
  selectInicio.innerHTML = '';
  selectFim.innerHTML = '';

  labels.forEach((label, i) => {
    const option1 = new Option(label, i);
    const option2 = new Option(label, i);
    selectInicio.appendChild(option1);
    selectFim.appendChild(option2);
  });

  // Valores padrão (início = 0, fim = último)
  selectInicio.value = 0;
  selectFim.value = labels.length - 1;

  selectInicio.onchange = () => atualizarGraficoGeral();
  selectFim.onchange = () => atualizarGraficoGeral();
}

function criarCheckboxMeses(labels) {
  const container = document.getElementById('filtroMeses');
  container.innerHTML = ''; // limpar antes de recriar

  labels.forEach((label, i) => {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = i;
    checkbox.checked = true; // marcar todos por padrão
    checkbox.onchange = () => atualizarGraficoGeral(); // atualiza ao mudar

    const labelTag = document.createElement('label');
    labelTag.appendChild(checkbox);
    labelTag.appendChild(document.createTextNode(` ${label}`));

    container.appendChild(labelTag);
  });

  // Preenche inicialmente com todos selecionados
  mesesSelecionados = labels.map((_, i) => i);
}

function criarBotoesGraficoGeral() {
  const container = document.getElementById('filtroGeral');
  const opcoes = ['Todos', 'Receitas', 'Débitos'];

  opcoes.forEach(opcao => {
    const btn = document.createElement('button');
    btn.textContent = opcao;
    btn.onclick = () => atualizarGraficoGeral(opcao.toLowerCase());
    container.appendChild(btn);
  });
}


async function carregarGraficoGeral() {
  const url = 'https://docs.google.com/spreadsheets/d/16IHVI9UkXfu-WE7fzLNcEMGY6Df3BXBa/export?format=xlsx';
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array" });

  const aba = "Página2";
  const sheet = workbook.Sheets[aba];
  const jsonCompleto = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  const cabecalho = jsonCompleto[0];
  const linhas = jsonCompleto.slice(1);

  const rawHeaders = cabecalho.slice(4);
  labelsGeral = rawHeaders.map(cell => typeof cell === 'number' ? excelDateToMonthYear(cell) : cell);
// criarCheckboxMeses(labelsGeral);
criarSeletorDeIntervalo(labelsGeral);
  dadosReceitaGeral = new Array(labelsGeral.length).fill(0);
  dadosDebitoGeral = new Array(labelsGeral.length).fill(0);

  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i];
    const tipo = linha[0];

    for (let j = 4; j < cabecalho.length; j++) {
      const valor = parseFloat(linha[j]);
      if (!isNaN(valor)) {
        if (tipo && normalizarTexto(tipo).includes('receita')) {
          dadosReceitaGeral[j - 4] += valor;
        } else if (tipo && normalizarTexto(tipo).includes('debito')) {
          dadosDebitoGeral[j - 4] += valor;
        }
      }
    }
  }

  criarBotoesGraficoGeral();
  atualizarGraficoGeral("todos");
}

function atualizarGraficoGeral(filtro = "todos") {
  const inicio = parseInt(document.getElementById('mesInicio').value);
  const fim = parseInt(document.getElementById('mesFim').value);

  if (inicio > fim) return;

  const mesesSelecionados = [];
  for (let i = inicio; i <= fim; i++) {
    mesesSelecionados.push(i);
  }

  const ctx = document.getElementById('myChart').getContext('2d');
  if (chartGeral) chartGeral.destroy();

  const datasets = [];

  const receitaData = mesesSelecionados.map(i => dadosReceitaGeral[i]);
  const debitoData = mesesSelecionados.map(i => dadosDebitoGeral[i]);
  const diferencaData = receitaData.map((val, idx) => val - debitoData[idx]);

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

  // Nova linha: diferença
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

  const labelsFiltradas = mesesSelecionados.map(i => labelsGeral[i]);

  chartGeral = new Chart(ctx, {
    data: {
      labels: labelsFiltradas,
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


    let dadosBrutos = [];
    let labels = [];

    let chartReceitas, chartDebitos;

    async function carregarPlanilha() {
      const url = 'https://docs.google.com/spreadsheets/d/16IHVI9UkXfu-WE7fzLNcEMGY6Df3BXBa/export?format=xlsx';
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });

      const aba = "Página2";
      const sheet = workbook.Sheets[aba];
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      const cabecalho = json[0];
      const linhas = json.slice(1);

      const rawHeaders = cabecalho.slice(4);
      labels = rawHeaders.map(cell =>
        typeof cell === 'number' ? excelDateToMonthYear(cell) : cell
      );

      dadosBrutos = linhas.map(l => ({
        tipo: l[0],
        categoria: l[1],
        valores: l.slice(4)
      }));

      const categoriasReceita = [...new Set(dadosBrutos.filter(d => d.tipo?.toLowerCase().includes('receita')).map(d => d.categoria))];
      const categoriasDebito = [...new Set(dadosBrutos.filter(d => d.tipo?.toLowerCase().includes('debito')).map(d => d.categoria))];

      // Criar botões
      criarBotoes('filtrosReceita', categoriasReceita, atualizarGraficoReceita);
      criarBotoes('filtrosDebito', categoriasDebito, atualizarGraficoDebito);

      // Inicializa com todos
      atualizarGraficoReceita();
      atualizarGraficoDebito();
    }

    function criarBotoes(containerId, categorias, callback) {
      const container = document.getElementById(containerId);
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

    // Receitas
    function atualizarGraficoReceita(filtro = null) {
      const dados = new Array(labels.length).fill(0);

      dadosBrutos.forEach(l => {
        if (l.tipo?.toLowerCase().includes('receita')) {
          if (!filtro || l.categoria === filtro) {
            l.valores.forEach((v, i) => {
              const val = parseFloat(v);
              if (!isNaN(val)) dados[i] += val;
            });
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

    // Debitos
    function atualizarGraficoDebito(filtro = null) {
      const dados = new Array(labels.length).fill(0);

      dadosBrutos.forEach(l => {
        if (l.tipo?.toLowerCase().includes('debito')) {
          if (!filtro || l.categoria === filtro) {
            l.valores.forEach((v, i) => {
              const val = parseFloat(v);
              if (!isNaN(val)) dados[i] += val;
            });
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
    
    carregarPlanilha();
    carregarGraficoGeral();
