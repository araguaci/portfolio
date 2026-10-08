# 📋 Procedimento Operacional: Como Cadastrar e Gerenciar Projetos no Acervo

> **Guia Oficial de Cadastro e Curadoria**  
> _Procedimento passo a passo para inclusão, edição e desativação de projetos no Portfolio Artes do Sul._

---

## 🧭 Visão Geral

Todo o acervo de projetos exibido no portfólio é alimentado de forma centralizada por um único arquivo JSON estático:
📁 **`public/projetos-online.json`**

Ao adicionar, editar ou remover um item neste arquivo, o sistema do portfólio atualiza automaticamente:

1. **O Growth Tracker:** Ajusta o total de projetos e recalcula a meta percentual de exploração.
2. **Os Filtros por Categoria:** Cria novas pílulas de filtro ou atualiza a contagem das tags existentes.
3. **A Busca Instantânea:** Indexa o título, descrição e tags para consultas reativas sem recarregar a tela.
4. **Os Cards Interativos:** Configura os botões de favoritar (★), cópia de link direto e atalho de visita com persistência local.

---

## 🛠️ Passo a Passo para Inclusão de um Novo Projeto

### Passo 1: Abrir o Arquivo de Projetos

Abra no seu editor o arquivo:

```
public/projetos-online.json
```

### Passo 2: Adicionar o Bloco do Projeto

No array `"projetos"`, adicione um novo objeto com a estrutura abaixo (recomenda-se adicionar no topo do array para aparecer como destaque):

```json
{
	"titulo": "Nome Oficial do Projeto",
	"descricao": "Descrição concisa de 1 a 2 linhas explicando a proposta de valor, público-alvo ou tecnologias chave.",
	"tags": ["Astro", "Tailwind", "PWA", "E-commerce"],
	"url": "https://meuprojeto.com.br",
	"thumbnail": "/assets/img/projects/nome-do-projeto.webp",
	"origem": "producao",
	"draft": false
}
```

---

## 📖 Dicionário de Campos (Schema)

| Campo           | Tipo       | Obrigatório? | Descrição e Boas Práticas                                                                                                       |
| --------------- | ---------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| **`titulo`**    | `string`   | **Sim**      | Nome público da aplicação ou cliente. Evite títulos excessivamente longos.                                                      |
| **`descricao`** | `string`   | **Sim**      | Texto objetivo que será lido no card e utilizado como índice pelo motor de busca.                                               |
| **`tags`**      | `string[]` | **Sim**      | Lista de tags e categorias. Tags repetidas em 2 ou mais projetos tornam-se filtros clicáveis no topo do acervo.                 |
| **`url`**       | `string`   | **Sim**      | URL de produção acessível (sempre iniciando com `https://`).                                                                    |
| **`thumbnail`** | `string`   | Não          | Caminho relativo da imagem de capa. Se ausente ou não encontrado, o card exibirá um preview automático elegante com ícone tech. |
| **`origem`**    | `string`   | Não          | Identificador de proveniência (ex.: `"producao"`, `"lab"`, `"open-source"`).                                                    |
| **`draft`**     | `boolean`  | Não          | Se definido como `true`, o projeto é ignorado na compilação e não aparece para o público. Útil para projetos em staging.        |

---

## 🖼️ Diretrizes para Imagens de Capa (Thumbnails)

Para manter a estética cirúrgica e o carregamento ultra-rápido do portfólio:

1. **Formato:** Salve preferencialmente em **`.webp`** (ou `.jpg`/`.png` otimizado).
2. **Dimensões recomendadas:**
   - Resolução: **800 × 450 px** (proporção 16:9) ou **600 × 350 px**.
   - Peso do arquivo: Abaixo de **80 kB**.
3. **Localização do arquivo:**
   ```
   public/assets/img/projects/nome-do-projeto.webp
   ```
4. **Referência no JSON:**
   ```json
   "thumbnail": "/assets/img/projects/nome-do-projeto.webp"
   ```

> [!TIP]
> Caso você não tenha uma imagem no momento do cadastro, deixe `"thumbnail": ""` ou omita o campo. O componente `PortfolioCard` gerará um thumbnail padrão dark com o nome e ícone do projeto sem quebrar o layout.

---

## 🏷️ Como Funcionam as Tags e Categorias

- O sistema analisa todas as tags de todos os projetos cadastrados.
- **Categorias Automáticas:** Qualquer tag que apareça em **2 ou mais projetos** vira automaticamente um botão de filtro (_chip_) na barra de navegação do acervo com a contagem entre parênteses (ex.: `E-commerce (4)`).
- **Padronização:** Use termos consistentes em minúsculas ou capitalizados uniformemente (ex.: prefira sempre `PWA` ou sempre `pwa`).

---

## 📝 Passo 3 (Opcional): Artigo ou Estudo de Caso no Diário

Se o projeto merecer um post detalhado de arquitetura ou lições aprendidas no blog:

1. Crie um arquivo markdown em `src/content/blog/`:
   ```
   src/content/blog/YYYY-MM-DD-nome-do-projeto.md
   ```
2. Configure o cabeçalho (frontmatter):
   ```yaml
   ---
   title: 'Como Construímos o Projeto X com Astro e Edge Computing'
   description: 'Bastidores técnicos e desafios superados no desenvolvimento.'
   pubDate: 'Oct 07 2026'
   category: 'Engenharia'
   tags: ['Astro', 'PWA', 'Case Study']
   heroImage: '/assets/img/projects/nome-do-projeto.webp'
   ---
   Conteúdo do estudo de caso...
   ```

---

## ✅ Checklist de Validação Pré-Deploy

Após cadastrar o projeto:

- [ ] A URL possui protocolo completo (`https://...`) e está acessível.
- [ ] A imagem foi salva em `public/assets/img/projects/` e o caminho confere.
- [ ] As tags estão grafadas corretamente e sem erros de digitação.
- [ ] O campo `draft` está como `false` (ou omitido).
- [ ] O comando de validação local funciona sem erros:
  ```bash
  pnpm dev
  ```
- [ ] O projeto aparece na busca e o botão de copiar link funciona.
