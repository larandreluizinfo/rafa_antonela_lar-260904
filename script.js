const activities = [
  { id: 'atv1', name: 'Plantar as rosas do jardim', emoji: '🌹' },
  { id: 'atv2', name: 'Se olhar no espelho mágico', emoji: '🪞' },
  { id: 'atv3', name: 'Provar o vestido de festa', emoji: '👗' },
  { id: 'atv4', name: 'Amarrar as fitas no cabelo', emoji: '🎀' },
  { id: 'atv5', name: 'Guardar a joia da coroa', emoji: '💎' },
  { id: 'atv6', name: 'Brincar com a coroa', emoji: '👑' },
];

// Mapeia cada atividade a dono (1 = Lais, 2 = Sofia)
const activityOwner = {
  atv1: 1, atv2: 1, atv3: 1, atv4: 1, atv5: 1, atv6: 1,
  atv7: 2, atv8: 2, atv9: 2, atv10: 2, atv11: 2, atv12: 2,
};

const scores = { 1: 0, 2: 0 };
const players = {
  1: { keys: {}, pos: { x: 200, y: 300 }, petId: 'gato' },
  2: { keys: {}, pos: { x: 650, y: 300 }, petId: 'cachorro' },
};

// Posições dos pets (seguem a princesa)
const pets = {
  gato: { pos: { x: 170, y: 330 }, owner: 1 },
  cachorro: { pos: { x: 620, y: 330 }, owner: 2 },
};

const WORLD_W = 900;
const WORLD_H = 480;
const STEP = 4;

const laisEl = document.getElementById('lais');
const sofiaEl = document.getElementById('sofia');
const gatoEl = document.getElementById('gato');
const cachorroEl = document.getElementById('cachorro');

for (let i = 0; i < activities.length; i++) {
  const a = activities[i];
  const elL = document.getElementById('atv' + (i + 1));
  const elR = document.getElementById('atv' + (i + 7));
  if (elL) elL.innerHTML = a.emoji;
  if (elR) elR.innerHTML = a.emoji;
}

// Controles: jogador 1 = setas, jogador 2 = WASD
document.addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d'].includes(e.key)) e.preventDefault();
  players[1].keys[k] = true;
  players[2].keys[k] = true;
});

document.addEventListener('keyup', (e) => {
  const k = e.key.toLowerCase();
  players[1].keys[k] = false;
  players[2].keys[k] = false;
});

function movePlayer(player, owner, el, petId) {
  const k = player.keys;
  const dx = (k['d'] || k['ArrowRight'] ? 1 : 0) - (k['a'] || k['ArrowLeft'] ? 1 : 0);
  const dy = (k['s'] || k['ArrowDown'] ? 1 : 0) - (k['w'] || k['ArrowUp'] ? 1 : 0);

  let nx = player.pos.x + dx * STEP;
  let ny = player.pos.y + dy * STEP;

  nx = Math.max(0, Math.min(WORLD_W - 56, nx));
  ny = Math.max(0, Math.min(WORLD_H - 56, ny));

  player.pos.x = nx;
  player.pos.y = ny;
  el.style.left = nx + 'px';
  el.style.top = ny + 'px';

  // Pet segue a princesa
  const pet = pets[petId];
  const petEl = document.getElementById(petId);
  pet.pos.x = nx + (dx !== 0 ? (dx > 0 ? -50 : 50) : 50);
  pet.pos.y = ny + (dy !== 0 ? (dy > 0 ? -50 : 50) : 50);
  pet.pos.x = Math.max(0, Math.min(WORLD_W - 56, pet.pos.x));
  pet.pos.y = Math.max(0, Math.min(WORLD_H - 56, pet.pos.y));
  petEl.style.left = pet.pos.x + 'px';
  petEl.style.top = pet.pos.y + 'px';
}

function checkActivities(owner, player) {
  document.querySelectorAll('.activity').forEach((el) => {
    if (activityOwner[el.id] !== owner || el.classList.contains('done')) return;
    const aRect = el.getBoundingClientRect();
    const pRect = (owner === 1 ? laisEl : sofiaEl).getBoundingClientRect();
    const overlap = !(aRect.right < pRect.left || aRect.left > pRect.right ||
                      aRect.bottom < pRect.top || aRect.top > pRect.bottom);
    if (overlap) {
      el.classList.add('done');
      scores[owner]++;
      updateUI();
      const actId = parseInt(el.id.replace('atv', ''));
      const actIndex = actId > 6 ? actId - 7 : actId - 1;
      showModal('Atividade concluída!', 'A princesa ' + (owner === 1 ? 'Lais' : 'Sofia') + ' completou: ' + activities[actIndex].name);
      if (scores[owner] === 6) {
        showModal('🏰 Castelo completo! 🏰', 'A princesa ' + (owner === 1 ? 'Lais' : 'Sofia') + ' fez tudo que deu no castelo! Parabéns! 🎉');
      }
    }
  });
}

function updateUI() {
  document.getElementById('laisScore').textContent = scores[1];
  document.getElementById('sofiaScore').textContent = scores[2];
  document.getElementById('laisBar').style.width = (scores[1] / 6 * 100) + '%';
  document.getElementById('sofiaBar').style.width = (scores[2] / 6 * 100) + '%';
}

function showModal(title, text) {
  const modal = document.getElementById('modal');
  modal.classList.remove('hidden');
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-text').textContent = text;
  document.getElementById('modal-close').onclick = () => modal.classList.add('hidden');
}

function gameLoop() {
  movePlayer(players[1], 1, laisEl, 'gato');
  movePlayer(players[2], 2, sofiaEl, 'cachorro');
  checkActivities(1, players[1]);
  checkActivities(2, players[2]);
  requestAnimationFrame(gameLoop);
}

// Inicializar posições
function init() {
  laisEl.style.left = players[1].pos.x + 'px';
  laisEl.style.top = players[1].pos.y + 'px';
  sofiaEl.style.left = players[2].pos.x + 'px';
  sofiaEl.style.top = players[2].pos.y + 'px';
  gatoEl.style.left = pets.gato.pos.x + 'px';
  gatoEl.style.top = pets.gato.pos.y + 'px';
  cachorroEl.style.left = pets.cachorro.pos.x + 'px';
  cachorroEl.style.top = pets.cachorro.pos.y + 'px';
}

init();
gameLoop();
