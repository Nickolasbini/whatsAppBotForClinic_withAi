# 🏥 WhatsApp Bot para Clínica com IA - Node.js + Baileys + OpenRouter

Bot de atendimento automático para WhatsApp com **menu interativo**, **fluxo de agendamento de consultas** e **assistente de IA** integrada via OpenRouter. Desenvolvido com Node.js e a biblioteca Baileys.

> 📺 Tutorial completo: [Como Criar um Bot de WhatsApp com IA para Qualquer Negócio Local (Do Zero em 2026)](https://github.com/Nickolasbini/whatsAppBotForClinic_withAi)

---

## ✨ Funcionalidades

- ✅ Menu interativo com 4 opções
- 📋 Fluxo completo de agendamento de consultas (especialidade → nome → data → horário)
- 🤖 Modo IA - responde perguntas livres usando OpenRouter (modelos gratuitos)
- 🔒 Whitelist de contatos autorizados (`ALLOWED_SENDERS`)
- 🔄 Reconexão automática em caso de queda
- 💬 Efeito visual de "Digitando..." antes da resposta da IA
- 🧹 Terminal limpo, sem logs internos do Baileys

---

## 🛠️ Tecnologias

| Tecnologia | Descrição |
|---|---|
| [Node.js](https://nodejs.org/) | Runtime JavaScript |
| [@whiskeysockets/baileys](https://github.com/WhiskeySockets/Baileys) | Biblioteca WhatsApp Web |
| [OpenRouter](https://openrouter.ai/) | Acesso a modelos de IA gratuitos |
| [pino](https://getpino.io/) | Logger silencioso |
| [qrcode-terminal](https://www.npmjs.com/package/qrcode-terminal) | QR Code no terminal |
| [node-fetch](https://www.npmjs.com/package/node-fetch) | Requisições HTTP |

---

## 📁 Estrutura do Projeto

```
whatsAppBotForClinic_withAi/
│
├── main.js              # Arquivo principal — toda a lógica do bot
├── sessao_whatsapp/     # Gerada automaticamente após autenticação
├── package.json
└── README.md
```

---

## ⚙️ Configuração

Abra o `main.js` e edite o bloco de configurações no topo do arquivo:

```js
const NOME_CLINICA    = 'Clínica Saúde Plena';       // Nome do seu negócio
const TELEFONE        = '(41) 99999-9999';             // Telefone de contato
const ENDERECO        = 'Rua das Flores, 123 — Centro'; // Endereço
const HORARIO         = 'Seg a Sex das 08h às 18h | Sáb das 08h às 12h';
const OPENROUTER_KEY  = 'sua_chave_aqui';              // Chave da API OpenRouter
const ALLOWED_SENDERS = ['numero@lid'];                // Números autorizados a usar o bot
```

> ⚠️ **Nunca suba sua `OPENROUTER_KEY` para o GitHub.** Use um arquivo `.env` com a biblioteca `dotenv` em produção.

---

## 🚀 Instalação e Execução

### 1. Clone o repositório

```bash
git clone https://github.com/Nickolasbini/whatsAppBotForClinic_withAi
cd whatsAppBotForClinic_withAi
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Execute o bot

```bash
node main.js
```

### 4. Escaneie o QR Code

O QR Code aparecerá no terminal. Escaneie com o WhatsApp em **Dispositivos Conectados → Conectar dispositivo**.

---

## 🔑 Como obter a chave do OpenRouter

1. Acesse [openrouter.ai](https://openrouter.ai/)
2. Crie uma conta gratuita
3. Vá em **Keys** → **Create Key**
4. Copie a chave e cole em `OPENROUTER_KEY`

> O modelo usado no projeto é `baidu/cobuddy:free` — gratuito e sem necessidade de créditos.

---

## 💬 Fluxo de Conversa

```
Usuário envia qualquer mensagem
        ↓
    [MENU PRINCIPAL]
    1 — Agendar consulta
    2 — Especialidades
    3 — Horários e endereço
    4 — Falar com assistente IA
        ↓
[1] Agendamento:
    Especialidade → Nome → Data → Horário → Confirmação ✅

[2] Lista de especialidades disponíveis

[3] Endereço, telefone e horário de funcionamento

[4] Modo IA: responde perguntas livres sobre a clínica
    (digitar "menu" encerra o modo IA)
```

---

## 🔒 Whitelist de Contatos

Por padrão, apenas números listados em `ALLOWED_SENDERS` podem usar o bot. Para liberar um número, adicione o JID dele:

```js
const ALLOWED_SENDERS = [
  '5541999999999@s.whatsapp.net',
  '5511988888888@s.whatsapp.net',
];
```

> Para descobrir o JID de um número, adicione um `console.log(msg.key.remoteJid)` dentro do evento `messages.upsert`.

---

## 📦 package.json sugerido

```json
{
  "name": "whatsapp-bot-clinica",
  "version": "1.0.0",
  "main": "main.js",
  "dependencies": {
    "@whiskeysockets/baileys": "^6.7.0",
    "node-fetch": "^2.7.0",
    "pino": "^8.0.0",
    "qrcode-terminal": "^0.12.0"
  }
}
```

---

## 📺 Vídeos Relacionados

- [WhatsApp Bot Profissional 2026: Estrutura Anti-Ban com Baileys e Node.js](https://youtu.be/JkvbnQg2OWE)
- [Chatbot de WhatsApp com IA (OpenRouter + Venom) – 100% Grátis](https://youtu.be/_54Q-CXCns0)
- [Como Criar um BOT para WhatsApp com Node.js (Menu + Atendimento Humano)](https://youtu.be/yLvagYwq7Ac)
- [Bot do WhatsApp não conecta? Resolva o erro de QR Code em minutos!]([https://youtu.be/...](https://youtu.be/I89HRsriFFA)

---

## 🏢 Agência

Precisa de uma solução personalizada de automação para sua empresa?

👉 [Cervo Digital](https://cervodigital.com.br/) — Desenvolvimento e automação para negócios reais.

---

## 📄 Licença

MIT — use, modifique e distribua à vontade.
