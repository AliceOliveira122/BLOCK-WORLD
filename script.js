const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const TILE = 32;
const WORLD_W = 140;
const WORLD_H = 35;

canvas.width = 960;
canvas.height = 540;

const blocks = {
  air:    { color: null, name: "Ar", emoji: " " },
  grass:  { color: "#55a630", name: "Grama", emoji: "🌱" },
  dirt:   { color: "#9c6644", name: "Terra", emoji: "🟫" },
  stone:  { color: "#777777", name: "Pedra", emoji: "🪨" },
  wood:   { color: "#925b2e", name: "Madeira", emoji: "🪵" },
  leaves: { color: "#238636", name: "Folhas", emoji: "🌳" },
  sand:   { color: "#e9d8a6", name: "Areia", emoji: "🏖️" },
  water:  { color: "#2589d8", name: "Água", emoji: "💧" }
};

const world = [];

const inventory = {
  dirt: 10,
  stone: 0,
  wood: 0,
  leaves: 0,
  sand: 0
};

const itemTypes = ["dirt", "stone", "wood", "leaves", "sand"];

let selected = 0;
let cameraX = 0;
let cameraY = 0;
let day = 1;
let time = 0;
let health = 100;
let hasPickaxe = false;
let messageTimer = 0;
let enemies = [];
let particles = [];
let lastTime = 0;

const keys = {};

const player = {
  x: 150,
  y: 100,
  w: 22,
  h: 42,
  vx: 0,
  vy: 0,
  speed: 3.5,
  jump: 10,
  grounded: false,
  facing: 1,
  invulnerable: 0
};

function showMessage(text) {
  document.getElementById("message").textContent = text;
  messageTimer = 2;
}

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// GERAÇÃO DO MUNDO

function generateWorld() {
  let ground = 15;

  for (let x = 0; x < WORLD_W; x++) {
    ground += random(-1, 1);
    ground = Math.max(12, Math.min(18, ground));

    world[x] = [];

    for (let y = 0; y < WORLD_H; y++) {
      if (y < ground) {
        world[x][y] = "air";
      } else if (y === ground) {
        world[x][y] = "grass";
      } else if (y < ground + 4) {
        world[x][y] = "dirt";
      } else {
        world[x][y] = "stone";
      }
    }
  }

  // Árvores
  for (let x = 5; x < WORLD_W - 5; x++) {
    if (Math.random() < 0.09) {
      const groundY = findGround(x);
      const height = random(3, 5);

      for (let i = 1; i <= height; i++) {
        if (groundY - i >= 0) {
          world[x][groundY - i] = "wood";
        }
      }

      for (let dx = -2; dx <= 2; dx++) {
        for (let dy = -2; dy <= 1; dy++) {
          const tx = x + dx;
          const ty = groundY - height + dy;

          if (
            tx >= 0 && tx < WORLD_W &&
            ty >= 0 && ty < WORLD_H &&
            world[tx][ty] === "air" &&
            Math.random() > 0.15
          ) {
            world[tx][ty] = "leaves";
          }
        }
      }
    }
  }

  // Pequenas áreas de areia
  for (let x = 25; x < WORLD_W - 5; x += random(15, 25)) {
    const groundY = findGround(x);

    for (let dx = 0; dx < 4; dx++) {
      if (world[x + dx]) {
        world[x + dx][groundY] = "sand";
      }
    }
  }
}

function findGround(x) {
  for (let y = 0; y < WORLD_H; y++) {
    if (world[x][y] !== "air") return y;
  }
  return WORLD_H - 1;
}

generateWorld();

// CONTROLES

document.addEventListener("keydown", e => {
  keys[e.key.toLowerCase()] = true;

  if (
    ["arrowup", "arrowdown", "arrowleft", "arrowright", " "]
      .includes(e.key.toLowerCase())
  ) {
    e.preventDefault();
  }

  if (
    (e.key.toLowerCase() === "w" ||
     e.key === "ArrowUp" ||
     e.code === "Space") &&
    player.grounded
  ) {
    player.vy = -player.jump;
    player.grounded = false;
  }

  if (e.key >= "1" && e.key <= "6") {
    selected = Number(e.key) - 1;
    updateUI();
  }
});

document.addEventListener("keyup", e => {
  keys[e.key.toLowerCase()] = false;
});

canvas.addEventListener("contextmenu", e => e.preventDefault());

function getMouseTile(e) {
  const rect = canvas.getBoundingClientRect();

  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const mx = (e.clientX - rect.left) * scaleX;
  const my = (e.clientY - rect.top) * scaleY;

  return {
    x: Math.floor((mx + cameraX) / TILE),
    y: Math.floor((my + cameraY) / TILE)
  };
}

canvas.addEventListener("mousedown", e => {
  const tile = getMouseTile(e);

  if (!insideWorld(tile.x, tile.y)) return;

  if (e.button === 0) {
    mineBlock(tile.x, tile.y);
  }

  if (e.button === 2) {
    placeBlock(tile.x, tile.y);
  }
});

function insideWorld(x, y) {
  return (
    x >= 0 && x < WORLD_W &&
    y >= 0 && y < WORLD_H
  );
}

// MINERAÇÃO

function mineBlock(x, y) {
  const type = world[x][y];

  if (type === "air") return;

  const distance = Math.hypot(
    x * TILE + TILE / 2 - (player.x + player.w / 2),
    y * TILE + TILE / 2 - (player.y + player.h / 2)
  );

  if (distance > TILE * 5) {
    showMessage("Muito longe para minerar!");
    return;
  }

  if (type === "stone" && !hasPickaxe) {
    showMessage("Você precisa criar uma picareta!");
    return;
  }

  world[x][y] = "air";

  if (inventory[type] !== undefined) {
    inventory[type]++;
  }

  for (let i = 0; i < 5; i++) {
    particles.push({
      x: x * TILE + TILE / 2,
      y: y * TILE + TILE / 2,
      vx: random(-3, 3),
      vy: random(-4, 1),
      life: 0.5,
      color: blocks[type].color
    });
  }

  updateUI();
}

// CONSTRUÇÃO

function placeBlock(x, y) {
  const type = itemTypes[selected];

  if (!insideWorld(x, y)) return;

  const distance = Math.hypot(
    x * TILE + TILE / 2 - (player.x + player.w / 2),
    y * TILE + TILE / 2 - (player.y + player.h / 2)
  );

  if (distance > TILE * 5) {
    showMessage("Muito longe para construir!");
    return;
  }

  if (world[x][y] !== "air") return;

  if (inventory[type] <= 0) {
    showMessage("Você não tem esse bloco!");
    return;
  }

  const blockRect = {
    x: x * TILE,
    y: y * TILE,
    w: TILE,
    h: TILE
  };

  if (rectCollision(blockRect, player)) {
    showMessage("Não pode construir em cima de você!");
    return;
  }

  world[x][y] = type;
  inventory[type]--;

  updateUI();
}

function rectCollision(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

// COLISÃO

function isSolid(x, y) {
  if (!insideWorld(x, y)) return false;

  return !["air", "water", "leaves"].includes(world[x][y]);
}

function collides(x, y, w, h) {
  const left = Math.floor(x / TILE);
  const right = Math.floor((x + w - 1) / TILE);
  const top = Math.floor(y / TILE);
  const bottom = Math.floor((y + h - 1) / TILE);

  for (let tx = left; tx <= right; tx++) {
    for (let ty = top; ty <= bottom; ty++) {
      if (isSolid(tx, ty)) return true;
    }
  }

  return false;
}

// PICARETA

document.getElementById("craft").addEventListener("click", () => {
  if (hasPickaxe) {
    showMessage("Você já possui uma picareta!");
    return;
  }

  if (inventory.wood >= 3 && inventory.stone >= 2) {
    inventory.wood -= 3;
    inventory.stone -= 2;
    hasPickaxe = true;

    showMessage("⛏️ Picareta criada!");
    updateUI();
  } else {
    showMessage("Você precisa de 3 madeiras e 2 pedras!");
  }
});

// CRIATURAS

function spawnEnemy() {
  const x = Math.random() < 0.5
    ? cameraX / TILE - 3
    : cameraX / TILE + 33;

  const safeX = Math.max(1, Math.min(WORLD_W - 2, Math.floor(x)));
  const groundY = findGround(safeX);

  enemies.push({
    x: safeX * TILE,
    y: groundY * TILE - 28,
    w: 24,
    h: 28,
    speed: 0.7
  });
}

function updateEnemies(dt) {
  for (const enemy of enemies) {
    const direction = Math.sign(
      player.x - enemy.x
    );

    enemy.x += direction * enemy.speed * dt * 60;

    if (rectCollision(enemy, player) && player.invulnerable <= 0) {
      health = Math.max(0, health - 10);
      player.invulnerable = 1.2;
      showMessage("Uma criatura te encontrou!");
      updateUI();
    }
  }

  enemies = enemies.filter(e =>
    e.x > cameraX - 100 &&
    e.x < cameraX + canvas.width + 100
  );

  if (health <= 0) {
    showMessage("Você ficou sem vida! Recarregue a página.");
    player.vx = 0;
    player.vy = 0;
  }
}

// ATUALIZAÇÃO

function update(dt) {
  if (health <= 0) return;

  const left = keys["a"] || keys["arrowleft"];
  const right = keys["d"] || keys["arrowright"];

  player.vx = 0;

  if (left) {
    player.vx = -player.speed;
    player.facing = -1;
  }

  if (right) {
    player.vx = player.speed;
    player.facing = 1;
  }

  const nextX = player.x + player.vx * dt * 60;

  if (!collides(nextX, player.y, player.w, player.h)) {
    player.x = nextX;
  }

  player.vy += 0.45 * dt * 60;
  player.vy = Math.min(player.vy, 12);

  const nextY = player.y + player.vy * dt * 60;

  if (!collides(player.x, nextY, player.w, player.h)) {
    player.y = nextY;
    player.grounded = false;
  } else {
    if (player.vy > 0) player.grounded = true;
    player.vy = 0;
  }

  player.invulnerable = Math.max(0, player.invulnerable - dt);

  cameraX = Math.max(
    0,
    Math.min(
      WORLD_W * TILE - canvas.width,
      player.x - canvas.width / 2
    )
  );

  cameraY = Math.max(
    0,
    Math.min(
      WORLD_H * TILE - canvas.height,
      player.y - canvas.height / 2
    )
  );

  time += dt;

  if (time >= 60) {
    time = 0;
    day++;
    showMessage("☀️ Um novo dia começou!");
    document.getElementById("day").textContent = `☀️ Dia ${day}`;
  }

  const isNight = time > 35;

  if (isNight && enemies.length < 5 && Math.random() < 0.02) {
    spawnEnemy();
  }

  if (!isNight) {
    enemies = [];
  }

  updateEnemies(dt);

  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.life -= dt;
  });

  particles = particles.filter(p => p.life > 0);

  if (messageTimer > 0) {
    messageTimer -= dt;

    if (messageTimer <= 0) {
      document.getElementById("message").textContent = "Explore o mundo!";
    }
  }
}

// DESENHO DO MUNDO

function drawWorld() {
  const startX = Math.max(0, Math.floor(cameraX / TILE));
  const endX = Math.min(
    WORLD_W,
    Math.ceil((cameraX + canvas.width) / TILE)
  );

  const startY = Math.max(0, Math.floor(cameraY / TILE));
  const endY = Math.min(
    WORLD_H,
    Math.ceil((cameraY + canvas.height) / TILE)
  );

  for (let x = startX; x < endX; x++) {
    for (let y = startY; y < endY; y++) {
      const type = world[x][y];

      if (type === "air") continue;

      const sx = x * TILE - cameraX;
      const sy = y * TILE - cameraY;

      ctx.fillStyle = blocks[type].color;
      ctx.fillRect(sx, sy, TILE, TILE);

      ctx.strokeStyle = "rgba(0,0,0,0.12)";
      ctx.strokeRect(sx, sy, TILE, TILE);

      if (type === "grass") {
        ctx.fillStyle = "#83d65a";
        ctx.fillRect(sx, sy, TILE, 5);
      }

      if (type === "stone") {
        ctx.fillStyle = "#999";
        ctx.fillRect(sx + 6, sy + 7, 6, 5);
        ctx.fillRect(sx + 20, sy + 19, 5, 6);
      }

      if (type === "wood") {
        ctx.fillStyle = "#b07840";
        ctx.fillRect(sx + 8, sy, 4, TILE);
      }

      if (type === "leaves") {
        ctx.fillStyle = "#3ca34a";
        ctx.fillRect(sx + 5, sy + 5, 8, 8);
      }
    }
  }
}

// DESENHO DO PERSONAGEM

function drawPlayer() {
  const x = player.x - cameraX;
  const y = player.y - cameraY;

  ctx.save();

  if (player.invulnerable > 0 && Math.floor(performance.now() / 100) % 2 === 0) {
    ctx.globalAlpha = 0.4;
  }

  // Cabeça
  ctx.fillStyle = "#f0c49b";
  ctx.fillRect(x + 3, y, 17, 16);

  // Cabelo
  ctx.fillStyle = "#4b2e1e";
  ctx.fillRect(x + 3, y, 17, 5);

  // Olhos
  ctx.fillStyle = "#111";
  ctx.fillRect(x + (player.facing === 1 ? 14 : 6), y + 8, 3, 3);

  // Corpo
  ctx.fillStyle = "#2563eb";
  ctx.fillRect(x + 2, y + 16, 19, 15);

  // Pernas
  ctx.fillStyle = "#374151";
  ctx.fillRect(x + 3, y + 31, 7, 11);
  ctx.fillRect(x + 13, y + 31, 7, 11);

  ctx.restore();
}

function drawEnemies() {
  for (const enemy of enemies) {
    const x = enemy.x - cameraX;
    const y = enemy.y - cameraY;

    ctx.fillStyle = "#7f1d1d";
    ctx.fillRect(x, y, enemy.w, enemy.h);

    ctx.fillStyle = "#ef4444";
    ctx.fillRect(x + 3, y + 3, 18, 12);

    ctx.fillStyle = "white";
    ctx.fillRect(x + 5, y + 7, 4, 4);
    ctx.fillRect(x + 15, y + 7, 4, 4);

    ctx.fillStyle = "black";
    ctx.fillRect(x + 6, y + 8, 2, 2);
    ctx.fillRect(x + 16, y + 8, 2, 2);
  }
}

function drawParticles() {
  for (const p of particles) {
    ctx.globalAlpha = Math.max(0, p.life * 2);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - cameraX, p.y - cameraY, 5, 5);
  }

  ctx.globalAlpha = 1;
}

// CÉU E CICLO DIA/NOITE

function drawSky() {
  const night = time > 35;

  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);

  if (night) {
    gradient.addColorStop(0, "#101b42");
    gradient.addColorStop(1, "#34436a");
  } else {
    gradient.addColorStop(0, "#38a9f5");
    gradient.addColorStop(1, "#a5e2ff");
  }

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (night) {
    ctx.fillStyle = "#fff5c2";

    for (let i = 0; i < 45; i++) {
      const sx = (i * 173) % canvas.width;
      const sy = (i * 83) % 220;

      ctx.fillRect(sx, sy, 2, 2);
    }

    ctx.fillStyle = "#fef3c7";
    ctx.beginPath();
    ctx.arc(800, 90, 27, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = "#fde047";
    ctx.beginPath();
    ctx.arc(800, 90, 32, 0, Math.PI * 2);
    ctx.fill();
  }
}

// INTERFACE

function updateUI() {
  document.getElementById("health").textContent =
    `❤️ ${health}`;

  const hotbar = document.getElementById("hotbar");
  hotbar.innerHTML = "";

  itemTypes.forEach((type, index) => {
    const slot = document.createElement("div");

    slot.className = "slot" +
      (selected === index ? " selected" : "");

    slot.innerHTML = `
      <div>${index + 1} ${blocks[type].emoji}</div>
      <strong>${inventory[type]}</strong>
    `;

    slot.addEventListener("click", () => {
      selected = index;
      updateUI();
    });

    hotbar.appendChild(slot);
  });

  const items = document.getElementById("items");
  items.innerHTML = "";

  itemTypes.forEach(type => {
    const div = document.createElement("div");
    div.className = "item";
    div.textContent =
      `${blocks[type].emoji} ${blocks[type].name}: ${inventory[type]}`;

    items.appendChild(div);
  });
}

// LOOP PRINCIPAL

function draw() {
  drawSky();
  drawWorld();
  drawParticles();
  drawEnemies();
  drawPlayer();
}

function loop(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 1000 || 0, 0.05);
  lastTime = timestamp;

  update(dt);
  draw();

  requestAnimationFrame(loop);
}

updateUI();
requestAnimationFrame(loop);
