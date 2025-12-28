class Calendar13 extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.currentMonth = 1;
    this._theme = this.getAttribute('theme') || 'dark';
  }

  /* ========= CONFIG ========= */

  DAYS_IN_MONTH = 28;
  MONTHS_IN_YEAR = 13;

  // Ano começa em 1º de Abril
  EPOCH = new Date(Date.UTC(2025, 3, 1));

  NEW_MOON_REF = new Date(Date.UTC(2024, 3, 8));
  LUNAR_CYCLE = 29.530588;

  BIBLICAL_FEASTS = [
    { name: 'Pessach', month: 1, day: 14 },
    { name: 'Pães Ázimos', month: 1, day: 15 },
    { name: 'Primícias', month: 1, day: 18 },
    { name: 'Pentecostes', month: 3, day: 15 },
    { name: 'Trombetas', month: 7, day: 1 },
    { name: 'Expiação', month: 7, day: 10 },
    { name: 'Tabernáculos', month: 7, day: 15 },
  ];

  CROPS = [
    { name: 'Milho', plant: ['spring'], harvest: ['summer'] },
    { name: 'Feijão', plant: ['spring'], harvest: ['summer'] },
    { name: 'Batata', plant: ['autumn'], harvest: ['winter'] },
    { name: 'Trigo', plant: ['autumn'], harvest: ['spring'] },
  ];

  connectedCallback() {
    this.currentMonth = this.getToday()?.month || 1;
    this.render();
  }

  /* ========= CORE ========= */

  daysBetween(a, b) {
    return Math.floor((a - b) / 86400000);
  }

  getSeason(month) {
    if (month <= 3) return 'spring';
    if (month <= 6) return 'summer';
    if (month <= 9) return 'autumn';
    if (month <= 12) return 'winter';
    return 'transition';
  }

  getMoonPhase(date) {
    const days = this.daysBetween(date, this.NEW_MOON_REF);
    const phase =
      ((days % this.LUNAR_CYCLE) + this.LUNAR_CYCLE) % this.LUNAR_CYCLE;

    if (phase < 1) return 'new';
    if (phase < 14.7) return 'full';
    return null;
  }

  getToday() {
    const now = new Date();
    const diff = this.daysBetween(now, this.EPOCH);
    if (diff < 0) return null;

    const dayOfYear = diff % 365;
    if (dayOfYear === 364) return { neutral: true };

    return {
      month: Math.floor(dayOfYear / this.DAYS_IN_MONTH) + 1,
      day: (dayOfYear % this.DAYS_IN_MONTH) + 1,
    };
  }

  isFeast(month, day) {
    return this.BIBLICAL_FEASTS.find((f) => f.month === month && f.day === day);
  }

  cropInfo(season) {
    return this.CROPS.filter(
      (c) => c.plant.includes(season) || c.harvest.includes(season)
    );
  }

  changeMonth(delta) {
    this.currentMonth += delta;
    if (this.currentMonth < 1) this.currentMonth = 13;
    if (this.currentMonth > 13) this.currentMonth = 1;
    this.render();
  }

  /* ========= UI ========= */

  render() {
    const today = this.getToday();
    const seasonKey = this.getSeason(this.currentMonth);
    const crops =
      this.cropInfo(seasonKey)
        .map((c) => c.name)
        .join(', ') || '—';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          font-family: system-ui, sans-serif;
          --accent: #7dd3fc;
        }

        .root {
          padding: 1.5rem;
          border-radius: 1.25rem;
          color: white;
          background: linear-gradient(to top, #0f172a, #020617);
          box-shadow: 0 20px 40px rgba(64, 64, 64, 0.5);
        }
        body {
          background: #222;
          }

        .root.spring { background: linear-gradient(to top, #144426ff, #527c61ff); }
        .root.summer { background: linear-gradient(to top, #0085beff, #a28700ff); }
        .root.autumn { background: linear-gradient(to top, #9f5b22ff, #c05918ff); }
        .root.winter { background: linear-gradient(to top, #0f172a, #bae6fd); }

        .nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: .5rem;
        }

        button {
          background: none;
          border: none;
          color: inherit;
          font-size: 1.4rem;
          cursor: pointer;
        }

        .days {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 6px;
        }

        .day {
          padding: .6rem;
          text-align: center;
          border-radius: 8px;
          background: rgba(255,255,255,.15);
          position: relative;
        }

        .day.today {
          animation: pulse 2s infinite;
          background: rgba(255,0,0,.6);
        }

        .day[data-tooltip]:hover::after {
          content: attr(data-tooltip);
          position: absolute;
          bottom: 110%;
          left: 50%;
          transform: translateX(-50%);
          background: black;
          color: white;
          padding: .3rem .5rem;
          border-radius: 6px;
          font-size: .75rem;
          white-space: nowrap;
        }

        .moon { font-size: .8rem; }
        .feast { background: gold; color: black; }
        .crop { border: 2px dashed #16a34a; }

        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(255,0,0,.6); }
          70% { box-shadow: 0 0 0 10px rgba(255,0,0,0); }
          100% { box-shadow: 0 0 0 0 rgba(255,0,0,0); }
        }
      </style>

      <div class="root ${seasonKey}">
        <div class="nav">
          <button id="prev">‹</button>
          <strong>Mês ${this.currentMonth}</strong>
          <button id="next">›</button>
        </div>

        <small>🌱 ${crops}</small>

        <div class="days">
          ${Array.from({ length: 28 }, (_, i) => {
            const d = i + 1;
            const isToday =
              today && today.month === this.currentMonth && today.day === d;

            const feast = this.isFeast(this.currentMonth, d);
            const moon = this.getMoonPhase(new Date());

            return `
              <div class="day
                ${isToday ? 'today' : ''}
                ${feast ? 'feast' : ''}"
                data-tooltip="${feast ? feast.name : ''}">
                ${d}
                ${moon === 'full' ? '🌕' : moon === 'new' ? '🌑' : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    this.shadowRoot.getElementById('prev').onclick = () => this.changeMonth(-1);
    this.shadowRoot.getElementById('next').onclick = () => this.changeMonth(1);
  }
}

customElements.define('calendar-13', Calendar13);
