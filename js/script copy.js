function selecionarProjeto(nomeProjeto) {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `<h1>${nomeProjeto}</h1><p>Conteúdo do projeto \"${nomeProjeto}\" será exibido aqui.</p>`;
  }
  