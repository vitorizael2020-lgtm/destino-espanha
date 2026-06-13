# Destino Espanha — Sistema de Assessoria de Imigração

Este é o sistema completo da **Destino Espanha**, uma plataforma de assessoria de imigração premium especializada em auxiliar famílias brasileiras na transição segura e documentada para a Espanha.

A aplicação conta com uma landing page institucional premium, painéis administrativos dedicados, portais para os clientes acompanharem seus vistos e uma arquitetura híbrida de banco de dados e geração de documentos automatizada.

---

## 📂 Estrutura de Pastas e Componentes

```text
Assessoria/
├── admin/                     # Painel Administrativo (Gestão de Clientes e IA)
│   ├── admin.js               # Lógica administrativa (Firestore, Prompts de IA, PDF)
│   ├── cliente-detalhe.html   # Questionário de Diagnóstico de 15 campos e Prompt
│   ├── dashboard.html         # Lista de clientes ativos e controle geral
│   └── gerar-pdf.html         # Tela de preview e compilação de documentos PDF
│
├── cliente/                   # Portal do Cliente (Área do Assessorado)
│   ├── cliente.js             # Lógica do painel do cliente (Checklist e Contratos)
│   ├── painel.html            # Dashboard principal do cliente com progresso
│   ├── documentos.html        # Checklist de documentos (Autogestão vs Validação)
│   ├── contratos.html         # Visualização e assinatura de contratos
│   └── servicos.html          # Gerenciamento de serviços adicionais contratados
│
├── shared/                    # Bibliotecas e Configurações Compartilhadas
│   ├── auth.js                # Autenticação central, logins e redirecionamentos
│   ├── pdf-templates.js       # Motor de renderização de PDFs Premium (PDFMake)
│   └── supabase-config.js     # Estrutura inicial para migração futura de banco
│
├── css/                       # Estilos modulares e secundários
├── style.css                  # Estilo visual premium principal (Vanilla CSS)
├── index.html                 # Landing page premium (Carrossel, Timeline, Serviços)
├── script.js                  # Efeitos de UI (Partículas, Lenis, Tilt 3D, Carrossel)
├── server.js                  # Servidor HTTP local simples em Node.js
├── google-apps-script-tasks.js # Automação Google Calendar -> Google Tasks
├── checklist_documentos_brasil.md # Manual prático de preparação de documentos
└── roteiros_redes_sociais.md   # Kit de redes sociais e marketing para assessoria
```

---

## 🛠️ Arquitetura Técnica e Recursos

### 1. Banco de Dados Flexível (Híbrido/Mock)
A aplicação foi projetada com flexibilidade de persistência de dados. Em `shared/auth.js` e `admin/admin.js`, o sistema monitora a configuração de chaves do banco de dados:
* **Modo Mock (LocalStorage):** Ativado por padrão (quando a chave de API em `shared/firebase-config.js` está como `"SUA_API_KEY_AQUI"`). Este modo popula automaticamente um banco de dados local no navegador do usuário para permitir testes e simulações imediatas de logins, uploads, marcação de checklists e geração de contratos sem necessidade de internet ou contas na nuvem.
* **Modo Produção (Supabase/Firestore):** Estruturas preparadas para transição direta, permitindo salvar dados na nuvem integrando tokens de autenticação reais.

### 2. Autenticação e Regras (`shared/auth.js`)
Centraliza o controle de acessos, direcionando os usuários para suas respectivas áreas de trabalho com base em suas permissões:
* **Administradores (`role: "admin"`):** São redirecionados para `/admin/dashboard.html` e possuem acesso total aos perfis de todos os clientes, questionários de diagnósticos, geração de prompts de IA e emissão de PDFs.
* **Clientes (`role: "client"`):** Redirecionados para `/cliente/painel.html` para consultar o progresso de sua assessoria.

### 3. Motor de PDFs Premium (`shared/pdf-templates.js`)
O sistema integra a biblioteca **PDFMake** para compilar dados do cliente diretamente do banco de dados para documentos PDF sofisticados no navegador. O motor suporta:
* **Proposta Comercial:** Detalhes de serviços contratados e formas de pagamento.
* **Contrato de Assessoria:** Cláusulas de rescisão, foro de Madri (B2B Abogados), taxas de citas e retenção de 50% em caso de desistência após início.
* **Plano de Ação e Diagnóstico:** Exibe um sumário de perfil do cliente em duas colunas e traduz marcações simples em Markdown da resposta de IA em títulos, listas e negritos perfeitamente formatados.
* **Recibo:** Emissão de faturas com marcação de "PAGO" e detalhes de transações.
* **Guia de Preparação de Documentos:** Checklists impressos customizados por área profissional (Medicina, Enfermagem, Soldador, Motorista, Geral).

### 4. Diagnóstico Familiar Avançado e IA (`admin/cliente-detalhe.html`)
O administrador dispõe de um questionário estruturado de **15 campos de diagnóstico** (incluindo renda remota, composição familiar, objetivos de imigração, reservas financeiras, preferências climáticas/geográficas e CNH). 
* O sistema compila esses dados em tempo real e gera um **Prompt Especializado** para Inteligência Artificial (Gemini/DeepSeek).
* O prompt realiza cálculos automáticos de IPREM (indicador financeiro espanhol) com base no número de dependentes e compara cidades do Brasil com a Espanha.
* O relatório rico gerado pela IA pode ser colado em formato Markdown e salvo no perfil do cliente, servindo de base para o plano de ação exportável em PDF.

### 5. Portal do Cliente Inteligente e Autogestão (`cliente/`)
O portal do cliente adapta sua interface com base no plano contratado:
* **Plano Completo:** Exibe botões de upload e fluxos de validação de documentos pela assessoria.
* **Plano Básico (Diagnóstico):** Exibe um banner informando que o checklist é para **autogestão**. Substitui os botões de upload por checkboxes interativos que salvam o status localmente no banco, permitindo ao cliente organizar a própria documentação e ver o progresso da barra de tarefas em tempo real.

### 6. Carrossel de Depoimentos Premium e Timeline (`index.html`)
A seção "Resultados Reais" da landing page possui:
* Um carrossel contendo 8 depoimentos realistas (a maioria de 2026), estilizado com gradiente translúcido lateral (*fade-out*), autoplay inteligente de 5 segundos que pausa no hover, e suporte a toque (scroll-snap) no celular e arraste com mouse no desktop.
* Uma timeline histórica corrigida para precisão de datas (chegada em Portugal em 2019, regularização via SEF em 2021 e mudança para a Espanha em 2023).

---

## ⚡ Automações e Scripts Adicionais

### 1. Servidor Local (`server.js`)
Script Node.js simples criado para servir a aplicação localmente. Ele resolve automaticamente caminhos com acentos em sua URL (ex: pastas chamadas "Área de Trabalho"), definindo os cabeçalhos MIME corretos para arquivos CSS, JS, HTML e PDFs.

### 2. Automação de Leads (`google-apps-script-tasks.js`)
Código em JavaScript desenvolvido para ser executado no **Google Apps Script**. 
* Ele monitora a agenda do Google Calendar à procura de novas consultas agendadas por clientes.
* Quando encontra, extrai automaticamente informações cruciais (como data, hora, link do Google Meet e descrição do agendamento) e cria uma tarefa formatada correspondente no **Google Tasks** (dentro da lista *"1. Leads - Destino Espanha"*), ajudando a centralizar a captação de clientes.

---

## 🚀 Como Executar e Testar Localmente

### 1. Iniciar o Servidor
Certifique-se de que possui o Node.js instalado e execute na raiz do projeto:
```bash
node server.js
```
A aplicação estará acessível em: `http://localhost:8080`

*Alternativamente, você pode usar o http-server:*
```bash
npx http-server -p 8080
```

### 2. Credenciais de Teste (Modo Mock DB)
Para logar nos painéis administrativos e do cliente sem precisar configurar bancos de dados reais, utilize os dados cadastrados por padrão no LocalStorage:

* **Painel Administrativo:**
  * **Login:** `admin@email.com`
  * **Senha:** `admin`
* **Portal do Cliente:**
  * **Login:** `cliente@email.com`
  * **Senha:** `cliente`

---

## 🌐 Deploy em Produção

O projeto é hospedado e deploiado de forma contínua através do **Netlify**. Para enviar novas atualizações de layout ou código, utilize a CLI do Netlify no diretório do projeto:
```bash
npx netlify deploy --prod --dir=.
```
