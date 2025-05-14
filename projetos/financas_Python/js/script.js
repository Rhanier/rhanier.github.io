
'use strict';
console.log("1_Gaso")

// adiciona carro
let carro1nome = "Fit"
let kmlGas = 16
let carro1Et = 13

let carro1 = {}

carro1.model = carro1nome
carro1.gas = kmlGas
carro1.et = carro1Et

document.querySelector('.inputcarro').value = carro1.model
document.querySelector('.inputkmlgas').value = carro1.gas
document.querySelector('.inputkmleta').value = carro1.et

document.querySelector('.inputprecogas').value = 6
document.querySelector('.inputprecoeta').value = 4

function calcular() {
    const kmlGas = parseFloat(document.querySelector('.inputkmlgas').value);
    const kmlEta = parseFloat(document.querySelector('.inputkmleta').value);
    const precoGas = parseFloat(document.querySelector('.inputprecogas').value);
    const precoEta = parseFloat(document.querySelector('.inputprecoeta').value);
    const resultadoDiv = document.getElementById('resultado');

    if (isNaN(kmlGas) || isNaN(kmlEta) || isNaN(precoGas) || isNaN(precoEta)) {
      resultadoDiv.textContent = 'Por favor, preencha todos os campos corretamente.';
      resultadoDiv.className = 'resultado erro';
      resultadoDiv.style.display = 'block';
      return;
    }

    const custoGas = precoGas / kmlGas;
    const custoEta = precoEta / kmlEta;

    let precoG = custoEta - custoGas
    let precoE = custoGas - custoEta


    if (custoGas < custoEta) {
      resultadoDiv.textContent = 'Gasolina é mais vantajosa! ' + precoG.toFixed(2) + ' reais mais barato';
      resultadoDiv.className = 'resultado sucesso';
    } 
    
    else if (custoEta < custoGas) {
        resultadoDiv.textContent = 'Etanol é  mais vantajoso!  ' + precoE.toFixed(2) + ' reais mais barato';
        resultadoDiv.className = 'resultado sucesso';
        }
    else {
        resultadoDiv.textContent = 'Mesmo Preço! Pode escolher qualquer um!';
        resultadoDiv.className = 'resultado sucesso';

    }
    resultadoDiv.style.display = 'block';
  }
