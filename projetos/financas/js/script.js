async function carregarPlanilha() {
      const url = 'https://docs.google.com/spreadsheets/d/16IHVI9UkXfu-WE7fzLNcEMGY6Df3BXBa/export?format=xlsx';

      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });

      const aba = "Página2"; // Nome da aba exata
      const sheet = workbook.Sheets[aba];
      const jsonCompleto = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      // jsonCompleto é uma matriz de arrays, onde cada linha é um array de células
      const cabecalho = jsonCompleto[0];
      const linhas = jsonCompleto.slice(1);

    //  const labels = cabecalho.slice(4); // Colunas E em diante = meses
   function excelDateToMonthName(serial) {
  const excelEpoch = new Date(1899, 11, 30); // base do Excel
  const date = new Date(excelEpoch.getTime() + serial * 86400000);
  return date.toLocaleDateString('pt-BR', { month: 'short' , year: 'numeric' }).replace('. de ', '/');;
}

const rawHeaders = cabecalho.slice(4);

const labels = rawHeaders.map(cell => {
  if (typeof cell === 'number') {
    return excelDateToMonthName(cell);
  }
  return cell;
});

    const valores = new Array(labels.length).fill(0);

      // Somar valores de cada coluna de mês
      for (let i = 0; i < linhas.length; i++) {
        for (let j = 4; j < cabecalho.length; j++) {
          const valor = parseFloat(linhas[i][j]);
          if (!isNaN(valor)) {
            valores[j - 4] += valor;
          }
        }
      }

      console.log("Labels (Meses):", labels);
      console.log("Valores somados:", valores);

      const ctx = document.getElementById('myChart').getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Total por mês',
            data: valores,
            borderWidth: 1
          }]
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