    function excelDateToMonthYear(serial) {
      const excelEpoch = new Date(1899, 11, 30);
      const date = new Date(excelEpoch.getTime() + serial * 86400000);
      return date.toLocaleDateString('pt-BR', {
        month: 'short',
        year: 'numeric'
      }).replace('.', '');
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
  const labels = rawHeaders.map(cell => typeof cell === 'number' ? excelDateToMonthYear(cell) : cell);

  const receitas = new Array(labels.length).fill(0);
  const debitos = new Array(labels.length).fill(0);

  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i];
    const tipo = linha[0];

    for (let j = 4; j < cabecalho.length; j++) {
      const valor = parseFloat(linha[j]);
      if (!isNaN(valor)) {
        if (tipo && tipo.toLowerCase().includes('receita')) {
          receitas[j - 4] += valor;
        } else if (tipo && tipo.toLowerCase().includes('débito')) {
          debitos[j - 4] += valor;
        }
      }
    }
  }

  const ctx = document.getElementById('myChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Receitas',
          data: receitas,
          backgroundColor: 'rgba(75, 192, 192, 0.6)'
        },
        {
          label: 'Débitos',
          data: debitos,
          backgroundColor: 'rgba(255, 99, 132, 0.6)'
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
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
