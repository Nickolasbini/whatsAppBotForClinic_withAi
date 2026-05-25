const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  Browsers,
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const fetch = require('node-fetch');

// ============================================================
// ⚙️ CONFIGURAÇÕES E TEXTOS (Tudo centralizado para facilitar)
// ============================================================
const NOME_CLINICA   = 'Clínica Saúde Plena';
const TELEFONE       = '(41) 99999-9999';
const ENDERECO       = 'Rua das Flores, 123 — Centro';
const HORARIO        = 'Seg a Sex das 08h às 18h | Sáb das 08h às 12h';
const OPENROUTER_KEY = ''; 
const ALLOWED_SENDERS = [''];

const MENU = `🏥 *${NOME_CLINICA}*
Olá! Como posso te ajudar? 😊

1️⃣ — Agendar consulta
2️⃣ — Especialidades
3️⃣ — Horários e endereço
4️⃣ — Falar com assistente IA

_Digite o número da opção._`;

// OPÇÃO 2
const ESPECIALIDADES = `🩺 *Especialidades*
• Clínica Geral
• Cardiologia
• Dermatologia
• Ortopedia
• Pediatria

Digite *menu* para voltar.`;

// OPÇÃO 3
const HORARIOS = `🕐 *${HORARIO}*
📍 ${ENDERECO}
📞 ${TELEFONE}

Digite *menu* para voltar.`;

// Armazena o estado da conversa de cada usuário
const sessoes = {};

// ============================================================
// 🤖 CONEXÃO COM A INTELIGÊNCIA ARTIFICIAL
// ============================================================
async function perguntarIA(mensagemUser) {
  try {
    const resposta = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/CodigoPraticoOficial',
        'X-Title': 'BotClinica',
      },
      body: JSON.stringify({
        model: 'baidu/cobuddy:free',
        messages: [
          {
            role: 'system',
            content: `Você é a assistente virtual da ${NOME_CLINICA}. Responda de forma simpática e breve (máximo 3 linhas) em português. Horário: ${HORARIO}. Endereço: ${ENDERECO}. Se perguntarem sobre agendamento, oriente a digitar "menu".`,
          },
          { role: 'user', content: mensagemUser },
        ],
      }),
    });

    const data = await resposta.json();
    return data.choices[0].message.content;
  } catch (erro) {
    return `Desculpe, tive um problema com meu cérebro de IA. Digite *menu* para usar as opções padrão.`;
  }
}


// ============================================================
// 📨 MÁQUINA DE ESTADOS (O Fluxo de mensagens)
// ============================================================
async function processarMensagem(sock, msg) {
  const numero = msg.key.remoteJid;
  
  // Captura o texto enviado pelo usuário de forma segura
  const texto = (msg.message?.conversation || msg.message?.extendedTextMessage?.text || '').trim().toLowerCase();
  if (!texto) return;

  // Comando mestre para resetar o fluxo a qualquer momento
  if (texto === 'menu' || texto === 'oi' || texto === 'olá') {
    sessoes[numero] = { etapa: 'menu' };
    await sock.sendMessage(numero, { text: MENU });
    return;
  }

  // Se o usuário iniciou agora e não tem sessão, cria uma e manda o menu
  if (!sessoes[numero]) {
    sessoes[numero] = { etapa: 'menu' };
    await sock.sendMessage(numero, { text: MENU });
    return;
  }

  const sessao = sessoes[numero];

  // ETAPA: MENU PRINCIPAL
  if (sessao.etapa === 'menu') {
    if (texto === '1') {
      sessoes[numero] = { etapa: 'escolher_especialidade' };
      await sock.sendMessage(numero, {
        text: `📋 *Agendamento*\nQual especialidade desejada?\n\n1️⃣ Clínica Geral\n2️⃣ Cardiologia\n3️⃣ Dermatologia\n4️⃣ Ortopedia\n5️⃣ Pediatria`,
      });
    } else if (texto === '2') {
      await sock.sendMessage(numero, { text: ESPECIALIDADES });
    } else if (texto === '3') {
      await sock.sendMessage(numero, { text: HORARIOS });
    } else if (texto === '4') {
      sessoes[numero] = { etapa: 'ia' };
      await sock.sendMessage(numero, { text: '🤖 *Modo IA Ativado!*\nPode fazer sua pergunta sobre nossa clínica. \n\n_Para sair, digite *menu*._' });
    } else {
      await sock.sendMessage(numero, { text: '❌ Opção inválida. Digite de 1 a 4, ou *menu*.' });
    }
    return;
  }

  // ETAPA: SELEÇÃO DE ESPECILIDADE DO AGENDAMENTO
  if (sessao.etapa === 'escolher_especialidade') {
    const lista = { '1': 'Clínica Geral', '2': 'Cardiologia', '3': 'Dermatologia', '4': 'Ortopedia', '5': 'Pediatria' };
    if (!lista[texto]) {
      await sock.sendMessage(numero, { text: '⚠️ Por favor, escolha um número válido de 1 a 5.' });
      return;
    }
    sessoes[numero] = { etapa: 'nome', especialidade: lista[texto] };
    await sock.sendMessage(numero, { text: '✍️ Perfeito! Agora digite seu *nome completo*:' });
    return;
  }

  // ETAPA: CAPTURAR NOME
  if (sessao.etapa === 'nome') {
    sessoes[numero] = { ...sessao, etapa: 'data', nome: texto };
    await sock.sendMessage(numero, { text: '📅 Qual a *data* desejada para a consulta?\n_(Exemplo: 25/06/2026)_' });
    return;
  }

  // ETAPA: CAPTURAR DATA
  if (sessao.etapa === 'data') {
    sessoes[numero] = { ...sessao, etapa: 'hora', data: texto };
    await sock.sendMessage(numero, { text: '🕐 Qual o *horário* de preferência?\n_(Exemplo: 14:00)_' });
    return;
  }

  // ETAPA: CAPTURAR HORÁRIO E FINALIZAR AGENDAMENTO
  if (sessao.etapa === 'hora') {
    const resumoConsulta = `✅ *Consulta Agendada com Sucesso!*

👤 Paciente: ${sessao.nome.toUpperCase()}
🩺 Especialidade: ${sessao.especialidade}
📅 Data: ${sessao.data}
🕐 Horário: ${texto}
📍 Local: ${ENDERECO}

_Por favor, chegue com 15 minutos de antecedência._
Digite *menu* para voltar ao início.`;

    sessoes[numero] = { etapa: 'menu' }; // Reseta o estado do cliente
    await sock.sendMessage(numero, { text: resumoConsulta });
    return;
  }

  // ETAPA: CONVERSA COM A INTELIGÊNCIA ARTIFICIAL
  if (sessao.etapa === 'ia') {
    await sock.sendPresenceUpdate('composing', numero); // Efeito visual de "Digitando..."
    const respostaIA = await perguntarIA(texto);
    await sock.sendMessage(numero, { text: respostaIA });
    return;
  }
}


// ============================================================
// 🔌 INFRAESTRUTURA DE INICIALIZAÇÃO DO BOT
// ============================================================
async function iniciarBot() {
  const { state, saveCreds } = await useMultiFileAuthState('sessao_whatsapp');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    logger: pino({ level: 'silent' }), // Deixa o terminal limpo sem logs internos do Baileys
    browser: Browsers.ubuntu('Chrome'),
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async ({ connection, qr }) => {
    if (qr) {
      console.clear();
      console.log('📱 ESCANEIE O QR CODE ABAIXO PARA CONECTAR:\n');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      console.log('🔄 Conexão perdida. Tentando reconectar em 5 segundos...');
      setTimeout(iniciarBot, 5000);
    }

    if (connection === 'open') {
      console.clear();
      console.log('✅ O BOT ESTÁ ONLINE E PRONTO PARA USAR!');
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    const msg = messages[0];
    if (
      msg.key.fromMe ||
      msg.key.remoteJid.endsWith('@g.us') ||
      !ALLOWED_SENDERS.includes(msg.key.remoteJid)
    ) {
      return;
    }

    await processarMensagem(sock, msg);
  });
}

iniciarBot();