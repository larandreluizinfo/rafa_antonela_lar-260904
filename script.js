const ACTIVITIES = [
  { id: '1', name: 'Plantar as rosas do jardim', emoji: '🌹' },
  { id: '2', name: 'Se olhar no espelho mágico', emoji: '🪞' },
  { id: '3', name: 'Provar o vestido de festa', emoji: '👗' },
  { id: '4', name: 'Amarrar as fitas no cabelo', emoji: '🎀' },
  { id: '5', name: 'Guardar a joia da coroa', emoji: '💎' },
  { id: '6', name: 'Ler um livro de histórias', emoji: '📚' },
  { id: '7', name: 'Pintar um quadro', emoji: '🎨' },
  { id: '8', name: 'Cantar uma música', emoji: '🎵' },
];

// Mapeia cada atividade ao dono (1 = Lais, 2 = Sofia)
const activityOwner = {};
'12345678'.split('').forEach(id => activityOwner['latv' + id] = 1);
'12345678'.split('').forEach(id => activityOwner['satv' + id] = 2);

const scores = { 1: 0, 2: 0 };
const dresses = { 1: false, 2: false }; // vestido trocado ainda não

const players = {
  1: { keys: {}, pos: { x: 200, y: 300 }, petId: 'gato', emojiEl: '.lais-emoji' },
  2: { keys: {}, pos: { x: 650, y: 300 }, petId: 'cachorro', emojiEl: '.sofia-emoji' },
};

const pets = {
  gato: { pos: { x: 170, y: 330 }, owner: 1 },
  cachorro: { pos: { x: 620, y: 330 }, owner: 2 },
};

const WORLD_W = 900;
const WORLD_H = 560;
const STEP = 4;

const laisEl = document.getElementById('lais');
const sofiaEl = document.getElementById('sofia');
const gatoEl = document.getElementById('gato');
const cachorroEl = document.getElementById('cachorro');
const wardrobeLaisEl = document.getElementById('wardrobeLais');
const wardrobeSofiaEl = document.getElementById('wardrobeSofia');

// preenche o emoji das atividades
document.querySelectorAll('.activity').forEach(el => {
  const num = el.id.replace(/^[ls]atv/, '');
  const act = ACTIVITIES.find(a => a.id === num);
  if (act) el.innerHTML = act.emoji;
});

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

function overlap(a, b) {
  return !(a.right <= b.left || a.left >= b.right ||
           a.bottom <= b.top || a.top >= b.bottom);
}

function movePlayer(player, owner, el, petId, emojiSelector) {
  const k = player.keys;
  const dx = (k['d'] || k['ArrowRight'] ? 1 : 0) - (k['a'] || k['ArrowLeft'] ? 1 : 0);
  const dy = (k['s'] || k['ArrowDown'] ? 1 : 0) - (k['w'] || k['ArrowUp'] ? 1 : 0);

  let nx = player.pos.x + dx * STEP;
  let ny = player.pos.y + dy * STEP;

  nx = Math.max(0, Math.min(WORLD_W - 60, nx));
  ny = Math.max(0, Math.min(WORLD_H - 60, ny));

  player.pos.x = nx;
  player.pos.y = ny;
  el.style.left = nx + 'px';
  el.style.top = ny + 'px';

  // Pet segue a princesa
  const pet = pets[petId];
  const petEl = document.getElementById(petId);
  pet.pos.x = nx + (dx !== 0 ? (dx > 0 ? 60 : -60) : 60);
  pet.pos.y = ny + (dy !== 0 ? (dy > 0 ? 60 : -60) : 60);
  pet.pos.x = Math.max(0, Math.min(WORLD_W - 60, pet.pos.x));
  pet.pos.y = Math.max(0, Math.min(WORLD_H - 60, pet.pos.y));
  petEl.style.left = pet.pos.x + 'px';
  petEl.style.top = pet.pos.y + 'px';
}

function checkWardrobe(owner, player, emojiSelector) {
  if (dresses[owner]) return;
  const wardrobeEl = owner === 1 ? wardrobeLaisEl : wardrobeSofiaEl;
  const pEl = owner === 1 ? laisEl : sofiaEl;
  if (overlap(wardrobeEl.getBoundingClientRect(), pEl.getBoundingClientRect())) {
    dresses[owner] = true;
    const princessName = owner === 1 ? 'Lais' : 'Sofia';
    const emojiEl = pEl.querySelector(emojiSelector);
    // troca de visual
    const princessDress = owner === 1 ? '👸' : '👸';
    emojiEl.textContent = owner === 1 ? '💃' : '🩰';
    showModal('Roupa trocada! 👗', princessName + ' trocou de roupa e ficou ainda mais linda! Agora sem os animais ela faz tudo no castelo!');
    checkActivities(owner, player);
  }
}

function checkActivities(owner, player) {
  const pEl = owner === 1 ? laisEl : sofiaEl;
  const princessName = owner === 1 ? 'Lais' : 'Sofia';
  document.querySelectorAll('.activity').forEach(el => {
    if (activityOwner[el.id] !== owner || el.classList.contains('done')) return;
    if (!overlap(el.getBoundingClientRect(), pEl.getBoundingClientRect())) return;
    el.classList.add('done');
    scores[owner]++;
    updateUI();
    const num = el.id.replace(/^[ls]atv/, '');
    const act = ACTIVITIES.find(a => a.id === num);
    showModal('Atividade concluída! ✨', princessName + ' fez: ' + act.name + '!');
    if (scores[owner] === 8) {
      showModal('🏰 Castelo completo! 🏰', princessName + ' fez tudo que deu no castelo! Parabéns! 🎉');
    }
  });
}

function updateUI() {
  document.getElementById('laisScore').textContent = scores[1];
  document.getElementById('sofiaScore').textContent = scores[2];
  document.getElementById('laisBar').style.width = (scores[1] / 8 * 100) + '%';
  document.getElementById('sofiaBar').style.width = (scores[2] / 8 * 100) + '%';
}

function showModal(title, text) {
  const modal = document.getElementById('modal');
  modal.classList.remove('hidden');
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-text').textContent = text;
  document.getElementById('modal-close').onclick = () => modal.classList.add('hidden');
}

function gameLoop() {
  movePlayer(players[1], 1, laisEl, 'gato', '.lais-emoji');
  movePlayer(players[2], 2, sofiaEl, 'cachorro', '.sofia-emoji');
  checkWardrobe(1, players[1], '.lais-emoji');
  checkWardrobe(2, players[2], '.sofia-emoji');
  checkActivities(1, players[1]);
  checkActivities(2, players[2]);
  requestAnimationFrame(gameLoop);
}

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
