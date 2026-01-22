# 🐄 Gerenciador de Fazenda de Gados

Sistema web para gerenciamento de gados com controle de peso, histórico e mapas interativos de pastos.

## 📁 Estrutura de Arquivos

```
Fazenda/
├── index.html          # Página principal HTML
├── style.css           # Estilos CSS
├── script.js           # Lógica JavaScript
├── fazendav3.html      # Versão legada (arquivo único)
└── README.md           # Esta documentação
```

## 🚀 Como Usar

1. **Abra o arquivo `index.html` no navegador**
   - Duplo clique no arquivo
   - Ou arraste para o navegador
   - Ou use um servidor local (recomendado para desenvolvimento)

2. **Funcionalidades Disponíveis:**
   - ✅ Cadastro de gados com foto
   - ✅ Visualização em cards
   - ✅ Histórico de peso
   - ✅ Mapa interativo de pastos
   - ✅ Atribuição de gados aos pastos
   - ✅ Armazenamento local (LocalStorage)

## 📋 Recursos

### Cadastro de Gados
- ID auto-gerado (editável)
- Raça
- Peso atual
- Idade (opcional)
- Foto (câmera ou arquivo)
- Observações

### Visualização
- Cards com informações principais
- Visualização de detalhes completos
- Edição de histórico
- Exclusão de registros

### Mapa de Pastos
- Mapa interativo (OpenStreetMap)
- Criação de pastos por polígonos
- Cores gradientes (verde claro a escuro)
- Atribuição de gados aos pastos
- Visualização de gados no mapa

## 🛠️ Tecnologias Utilizadas

- **HTML5** - Estrutura semântica
- **CSS3** - Estilos e animações
- **JavaScript ES6+** - Lógica modular
- **Leaflet.js** - Mapas interativos
- **LocalStorage** - Persistência de dados

## 🎨 Arquitetura do Código

### JavaScript (script.js)

```javascript
AppState          // Estado centralizado da aplicação
├── cattle        // Array de gados
├── pastures      // Array de pastos
└── map           // Instância do mapa

Módulos:
├── Utils              // Funções utilitárias
├── DataManager        // Gerenciamento de dados (save/load)
├── PhotoManager       // Upload e preview de fotos
├── CattleManager      // CRUD de gados
├── PastureManager     // CRUD de pastos
├── MapManager         // Renderização do mapa
└── DetailsManager     // Modais e detalhes
```

### CSS (style.css)

- Reset e globais
- Layout responsivo
- Componentes reutilizáveis
- Animações e transições
- Media queries para mobile
- Estilos de acessibilidade

## 🔒 Segurança

- ✅ Escape de HTML (prevenção XSS)
- ✅ Validação de dados
- ✅ Validação de arquivos (tipo e tamanho)
- ✅ Verificação de duplicatas

## ♿ Acessibilidade

- ✅ Atributos ARIA
- ✅ Navegação por teclado
- ✅ Textos alternativos
- ✅ Focus visible
- ✅ Suporte a prefers-reduced-motion

## 📱 Responsividade

- Desktop (1400px+)
- Tablet (768px - 1399px)
- Mobile (<768px)

## 💾 Armazenamento

Os dados são salvos automaticamente no **LocalStorage** do navegador:
- `cattle` - Lista de gados
- `pastures` - Lista de pastos

**⚠️ Importante:** Os dados são salvos localmente no navegador. Para backup:
1. Exporte os dados do LocalStorage
2. Ou copie os dados periodicamente

## 🌐 Servidor Local (Opcional)

Para desenvolvimento, você pode usar:

```bash
# Python 3
python -m http.server 8000

# Node.js (http-server)
npx http-server

# PHP
php -S localhost:8000
```

Depois acesse: `http://localhost:8000`

## 🐛 Solução de Problemas

### O mapa não carrega
- Verifique sua conexão com internet
- O Leaflet requer internet para carregar os tiles

### As fotos não aparecem
- Verifique se o arquivo é uma imagem válida
- Tamanho máximo: 5MB
- Formatos suportados: JPG, PNG, GIF, WebP

### Os dados foram perdidos
- Os dados estão no LocalStorage do navegador
- Limpar cache/cookies apaga os dados
- Use sempre o mesmo navegador

## 📝 Licença

Este projeto é de uso livre para fins educacionais e pessoais.

## 👨‍💻 Desenvolvimento

Última atualização: Janeiro 2026

---

**Dúvidas ou sugestões?** Abra uma issue ou entre em contato!
