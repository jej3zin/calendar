/* ================= CONFIG ================= */

const DAYS_IN_MONTH = 28;
const MONTHS_IN_YEAR = 13;
const DAYS_IN_YEAR = 364;
const NEUTRAL_DAY_INDEX = 364;

// Ano começa em 1º de abril (UTC)
const EPOCH = new Date(Date.UTC(2025, 3, 1));

// Lua nova de referência (exemplo real)
const NEW_MOON_REF = new Date(Date.UTC(2024, 3, 8));
const LUNAR_CYCLE = 29.530588;

/* ================= ESTAÇÕES ================= */

function getSeason(month) {
  if (month <= 3) return 'Primavera';
  if (month <= 6) return 'Verão';
  if (month <= 9) return 'Outono';
  if (month <= 12) return 'Inverno';
  return 'Transição';
}

/* ================= AGRICULTURA ================= */

const CROPS = [
  {
    name: 'Milho',
    plant: ['Primavera'],
    harvest: ['Verão'],
    growDays: 90,
  },
  {
    name: 'Feijão',
    plant: ['Primavera', 'Verão'],
    harvest: ['Outono'],
    growDays: 70,
  },
  {
    name: 'Batata',
    plant: ['Outono'],
    harvest: ['Inverno'],
    growDays: 100,
  },
  {
    name: 'Trigo',
    plant: ['Outono'],
    harvest: ['Primavera'],
    growDays: 120,
  },
];

function cropsForSeason(season) {
  return CROPS.filter((c) => c.plant.includes(season));
}

/* ================= CORE ================= */

function daysBetweenUTC(a, b) {
  const MS = 1000 * 60 * 60 * 24;
  return Math.floor((a - b) / MS);
}

function gregorianToCustom(date) {
  const diff = daysBetweenUTC(date, EPOCH);
  const dayOfYear =
    ((diff % (DAYS_IN_YEAR + 1)) + (DAYS_IN_YEAR + 1)) % (DAYS_IN_YEAR + 1);

  if (dayOfYear === NEUTRAL_DAY_INDEX) {
    return { neutral: true };
  }

  const month = Math.floor(dayOfYear / DAYS_IN_MONTH) + 1;
  const day = (dayOfYear % DAYS_IN_MONTH) + 1;
  const season = getSeason(month);

  return { month, day, season };
}

/* ================= LUA ================= */

function getMoonPhase(date) {
  const days = daysBetweenUTC(date, NEW_MOON_REF);
  const phase = ((days % LUNAR_CYCLE) + LUNAR_CYCLE) % LUNAR_CYCLE;

  if (phase < 1) return 'Lua Nova';
  if (phase < 7.4) return 'Crescente';
  if (phase < 8.4) return 'Quarto Crescente';
  if (phase < 14.7) return 'Cheia';
  if (phase < 22.1) return 'Minguante';
  return 'Lua Nova';
}

/* ================= UI ================= */

let currentMonth = 1;

function renderCalendar(containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  const header = document.createElement('div');
  header.className = 'nav';

  const prev = document.createElement('button');
  prev.textContent = '<ion-icon name="caret-back"></ion-icon>';
  prev.onclick = () => changeMonth(-1);

  const next = document.createElement('button');
  next.textContent = '<ion-icon name="caret-forward"></ion-icon>';
  next.onclick = () => changeMonth(1);

  const title = document.createElement('h2');
  title.textContent = `Mês ${currentMonth} — ${getSeason(currentMonth)}`;

  header.append(prev, title, next);
  container.appendChild(header);

  const grid = document.createElement('div');
  grid.className = 'days';

  for (let d = 1; d <= DAYS_IN_MONTH; d++) {
    const cell = document.createElement('div');
    cell.className = 'day';
    cell.textContent = d;
    grid.appendChild(cell);
  }

  container.appendChild(grid);

  renderInfo(container);
}

function renderInfo(container) {
  const today = new Date();
  const custom = gregorianToCustom(today);
  const moon = getMoonPhase(today);
  const crops = cropsForSeason(custom.season);

  const info = document.createElement('div');
  info.className = 'info';

  info.innerHTML = `
    <p><strong>Hoje:</strong> Mês ${custom.month}, Dia ${custom.day}</p>
    <p><strong>Estação:</strong> ${custom.season}</p>
    <p><strong>Lua:</strong> ${moon}</p>
    <p><strong>Plantio recomendado:</strong>
      ${crops.map((c) => c.name).join(', ') || 'Nenhum'}
    </p>
  `;

  container.appendChild(info);
}

function changeMonth(delta) {
  currentMonth += delta;
  if (currentMonth < 1) currentMonth = 13;
  if (currentMonth > 13) currentMonth = 1;
  renderCalendar('calendar');
}

/* ================= INIT ================= */

document.addEventListener('DOMContentLoaded', () => {
  renderCalendar('calendar');
});
