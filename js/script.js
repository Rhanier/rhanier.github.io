  function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
  
    sidebar.classList.toggle('hidden');
  
    if (menuToggle) {
      if (sidebar.classList.contains('hidden')) {
        menuToggle.style.transform = 'rotate(0deg)';
      } else {
        menuToggle.style.transform = 'rotate(90deg)';
      }
    }
  }
  
  function carregarProjeto(url) {
    const iframe = document.getElementById('projeto-frame');
    const placeholder = document.getElementById('placeholder-text');
  
    iframe.src = url;
    iframe.style.display = 'block';
    placeholder.style.display = 'none';
    sidebar.classList.add('hidden');

  }
  
  function selecionarProjeto(nomeProjeto) {
    // Essa função ainda existe para caso você queira usar também,
    // mas para carregar páginas o ideal agora é usar `carregarProjeto(url)`.
  }
  
  function toggleFolder(element) {
    const content = element.nextElementSibling;
    element.classList.toggle('open');
    if (content.style.display === "block") {
      content.style.display = "none";
    } else {
      content.style.display = "block";
    }
  }

  function voltarInicio() {
    const iframe = document.getElementById('projeto-frame');
    const placeholder = document.getElementById('placeholder-text');
    iframe.src = "";
    iframe.style.display = "none";
    placeholder.style.display = "block";
  }

  function novoProjeto() {
    const nomeProjeto = prompt("Digite o nome do novo projeto:");
    if (nomeProjeto) {
      const novoItem = document.createElement('div');
      novoItem.className = 'project-item';
      novoItem.innerText = nomeProjeto;
      novoItem.onclick = function() {
        alert('Página para "' + nomeProjeto + '" ainda não criada.');
      };
      document.querySelector('.project-list').appendChild(novoItem);
    }
  }