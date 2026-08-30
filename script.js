let currentFilter = 'all';
let selectedDate = new Date(); 
const container = document.getElementById('matchesContainer');
const prevScores = {};

function toInputFormat(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatArabicDate(d) {
  const isToday = toInputFormat(d) === toInputFormat(new Date());
  if (isToday) return 'اليوم';
  return `${DAY_NAMES[d.getDay()]} ${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
}

const TIME_FMT = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Etc/GMT-1',
  hour: '2-digit', minute: '2-digit', hour12: false, numberingSystem: 'latn'
});

function nowTimeGMT1() { return TIME_FMT.format(new Date()); }

// ===== جلب المباريات من المصدر المباشر والمستقر =====
async function loadAll() {
  container.innerHTML = '<p class="status-bar">⏳ جاري تحميل النتائج...</p>';
  try {
    const allLeaguesData = [];

    for (const league of LEAGUES) {
      const res = await fetch(`${API_BASE}${league.file}`);
      if (!res.ok) continue;
      const data = await res.json();
      
      const targetDateStr = toInputFormat(selectedDate);

      // تصفية المباريات حسب التاريخ المحدد
      const matches = (data.matches || []).filter(m => m.date === targetDateStr).map(m => ({
        id: m.round + '-' + m.team1 + '-' + m.team2,
        home: {
          name: m.team1,
          logo: '',
          score: m.score1 !== undefined ? m.score1 : ''
        },
        away: {
          name: m.team2,
          logo: '',
          score: m.score2 !== undefined ? m.score2 : ''
        },
        state: m.score1 !== undefined ? 'Played' : 'Scheduled',
        detail: m.score1 !== undefined ? 'Played' : 'Scheduled',
        time: m.time || '--:--',
        venue: 'غير متوفر',
        tv: 'غير متوفر'
      }));

      if (matches.length > 0) {
        allLeaguesData.push({
          ...league,
          events: matches
        });
      }
    }

    window._leagues = allLeaguesData;
    buildNav(); 
    updateDateBar(); 
    render();
    document.getElementById('lastUpdate').textContent = 'آخر تحديث: ' + nowTimeGMT1() + ' (GMT+1)';
    
  } catch (err) {
    console.error("خطأ في الجلب:", err);
    container.innerHTML = `<p class="status-bar" style="color:#ef4444;">❌ عذراً، لا توجد مباريات مسجلة في هذا التاريخ بالمصدر.</p>`;
  }
}

function updateDateBar() {
  document.getElementById('datePicker').value = toInputFormat(selectedDate);
  const prev = new Date(selectedDate.getTime() - 86400000);
  const next = new Date(selectedDate.getTime() + 86400000);
  document.getElementById('prevDay').textContent = `◀ ${formatArabicDate(prev)}`;
  document.getElementById('nextDay').textContent = `${formatArabicDate(next)} ▶`;
}

function goToDate(days) { 
  selectedDate = new Date(selectedDate.getTime() + days * 86400000); 
  loadAll(); 
}

function onDateChange() {
  const val = document.getElementById('datePicker').value;
  if (!val) return;
  const [y, m, d] = val.split('-').map(Number);
  selectedDate = new Date(y, m - 1, d);
  loadAll();
}

function goToday() { 
  selectedDate = new Date(); 
  loadAll(); 
}

document.getElementById('prevDay').addEventListener('click', () => goToDate(-1));
document.getElementById('nextDay').addEventListener('click', () => goToDate(1));
document.getElementById('datePicker').addEventListener('change', onDateChange);
document.getElementById('todayBtn').addEventListener('click', goToday);

function buildNav() {
  const nav = document.getElementById('nav');
  if (nav.dataset.built) return;
  nav.dataset.built = '1';
  nav.innerHTML = `<button class="active" onclick="setFilter('all', this)">الكل</button>` +
    LEAGUES.map(l => `<button onclick="setFilter('${l.code}', this)">${l.flag} ${l.arName}</button>`).join('');
}

function setFilter(code, btn) {
  currentFilter = code;
  document.querySelectorAll('#nav button').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  render();
}

function render() {
  const all = window._leagues || [];
  const filtered = currentFilter === 'all' ? all : all.filter(l => l.code === currentFilter);
  const dateHeader = `<div class="date-header">🗓️ مباريات ${formatArabicDate(selectedDate)} — التوقيت GMT+1</div>`;

  if (!filtered.length) {
    container.innerHTML = dateHeader + '<p class="no-matches">لا توجد مباريات مسجلة في هذا اليوم</p>';
    return;
  }

  container.innerHTML = dateHeader + filtered.map(l => `
    <div class="league">
      <div class="league-header"><span>${l.flag}</span> ${l.arName}</div>
      ${l.events.map(m => `
        <div class="match" id="match-${m.id}">
          <div class="match-main">
            <div class="team home">
              ${m.home.name}
            </div>
            <div class="score-box">
              <div class="score">${m.home.score !== '' ? m.home.score + ' - ' + m.away.score : 'VS'}</div>
              <div class="minute ${m.state === 'Played' ? 'finished' : 'scheduled'}">
                ${m.state === 'Scheduled' ? '🕒 ' + m.time : '✓ انتهت'}
              </div>
            </div>
            <div class="team away" style="justify-content: flex-end; text-align: left;">
              ${m.away.name}
            </div>
          </div>
          <div class="match-details">
            <div class="detail-item">🏟️ ${m.venue}</div>
            <div class="detail-item">📺 ${m.tv}</div>
          </div>
        </div>`).join('')}
    </div>`).join('');
}

loadAll();
