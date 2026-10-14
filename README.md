# Tá na Mão 🛠️

> Plataforma tecnológica que conecta clientes a profissionais e prestadores de serviços com geolocalização e praticidade.

**Deploy oficial:** [https://ta-na-mao-vikleve.vercel.app](https://ta-na-mao-vikleve.vercel.app/)  
**Repositório:** [vikleve/Ta-Na-Mao](https://github.com/vikleve/Ta-Na-Mao)

---

## 🚀 Principais Melhorias Implementadas

1. **Atualização da Identidade Visual (#FF7900)**:
   - Substituição de todas as ocorrências da cor amarela antiga pelo laranja oficial **#FF7900**.
   - Hover ligeiramente mais escuro (**#E06900**) e foco acessível (**#CC5F00**).
   - Contraste verificado conforme diretrizes WCAG AA (superior a 6.9:1 com texto escuro nos botões).
   - Centralização de cores em variáveis CSS (`--brand-primary`, `--brand-primary-hover`).

2. **Layout Totalmente Responsivo**:
   - Abordagem Mobile-First, sem rolagem horizontal indesejada (`overflow-x: hidden`).
   - Cobertura completa testada para larguras de **320px**, **375px**, **430px**, **768px**, **1024px** e **1440px**.
   - Botões touch-friendly (área mínima de toque de 42-44px).
   - Barra de pesquisa flexível e barra de categorias com rolagem suave em dispositivos móveis.
   - Modais e gavetas adaptáveis para 100% da largura em celulares.

3. **Remoção de Contas Falsas e Dados de Teste**:
   - Remoção de todos os 12 profissionais fictícios, avaliações inventadas e pedidos simulados.
   - Remoção do usuário demo padrão no login e dos valores pré-preenchidos nos formulários.
   - Implementação de **Empty States (Estados Vazios)** acolhedores que orientam novos usuários a se cadastrarem.

4. **Cadastro de Profissões e Especialidades Personalizadas**:
   - Campo para cadastro de nova profissão via opção *"➕ Outra profissão..."*.
   - Validação e normalização de textos (Title Case, trim, remoção de espaços duplos).
   - Deduplicação insensível a maiúsculas/minúsculas.
   - Disponibilização imediata da nova profissão nos filtros, buscas e cards.

5. **Banco de Dados Real (Supabase / PostgreSQL)**:
   - Esquema relacional estruturado com tabelas `profiles`, `professions`, `professionals`, `quotes`, `reviews` e `chat_messages`.
   - **Row Level Security (RLS)** habilitado em todas as tabelas públicas.
   - Triggers para recálculo automático de notas e avaliações.
   - Camada centralizada de acesso a dados em [`js/db.js`](./js/db.js).
   - Guia de deploy e configuração na Vercel em [`VERCEL_SETUP.md`](./VERCEL_SETUP.md).

---

## 📂 Estrutura do Projeto

```
Ta-Na-Mao/
├── api/
│   └── health.js            # Serverless Health Check para a Vercel
├── assets/
│   ├── logo_tanamao.svg     # Logotipo oficial Tá na Mão em SVG (#FF7900)
│   ├── hero_bg_decor.svg    # Elementos visuais de fundo em SVG
│   └── curve_underline.svg  # Sublinhado curvo em SVG
├── css/
│   └── styles.css           # Estilos globais, variáveis CSS e responsividade
├── js/
│   ├── db.js                # Camada central de dados (Supabase & Persistência)
│   ├── data.js              # Repositório de dados e sincronização
│   ├── auth.js              # Serviço de sessão e autenticação de usuários
│   ├── geo.js               # Cálculo de distâncias Haversine e mapa Leaflet
│   └── app.js               # Controlador da interface e eventos
├── .env.example             # Exemplo de variáveis de ambiente
├── index.html               # Aplicação principal
├── supabase_schema.sql      # Script DDL de criação do banco PostgreSQL com RLS
├── test_suite.py            # Suíte de testes automatizados em código
└── VERCEL_SETUP.md          # Manual de configuração para a Vercel
```

---

## 🧪 Como Executar os Testes em Código

Para rodar a suíte de testes automatizados completa (sem necessidade de abrir o navegador):

```bash
uv run python test_suite.py
```

Todos os 20 testes verificam conformidade de cores, media queries, integridade do banco e ausência de dados fictícios.
