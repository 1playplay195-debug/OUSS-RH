let currentFilter = 'all';
let selectedDate = new Date(); 
const container = document.getElementById('matchesContainer');
const prevScores = {};

// ===== أدوات التاريخ (صيغة YYYY-MM-DD لـ Sofascore) =====
function toAPIFormat(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function toInputFormat(d) {
  return toAPIFormat(d);
}

function formatArabicDate(d) {
  const isToday = toInputFormat(d) === toInputFormat(new Date());
  const isTomorrow = toInputFormat(d) === toInputFormat(new Date(Date.now() + 86400000));
  const isYesterday = toInputFormat(d) === toInputFormat(new Date(Date.now() - 86400000));
  if (isToday) return 'اليوم';
  if (isTomorrow) return 'غدًا';
  if (isYesterday) return 'أمس';
  return `${DAY_NAMES[d.getDay()]} ${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
}

// ===== التوقيت: GMT+1 =====
const TIME_FMT = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Etc/GMT-1',
  hour: '2-digit', minute: '2-digit', hour12: false, numberingSystem: 'latn'
});

function formatTime(dateMs) {
  try { return TIME_FMT.format(new Date(dateMs)); } catch { return ''; }
}
function nowTimeGMT1() { return TIME_FMT.format(new Date()); }

// ===== جلب جميع النتائج من Sofascore =====
async function loadAll() {
  container.innerHTML = '<p class="status-bar">⏳ جاري تحميل النتائج من Sofascore...</p>';
  try {
    const res = await fetch(`${API_BASE}/${toAPIFormat(selectedDate)}`);
    if (!res.ok) throw new Error('فشل الاتصال بالخادم');
    const data = await res.json();
    const allEvents = data.events || [];

    // فرز المباريات حسب الدوريات الموجودة في config.js
    const leagues = LEAGUES.map(league => {
      const events = allEvents.filter(e => e.tournament.uniqueTournament?.id === league.id);
      return {
        ...league,
        events: events.map(e => ({
          id: e.id,
          home: {
            name: e.homeTeam.shortName || e.homeTeam.name,
            logo: `https://api.sofascore.app/api/v1/team/${e.homeTeam.id}/image`,
            score: e.homeScore?.display ?? ''
          },
          away: {
            name: e.awayTeam.shortName || e.awayTeam.name,
            logo: `https://api.sofascore.app/api/v1/team/${e.awayTeam.id}/image`,
            score: e.awayScore?.display ?? ''
          },
          state: e.status.type, // inprogress, finished, notstarted
          detail: e.status.description || '',
          time: formatTime(e.startTimestamp * 1000),
          venue: 'غير متوفر بالواجهة الحالية',
          tv: 'غير متوفر'
        }))
      };
    }).filter(l => l.events.length > 0);

    // نظام فحص الأهداف للوميض
    leagues.forEach(l => l.events.forEach(m => {
      const key = l.code + '-' + m.id;
      if (prevScores[key] && (prevScores[key].h !== m.home.score || prevScores[key].a !== m.away.score)) {
        m.goal = true;
      }
      prevScores[key] = { h: m.home.score, a: m.away.score };
    }));

    window._leagues = leagues;
    buildNav(); updateDateBar(); render();
    document.getElementById('lastUpdate').textContent = 'آخر تحديث: ' + nowTimeGMT1() + ' (GMT+1)';
  } catch (err) {
    container.innerHTML = `<p class="status-bar" style="color:#ef4444;">❌ عذراً، حدث خطأ أثناء جلب النتائج.</p>`;
  }
}

// ===== شريط التاريخ والفلترة =====
function updateDateBar() {
  document.getElementById('datePicker').value = toInputFormat(selectedDate);
  const prev = new Date(selectedDate.getTime() - 86400000);
  const next = new Date(selectedDate.getTime() + 86400000);
  document.getElementById('prevDay').textContent = `◀ ${formatArabicDate(prev)}`;
  document.getElementById('nextDay').textContent = `${formatArabicDate(next)} ▶`;
}

function goToDate(days) { selectedDate = new Date(selectedDate.getTime() + days * 86400000); loadAll(); }
function onDateChange() {
  const val = document.getElementById('datePicker').value;
  if (!val) return;
  const [y, m, d] = val.split('-').map(Number);
  selectedDate = new Date(y, m - 1, d);
  loadAll();
}
function goToday() { selectedDate = new Date(); loadAll(); }

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

// ===== العرض بالـ HTML =====
function render() {
  const all = window._leagues || [];
  const filtered = currentFilter === 'all' ? all : all.filter(l => l.code === currentFilter);
  const dateHeader = `<div class="date-header">🗓️ مباريات ${formatArabicDate(selectedDate)} — التوقيت GMT+1</div>`;

  if (!filtered.length) {
    container.innerHTML = dateHeader + '<p class="no-matches">لا توجد مباريات في هذا اليوم</p>';
    return;
  }

  container.innerHTML = dateHeader + filtered.map(l => `
    <div class="league">
      <div class="league-header"><span>${l.flag}</span> ${l.arName}</div>
      ${l.events.map(m => `
        <div class="match ${m.goal ? 'goal-flash' : ''}" id="match-${m.id}">
          <div class="match-main">
            <div class="team home">
              <img class="team-logo" src="${m.home.logo}" alt="" onerror="this.src='icon-192.png'">
              ${m.home.name}
            </div>
            <div class="score-box">
              <div class="score ${m.state === 'inprogress' ? 'live' : ''}">${m.home.score} - ${m.away.score}</div>
              <div class="minute ${m.state === 'finished' ? 'finished' : m.state === 'notstarted' ? 'scheduled' : ''}">
                ${m.state === 'notstarted' ? '🕒 ' + m.time :
                  m.state === 'inprogress' ? '⏱ ' + (STATUS_AR[m.detail] || m.detail) :
                  '✓ ' + (STATUS_AR[m.detail] || m.detail)}
              </div>
            </div>
            <div class="team away">
              <img class="team-logo" src="${m.away.logo}" alt="" onerror="this.src='icon-192.png'">
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
setInterval(() => {
  if (toInputFormat(selectedDate) === toInputFormat(new Date())) loadAll();
}, REFRESH_INTERVAL);

// ===== تسجيل PWA وزر التثبيت =====
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js'));
}
let deferredPrompt;
const installBtn = document.getElementById('installAppBtn');
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault(); deferredPrompt = e; installBtn.style.display = 'inline-block';
});
installBtn.addEventListener('click', async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null; installBtn.style.display = 'none';
  }
});
window.addEventListener('appinstalled', () => installBtn.style.display = 'none');