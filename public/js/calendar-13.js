class Calendar13 extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.currentMonth = 1;
  }

  connectedCallback() {
    this.render();
  }

  /* ========= CONFIG ========= */

  DAYS_IN_MONTH = 28;
  MONTHS_IN_YEAR = 13;

  EPOCH = new Date(Date.UTC(2025, 3, 1)); // 1º de abril
  NEW_MOON_REF = new Date(Date.UTC(2024, 3, 8));
  LUNAR_CYCLE = 29.530588;

  CROPS = [
    { name: 'Milho', plant: ['Primavera'] },
    { name: 'Feijão', plant: ['Primavera', 'Verão'] },
    { name: 'Batata', plant: ['Outono'] },
    { name: 'Trigo', plant: ['Outono'] },
  ];

  /* ========= CORE ========= */

  getSeason(month) {
    if (month <= 3) return 'Primavera';
    if (month <= 6) return 'Verão';
    if (month <= 9) return 'Outono';
    if (month <= 12) return 'Inverno';
    return 'Transição';
  }

  daysBetween(a, b) {
    return Math.floor((a - b) / 86400000);
  }

  getMoonPhase(date) {
    const days = this.daysBetween(date, this.NEW_MOON_REF);
    const phase =
      ((days % this.LUNAR_CYCLE) + this.LUNAR_CYCLE) % this.LUNAR_CYCLE;

    if (phase < 1) return 'Lua Nova';
    if (phase < 7.4) return 'Crescente';
    if (phase < 14.7) return 'Cheia';
    if (phase < 22.1) return 'Minguante';
    return 'Lua Nova';
  }

  cropsForSeason(season) {
    return this.CROPS.filter((c) => c.plant.includes(season));
  }

  /* ========= UI ========= */

  changeMonth(delta) {
    this.currentMonth += delta;
    if (this.currentMonth < 1) this.currentMonth = 13;
    if (this.currentMonth > 13) this.currentMonth = 1;
    this.render();
  }

  render() {
    const season = this.getSeason(this.currentMonth);
    const moon = this.getMoonPhase(new Date());
    const crops =
      this.cropsForSeason(season)
        .map((c) => c.name)
        .join(', ') || 'Nenhum';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: system-ui, sans-serif;
          max-width: 420px;
        }
        .nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .days {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
          margin-top: 8px;
        }
        .day {
          padding: 8px;
          text-align: center;
          border: 1px solid #ccc;
        }
        .info {
          margin-top: 12px;
          font-size: 0.9em;
        }
      </style>

      <div class="nav">
        <button id="prev">◀</button>
        <strong>Mês ${this.currentMonth} — ${season}</strong>
        <button id="next">▶</button>
      </div>

      <div class="days">
        ${Array.from(
          { length: 28 },
          (_, i) => `<div class="day">${i + 1}</div>`
        ).join('')}
      </div>

      <div class="info">
        🌙 ${moon}<br />
        🌱 Plantio: ${crops}
      </div>
    `;

    this.shadowRoot.getElementById('prev').onclick = () => this.changeMonth(-1);
    this.shadowRoot.getElementById('next').onclick = () => this.changeMonth(1);
  }

  static get observedAttributes() {
    return ['theme', 'start-month', 'lang'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }
  get theme() {
    return this.getAttribute('theme') || 'light';
  }

  get startMonth() {
    return parseInt(this.getAttribute('start-month')) || 1;
  }

  get lang() {
    return this.getAttribute('lang') || 'pt';
  }

  I18N = {
    pt: {
      spring: 'Primavera',
      summer: 'Verão',
      autumn: 'Outono',
      winter: 'Inverno',
      planting: 'Plantio',
    },
    en: {
      spring: 'Spring',
      summer: 'Summer',
      autumn: 'Autumn',
      winter: 'Winter',
      planting: 'Planting',
    },
  };

  t(key) {
    return this.I18N[this.lang]?.[key] || key;
  }
}

customElements.define('calendar-13', Calendar13);
