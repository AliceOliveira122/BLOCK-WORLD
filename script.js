
'use strict';

/* ==========================================
   JOGO DA FORCA - SISTEMA PRINCIPAL
========================================== */

const words = {
  animals: {
    easy: [
      { word: 'GATO', hint: 'Animal doméstico que gosta de dormir.' },
      { word: 'PATO', hint: 'Ave que gosta de nadar.' },
      { word: 'LEAO', hint: 'Conhecido como o rei da selva.' },
      { word: 'RATO', hint: 'Pequeno roedor.' },
      { word: 'URSO', hint: 'Animal grande que pode hibernar.' }
    ],
    medium: [
      { word: 'GIRAFA', hint: 'Animal de pescoço muito comprido.' },
      { word: 'COELHO', hint: 'Animal conhecido pelas orelhas compridas.' },
      { word: 'TARTARUGA', hint: 'Animal que possui um casco.' },
      { word: 'GOLFINHO', hint: 'Mamífero que vive no mar.' }
    ],
    hard: [
      { word: 'ORNITORRINCO', hint: 'Mamífero que põe ovos e possui bico.' },
      { word: 'CAMALEAO', hint: 'Réptil que pode mudar de cor.' },
      { word: 'HIPOPOTAMO', hint: 'Grande mamífero que vive próximo à água.' },
      { word: 'CHIMPANZE', hint: 'Primata muito inteligente.' }
    ]
  },

  science: {
    easy: [
      { word: 'AGUA', hint: 'Substância essencial para a vida.' },
      { word: 'ATOMO', hint: 'Unidade básica da matéria.' },
      { word: 'LUZ', hint: 'Permite enxergar os objetos.' },
      { word: 'AR', hint: 'Mistura de gases que respiramos.' }
    ],
    medium: [
      { word: 'CELULA', hint: 'Unidade básica dos seres vivos.' },
      { word: 'PLANETA', hint: 'Corpo celeste que orbita uma estrela.' },
      { word: 'OXIGENIO', hint: 'Elemento químico importante para a respiração.' },
      { word: 'MOLECULA', hint: 'Conjunto de átomos ligados.' }
    ],
    hard: [
      { word: 'FOTOSSINTESE', hint: 'Processo pelo qual plantas produzem seu alimento.' },
      { word: 'GRAVIDADE', hint: 'Força que atrai os corpos.' },
      { word: 'ELETRON', hint: 'Partícula de carga elétrica negativa.' },
      { word: 'EVAPORACAO', hint: 'Passagem do estado líquido para o gasoso.' }
    ]
  },

  geography: {
    easy: [
      { word: 'BRASIL', hint: 'País onde vivemos.' },
      { word: 'MAPA', hint: 'Representação de um espaço geográfico.' },
      { word: 'RIO', hint: 'Curso natural de água.' },
      { word: 'ILHA', hint: 'Porção de terra cercada por água.' }
    ],
    medium: [
      { word: 'CONTINENTE', hint: 'Grande extensão de terras emersas.' },
      { word: 'OCEANO', hint: 'Grande massa de água salgada.' },
      { word: 'EQUADOR', hint: 'Linha imaginária que divide a Terra em dois hemisférios.' },
      { word: 'CAPITAL', hint: 'Cidade onde geralmente fica o governo de um país.' }
    ],
    hard: [
      { word: 'ARQUIPÉLAGO', hint: 'Conjunto de ilhas.' },
      { word: 'HEMISFERIO', hint: 'Metade de uma esfera, como a Terra.' },
      { word: 'CORDILHEIRA', hint: 'Conjunto de montanhas.' },
      { word: 'MERIDIANO', hint: 'Linha imaginária usada para medir longitudes.' }
    ]
  },

  technology: {
    easy: [
      { word: 'MOUSE', hint: 'Acessório usado para controlar o cursor.' },
      { word: 'TELA', hint: 'Parte do computador onde aparecem as imagens.' },
      { word: 'SITE', hint: 'Página ou conjunto de páginas na internet.' },
      { word: 'DADO', hint: 'Informação que pode ser armazenada.' }
    ],
    medium: [
      { word: 'INTERNET', hint: 'Rede mundial de computadores.' },
      { word: 'TECLADO', hint: 'Dispositivo usado para digitar.' },
      { word: 'ROBOTICA', hint: 'Área que estuda e desenvolve robôs.' },
      { word: 'SENHA', hint: 'Código usado para proteger uma conta.' }
    ],
    hard: [
      { word: 'ALGORITMO', hint: 'Sequência de instruções para resolver um problema.' },
      { word: 'PROCESSADOR', hint: 'Componente responsável por executar instruções.' },
      { word: 'PROGRAMACAO', hint: 'Criação de instruções para computadores.' },
      { word: 'CIBERSEGURANCA', hint: 'Proteção de sistemas e dados digitais.' }
    ]
  },

  food: {
    easy: [
      { word: 'BOLO', hint: 'Doce muito comum em aniversários.' },
      { word: 'PIZZA', hint: 'Prato geralmente redondo com cobertura.' },
      { word: 'UVA', hint: 'Fruta pequena que cresce em cachos.' },
      { word: 'ARROZ', hint: 'Alimento muito consumido no Brasil.' }
    ],
    medium: [
      { word: 'LASANHA', hint: 'Prato feito com camadas de massa.' },
      { word: 'ABACAXI', hint: 'Fruta tropical com casca espinhosa.' },
      { word: 'MORANGO', hint: 'Fruta vermelha com pequenas sementes.' },
      { word: 'PANQUECA', hint: 'Massa fina que pode ter recheio.' }
    ],
    hard: [
      { word: 'ESCONDIDINHO', hint: 'Prato com recheio coberto por purê.' },
      { word: 'BRUSCHETTA', hint: 'Entrada italiana feita com pão.' },
      { word: 'RATATOUILLE', hint: 'Prato francês preparado com legumes.' },
      { word: 'CARBONARA', hint: 'Molho italiano tradicional para massas.' }
    ]
  }
};

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const difficultySettings = {
  easy: {
    lives: 6,
    description: 'Fácil: palavras curtas e 6 tentativas.',
    points: 10
  },
  medium: {
    lives: 6,
    description: 'Médio: palavras maiores e 6 tentativas.',
    points: 20
  },
  hard: {
    lives: 6,
    description: 'Difícil: palavras desafiadoras e 6 tentativas.',
    points: 35
  }
};

/* ==========================================
   ELEMENTOS E VARIÁVEIS
========================================== */

const $ = id => document.getElementById(id);

const difficultySelect = $('difficulty');
const categorySelect = $('category');
const keyboard = $('keyboard');
const wordElement = $('word');
const hintElement = $('hint');
const messageElement = $('message');

const bodyParts = [
  'head',
  'body',
  'leftArm',
  'rightArm',
  'leftLeg',
  'rightLeg'
];

let currentWord = '';
let currentHint = '';
let currentCategory = '';
let guessedLetters = [];
let wrongAttempts = 0;
let maxLives = 6;
let score = 0;
let record = 0;
let gameFinished = false;
let hintUsed = false;

const categoryNames = {
  all: 'TODOS OS TEMAS',
  animals: 'ANIMAIS',
  science: 'CIÊNCIAS',
  geography: 'GEOGRAFIA',
  technology: 'TECNOLOGIA',
  food: 'ALIMENTOS'
};

const difficultyNames = {
  easy: 'Fácil',
  medium: 'Médio',
  hard: 'Difícil'
};

/* ==========================================
   SALVAMENTO DO RECORDE
========================================== */

function loadRecord() {
  try {
    record = Number(localStorage.getItem('forcaRecord')) || 0;
  } catch (_) {
    record = 0;
  }
  $('record').textContent = record;
}

function saveRecord() {
  if (score > record) {
    record = score;
    try {
      localStorage.setItem('forcaRecord', String(record));
    } catch (_) {
      // O jogo continua funcionando sem armazenamento.
    }
  }
  $('record').textContent = record;
}

/* ==========================================
   ESCOLHA DE PALAVRAS
========================================== */

function normalizeWord(word) {
  return word.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
}

function getAvailableWords(category, difficulty) {
  if (category !== 'all') {
    return words[category][difficulty].map(item => ({
      ...item,
      category
    }));
  }

  const available = [];

  Object.keys(words).forEach(theme => {
    words[theme][difficulty].forEach(item => {
      available.push({
        ...item,
        category: theme
      });
    });
  });

  return available;
}

function chooseWord() {
  const difficulty = difficultySelect.value;
  const category = categorySelect.value;
  const available = getAvailableWords(category, difficulty);

  const selected = available[Math.floor(Math.random() * available.length)];

  currentWord = normalizeWord(selected.word);
  currentHint = selected.hint;
  currentCategory = selected.category;
}

/* ==========================================
   INICIAR JOGO
========================================== */

function newGame() {
  chooseWord();

  guessedLetters = [];
  wrongAttempts = 0;
  gameFinished = false;
  hintUsed = false;

  maxLives = difficultySettings[difficultySelect.value].lives;

  resetDrawing();
  createKeyboard();
  renderWord();

  $('lives').textContent = maxLives;
  $('categoryLabel').textContent = `TEMA: ${categoryNames[currentCategory]}`;
  $('levelDescription').textContent =
    difficultySettings[difficultySelect.value].description;

  hintElement.textContent = 'Clique em uma letra para começar!';
  $('hintButton').disabled = false;

  messageElement.textContent = 'Escolha uma letra!';
  messageElement.className = 'message';

  $('revealButton').disabled = false;
}

function resetDrawing() {
  bodyParts.forEach(id => {
    $(id).style.display = 'none';
  });
}

function createKeyboard() {
  keyboard.replaceChildren();

  alphabet.forEach(letter => {
    const button = document.createElement('button');

    button.type = 'button';
    button.className = 'key';
    button.textContent = letter;
    button.setAttribute('aria-label', `Letra ${letter}`);

    button.addEventListener('click', () => guessLetter(letter));

    keyboard.appendChild(button);
  });
}

/* ==========================================
   EXIBIR A PALAVRA
========================================== */

function renderWord() {
  wordElement.replaceChildren();

  currentWord.split('').forEach(letter => {
    const slot = document.createElement('div');
    slot.className = 'letter-slot';

    if (guessedLetters.includes(letter) || gameFinished) {
      slot.textContent = letter;
    } else {
      slot.textContent = '';
    }

    wordElement.appendChild(slot);
  });
}

function updateLives() {
  const remaining = maxLives - wrongAttempts;
  $('lives').textContent = remaining;
}

/* ==========================================
   TENTAR UMA LETRA
========================================== */

function guessLetter(letter) {
  if (gameFinished || guessedLetters.includes(letter)) return;

  guessedLetters.push(letter);

  const button = [...keyboard.children].find(
    item => item.textContent === letter
  );

  const correct = currentWord.includes(letter);

  if (button) {
    button.disabled = true;
    button.classList.add(correct ? 'correct' : 'wrong');
  }

  if (correct) {
    messageElement.textContent = 'Muito bem! Você encontrou uma letra!';
    messageElement.className = 'message success';
  } else {
    wrongAttempts++;
    bodyParts[wrongAttempts - 1] &&
      ($(bodyParts[wrongAttempts - 1]).style.display = 'block');

    messageElement.textContent = 'Ops! Essa letra não está na palavra.';
    messageElement.className = 'message error';
  }

  renderWord();
  updateLives();
  checkGame();
}

/* ==========================================
   VERIFICAR VITÓRIA OU DERROTA
========================================== */

function checkGame() {
  const won = currentWord.split('').every(letter =>
    guessedLetters.includes(letter)
  );

  if (won) {
    finishGame(true);
    return;
  }

  if (wrongAttempts >= maxLives) {
    finishGame(false);
  }
}

function finishGame(won) {
  if (gameFinished) return;

  gameFinished = true;

  [...keyboard.children].forEach(button => {
    button.disabled = true;
  });

  $('hintButton').disabled = true;
  $('revealButton').disabled = true;

  renderWord();

  if (won) {
    const points = difficultySettings[difficultySelect.value].points;
    const bonus = Math.max(0, maxLives - wrongAttempts) * 2;
    const total = points + bonus + (hintUsed ? 0 : 5);

    score += total;

    messageElement.textContent =
      `🎉 PARABÉNS! Você acertou e ganhou ${total} pontos!`;

    messageElement.className = 'message success';
  } else {
    messageElement.textContent =
      `😢 Fim de jogo! A palavra era: ${currentWord}`;

    messageElement.className = 'message error';
  }

  $('score').textContent = score;
  saveRecord();
}

/* ==========================================
   SISTEMA DE DICAS
========================================== */

$('hintButton').addEventListener('click', () => {
  if (gameFinished || hintUsed) return;

  hintElement.textContent = `💡 Dica: ${currentHint}`;
  hintUsed = true;

  $('hintButton').disabled = true;

  messageElement.textContent = 'Dica revelada! Boa sorte!';
  messageElement.className = 'message';
});

/* ==========================================
   REVELAR PALAVRA
========================================== */

$('revealButton').addEventListener('click', () => {
  if (gameFinished) return;

  gameFinished = true;
  renderWord();

  [...keyboard.children].forEach(button => {
    button.disabled = true;
  });

  $('hintButton').disabled = true;
  $('revealButton').disabled = true;

  messageElement.textContent = `A palavra era: ${currentWord}`;
  messageElement.className = 'message error';
});

/* ==========================================
   TECLADO FÍSICO
========================================== */

document.addEventListener('keydown', event => {
  const letter = event.key.toUpperCase();

  if (/^[A-Z]$/.test(letter)) {
    guessLetter(letter);
  }

  if (event.key === 'Enter' && gameFinished) {
    newGame();
  }
});

/* ==========================================
   BOTÕES E CONFIGURAÇÕES
========================================== */

$('newGame').addEventListener('click', newGame);

difficultySelect.addEventListener('change', newGame);
categorySelect.addEventListener('change', newGame);

/* ==========================================
   INICIALIZAÇÃO
========================================== */

loadRecord();
newGame();
