function calcularJurosCompostos() {
  const valorInicial = parseFloat(document.getElementById('valorInicial').value);
  const taxaJuros = parseFloat(document.getElementById('taxaJuros').value) / 100;
  const qtdMeses = parseInt(document.getElementById('qtdMeses').value);
  const resultadoDiv = document.getElementById('resultadoCompostos');

  const montante = valorInicial * Math.pow(1 + taxaJuros, qtdMeses);

  resultadoDiv.textContent = `Montante após ${qtdMeses} meses: R$ ${montante.toFixed(2)}`;
  resultadoDiv.style.display = 'block';
}

function calcularJurosSimples() {
  const valorInicial = parseFloat(document.getElementById('valorInicialSimples').value);
  const taxaJuros = parseFloat(document.getElementById('taxaJurosSimples').value) / 100;
  const qtdMeses = parseInt(document.getElementById('qtdMesesSimples').value);
  const resultadoDiv = document.getElementById('resultadoSimples');

  const montante = valorInicial * (1 + (taxaJuros * qtdMeses));

  resultadoDiv.textContent = `Montante após ${qtdMeses} meses: R$ ${montante.toFixed(2)}`;
  resultadoDiv.style.display = 'block';
}