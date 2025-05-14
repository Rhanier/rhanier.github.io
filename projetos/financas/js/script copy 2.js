  function excelDateToMonthYear(serial) {
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + serial * 86400000);
    return date.toLocaleDateString('pt-BR', {
      month: 'short',
      year: 'numeric'
    }).replace('.', '');
  }

  async function carregarPlanilha() {
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
      const tipo = linha[0]; // Supondo que "Receita"/"Débito" está na coluna A (índice 0)

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

  carregarPlanilha();
