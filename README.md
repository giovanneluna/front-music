# Front-end do Clube do Tião

Este projeto contém o front-end da aplicação Clube do Tião, desenvolvido com React, TypeScript e Material UI.

## Tecnologias Utilizadas

- React 19
- TypeScript
- Material UI 7
- Axios
- React Router DOM
- Vitest (testes unitários)
- Cypress (testes E2E)

## Instalação

Para instalar as dependências do projeto, execute:

```bash
npm install
```

## Execução

Para iniciar o servidor de desenvolvimento:

```bash
npm run dev
```

O aplicativo estará disponível em http://localhost:5173 (ou outro porta que o Vite selecionar).

## Testes

### Testes Unitários

Para executar os testes unitários:

```bash
npm test
```

Para executar os testes unitários em modo de observação:

```bash
npm run test:watch
```

Para executar os testes unitários com interface visual:

```bash
npm run test:ui
```

Para gerar relatório de cobertura de testes:

```bash
npm run test:coverage
```

#### Componentes testados

Os seguintes componentes possuem testes unitários implementados:

1. **SuggestionForm** - Testa formulário de sugestão de músicas, validação de URL do YouTube e preenchimento automático de informações.
2. **MusicCard** - Testa a renderização do card de música, interação com cliques e funcionalidades para usuários administradores.
3. **DeleteConfirmationModal** - Testa o modal de confirmação de exclusão e seus comportamentos.
4. **MusicFormModal** - Testa o formulário de adição/edição de músicas.
5. **MusicList** - Testa a exibição da lista de músicas e interações.
6. **Navegação do Router** - Testa a navegação entre as páginas da aplicação.
7. **ThemeContext** - Testa o gerenciamento de temas (light/dark) da aplicação.

#### Hooks testados

1. **usePagination** - Testa o hook de paginação que gerencia a navegação entre páginas em listas.

#### Serviços testados

Os seguintes serviços possuem testes unitários:

1. **musicService** - Testa as operações de consulta e manipulação de músicas.
2. **suggestionService** - Testa funcionalidades relacionadas às sugestões de músicas.
3. **authService** - Testa o gerenciamento de autenticação e sessões de usuário.

### Testes E2E

Para executar os testes E2E com Cypress:

```bash
npm run test:e2e
```

Para abrir a interface do Cypress:

```bash
npm run cypress:open
```

## Build

Para gerar uma build de produção:

```bash
npm run build
```

## Estrutura do Projeto

- `src/`
  - `components/` - Componentes React reutilizáveis
  - `contexts/` - Contextos React (AuthContext, ThemeContext, etc.)
  - `hooks/` - Hooks personalizados reutilizáveis
    - `usePagination` - Hook para gerenciar estado de paginação
  - `pages/` - Páginas da aplicação
  - `services/` - Serviços para comunicação com a API
  - `types/` - Definições de tipos TypeScript
  - `__tests__/` - Testes unitários

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
