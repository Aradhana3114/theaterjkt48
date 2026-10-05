const SUPABASE_URL = "https://pprxfopqkvpeajeoxzig.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwcnhmb3Bxa3ZwZWFqZW94emlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNTI4MTIsImV4cCI6MjA4MTgyODgxMn0.iXRO_dAHhtVHRLqGTresG_63RD2zIaopNXtXYNfthdg";
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const SHOW_DURATION_MINUTES = 150;
const EVENT_DURATION_MINUTES = 150;
const PRE_SHOW_BUFFER_MINUTES = 15;

// ============= HELPER: Selalu gunakan WIB (UTC+7) =============
function getTodayWIB() {
    return moment().utcOffset(7 * 60).format('YYYY-MM-DD');
}

function getDurationMinutes(isNonShow) {
    return isNonShow ? EVENT_DURATION_MINUTES : SHOW_DURATION_MINUTES;
}

// ============= THEME =============
(function initializeTheme() {
  const savedTheme = localStorage.getItem('jkt48_theme') || 'light';
  const html = document.documentElement;
  const body = document.body;
  if (savedTheme === 'dark') {
    html.classList.add('dark'); body.classList.add('dark');
  } else {
    html.classList.remove('dark'); body.classList.remove('dark');
  }
})();

// Helper: parse show datetime as WIB (UTC+7) — defined in utils.js

// ============= LIVE STATUS =============
function getLiveStatus(showDate, showTime, isNonShow = false) {
    if (!showDate || !showTime) return 'FINISHED';
    const now = new Date();
    const showDateTime = parseWIB(showDate, showTime);
    const liveStart = new Date(showDateTime.getTime() - PRE_SHOW_BUFFER_MINUTES * 60000);
    const liveEnd = new Date(showDateTime.getTime() + getDurationMinutes(isNonShow) * 60000);
    if (now < liveStart) return 'UPCOMING';
    if (now >= liveStart && now <= liveEnd) return 'LIVE';
    return 'FINISHED';
}

// ============= STATE: Gunakan WIB sejak inisialisasi =============
let allShows = [];
let currentDate = getTodayWIB();
let currentMonth = moment().utcOffset(7 * 60);

function goBack() { window.location.replace('index.html'); }
function saveSelectedDate(dateStr) { localStorage.setItem('jkt48_selected_date', dateStr); }
function loadSelectedDate() { return localStorage.getItem('jkt48_selected_date') || getTodayWIB(); }

async function loadSchedule() {
    try {
        console.log('Loading schedule...');

        // Fetch semua data dengan pagination (PostgREST default max-rows = 1000)
        const PAGE_SIZE = 1000;
        let offset = 0;
        let fetched = [];
        while (true) {
            const { data, error } = await db
                .from('setlist_performance')
                .select(`*, members(name, team)`)
                .order('show_date', { ascending: true })
                .order('show_time', { ascending: true })
                .order('id', { ascending: true })
                .range(offset, offset + PAGE_SIZE - 1);

            if (error) throw error;
            fetched = fetched.concat(data || []);
            if (!data || data.length < PAGE_SIZE) break;
            offset += PAGE_SIZE;
        }

        allShows = fetched.map(show => ({ ...show, memberName: show.members?.name, memberTeam: show.members?.team }));
        console.log('Shows loaded:', allShows.length);

        // Reset ke hari ini dalam WIB
        currentDate = getTodayWIB();
        currentMonth = moment().utcOffset(7 * 60);

        renderCalendar();
        renderShows(currentDate);

    } catch (err) {
        console.error('Error:', err);
        document.getElementById('showList').innerHTML = `
            <div class="no-shows-message">
                <div class="no-shows-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                </div>
                <div class="no-shows-title">Gagal Memuat Jadwal</div>
                <div class="no-shows-desc">Silakan coba refresh halaman atau cek koneksi internet Anda.</div>
                <button onclick="goBack()" style="background:#e60012;color:#fff;border:none;border-radius:12px;padding:12px 24px;font-size:14px;font-weight:600;cursor:pointer">
                    Kembali ke Beranda
                </button>
            </div>`;
    }
}

const SETLIST_COLORS = {
  'Te Wo Tsunaginagara':     { from: '#FF69B4', to: '#c0407a' },
  'Te wo Tsunaginagara':     { from: '#FF69B4', to: '#c0407a' },
  'Cara Meminum Ramune':     { from: '#00CED1', to: '#008b8d' },
  'Ramune no Nomikata':      { from: '#00CED1', to: '#008b8d' },
  'Pertaruhan Cinta':        { from: '#D30000', to: '#900603' },
  'Pajama Drive':            { from: '#00006d', to: '#000045' },
  'non_show':                { from: '#3b82f6', to: '#1d4ed8' },
  // Team Shows
  'Passion 200%':            { from: '#f69220', to: '#c4711a' },
  'Passion 200% [SHONICHI]': { from: '#f69220', to: '#c4711a' },
  'Dream 200%':              { from: '#00a4a5', to: '#007b7c' },
  'Dream 200% [SHONICHI]':   { from: '#00a4a5', to: '#007b7c' },
  'Love 200%':               { from: '#e20785', to: '#a80562' },
  'Love 200% [SHONICHI]':    { from: '#e20785', to: '#a80562' },
  'ITADAKI♥LOVE':            { from: '#e20785', to: '#a80562' },
};

function getSetlistGradient(setlistName, isNonShow) {
  if (isNonShow) { const col = SETLIST_COLORS['non_show']; return `linear-gradient(135deg, ${col.from} 0%, ${col.to} 100%)`; }
  const col = SETLIST_COLORS[setlistName];
  if (col) return `linear-gradient(135deg, ${col.from} 0%, ${col.to} 100%)`;
  const lower = (setlistName || '').toLowerCase();
  if (lower.includes('tsunaginagara') || lower.includes('tewo')) return `linear-gradient(135deg, #FF69B4 0%, #c0407a 100%)`;
  if (lower.includes('ramune')) return `linear-gradient(135deg, #00CED1 0%, #008b8d 100%)`;
  if (lower.includes('pertaruhan')) return `linear-gradient(135deg, #D30000 0%, #900603 100%)`;
  if (lower.includes('pajama')) return `linear-gradient(135deg, #00006d 0%, #000045 100%)`;
  if (lower.includes('passion')) return `linear-gradient(135deg, #f69220 0%, #c4711a 100%)`;
  if (lower.includes('dream')) return `linear-gradient(135deg, #00a4a5 0%, #007b7c 100%)`;
  if (lower.includes('love')) return `linear-gradient(135deg, #e20785 0%, #a80562 100%)`;
  return null;
}

function getSetlistColor(setlistName) {
    if (!setlistName) return '#e60012';
    const l = setlistName.toLowerCase().trim();
    if (l.includes('non_show') || l === 'non_show') return '#22c55e';
    if (l.includes('te wo tsunaginagara') || l.includes('tewo') || l.includes('tsunaginagara')) return '#FF69B4';
    if (l.includes('ramune')) return '#00CED1';
    if (l.includes('pertaruhan')) return '#D30000';
    if (l.includes('pajama')) return '#00006d';
    if (l.includes('passion')) return '#f69220';
    if (l.includes('dream')) return '#00a4a5';
    if (l.includes('love')) return '#e20785';
    return '#e60012';
}

function getSetlistsForDate(dateStr) {
    const showsOnDate = allShows.filter(s => s.show_date === dateStr);
    if (showsOnDate.length === 0) return [];
    const uniqueShows = [];
    const seen = new Set();
    showsOnDate.forEach(show => {
        const key = `${show.setlist_name}_${show.show_time}`;
        if (!seen.has(key)) {
            seen.add(key);
            const color = show.is_non_show ? '#22c55e' : getSetlistColor(show.setlist_name);
            uniqueShows.push({ color, name: show.setlist_name, time: show.show_time,
                isBirthday: show.is_birthday_show, birthdayMember: show.birthday_member,
                isGraduation: show.is_graduation_show, graduationMember: show.graduation_member });
        }
    });
    return uniqueShows;
}

function createIndicatorsHTML(dateStr) {
    const setlists = getSetlistsForDate(dateStr);
    if (setlists.length === 0) return '';
    const limited = setlists.slice(0, 3);
    let html = '<div class="calendar-indicators">';
    limited.forEach(s => {
        let tooltip = `${s.name} (${s.time.slice(0,5)})`;
        if (s.isGraduation) tooltip += ' - Last Show';
        else if (s.isBirthday) tooltip += ' - STS';
        html += `<span class="calendar-indicator" style="background:${s.color}" title="${tooltip}"></span>`;
    });
    if (setlists.length > 3) {
        html += `<span class="calendar-indicator" style="background:#6b7280;width:8px;height:8px;font-size:6px;line-height:8px;text-align:center;" title="+${setlists.length - 3} show lagi">+</span>`;
    }
    html += '</div>';
    return html;
}

function renderCalendar() {
    const calendarEl = document.getElementById('calendar');
    const monthYearEl = document.getElementById('currentMonth');
    const monthNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    const dayNames = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];

    const month = currentMonth.month();
    const year = currentMonth.year();
    monthYearEl.textContent = `${monthNames[month]} ${year}`;

    const startOfMonth = currentMonth.clone().startOf('month');
    const endOfMonth = currentMonth.clone().endOf('month');
    const startDate = startOfMonth.clone().startOf('week');
    const endDate = endOfMonth.clone().endOf('week');

    let html = '';
    for (let i = 0; i < 7; i++) html += `<div class="calendar-day-header">${dayNames[i]}</div>`;

    // ✅ PERBAIKAN UTAMA: Selalu gunakan WIB untuk menentukan "hari ini"
    const todayStr = getTodayWIB();
    let date = startDate.clone();

    while (date.isBefore(endDate) || date.isSame(endDate, 'day')) {
        const dateStr = date.format('YYYY-MM-DD');
        const isToday = dateStr === todayStr;
        const isCurrentMonth = date.month() === month;
        const isActive = dateStr === currentDate;
        const hasShow = allShows.some(show => show.show_date === dateStr);

        let dayClass = 'calendar-day';
        if (!isCurrentMonth) dayClass += ' other-month';
        if (isToday) dayClass += ' today';
        if (isActive) dayClass += ' active';

        const indicatorsHTML = hasShow ? createIndicatorsHTML(dateStr) : '';
        html += `<div class="${dayClass}" data-date="${dateStr}" onclick="selectDate('${dateStr}')">
                    <div>${date.date()}</div>${indicatorsHTML}
                 </div>`;
        date.add(1, 'day');
    }
    calendarEl.innerHTML = html;
}

function changeMonth(direction) {
    currentMonth.add(direction, 'month');
    renderCalendar();

    const firstDayStr = currentMonth.clone().startOf('month').format('YYYY-MM-DD');
    if (allShows.some(show => show.show_date >= firstDayStr)) {
        selectDate(firstDayStr);
    } else {
        const showsThisMonth = allShows.filter(show => {
            const sd = moment(show.show_date);
            return sd.month() === currentMonth.month() && sd.year() === currentMonth.year();
        });
        selectDate(showsThisMonth.length > 0 ? showsThisMonth[0].show_date : firstDayStr);
    }
}

function selectDate(date) {
    currentDate = date;
    saveSelectedDate(date);
    const sel = moment(date);
    if (sel.month() !== currentMonth.month() || sel.year() !== currentMonth.year()) {
        currentMonth = sel.clone();
    }
    renderCalendar();
    renderShows(date);
}

function renderShows(date) {
    const filtered = allShows.filter(s => s.show_date === date);
    const container = document.getElementById('showList');
    const showsCount = document.getElementById('showsCount');

    if (filtered.length === 0) {
        showsCount.textContent = '0';
        container.innerHTML = `
            <div class="no-shows-message">
                <div class="no-shows-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                </div>
                <div class="no-shows-title">Tidak Ada Show</div>
                <div class="no-shows-desc">Tidak ada show yang dijadwalkan pada tanggal ini.</div>
            </div>`;
        return;
    }

    const grouped = {};
    filtered.forEach(show => {
        const key = `${show.setlist_name}_${show.show_time}`;
        if (!grouped[key]) {
            grouped[key] = {
                setlist: show.setlist_name, time: show.show_time, date: show.show_date, members: [],
                seenMembers: new Set(),
                isBirthday: show.is_birthday_show, birthdayMember: show.birthday_member,
                isGraduation: show.is_graduation_show, graduationMember: show.graduation_member,
                is_non_show: show.is_non_show || false
            };
        }
        const group = grouped[key];
        const memberKey = show.member_id ?? show.memberName;
        if (show.memberName && !group.seenMembers.has(memberKey)) {
            group.seenMembers.add(memberKey);
            group.members.push({ name: show.memberName, team: show.memberTeam });
        }
    });
    Object.values(grouped).forEach(g => delete g.seenMembers);

    const sortedShows = Object.values(grouped).sort((a, b) => a.time.localeCompare(b.time));
    showsCount.textContent = sortedShows.length;

    const dayNames = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
    const monthNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

    let showsHTML = '<div class="shows-list">';
    sortedShows.forEach(show => {
        const status = getLiveStatus(show.date, show.time, show.is_non_show);
        let headerClass = '', statusBadge = '';
        if (status === 'LIVE') {
            headerClass = 'live-now';
            statusBadge = `<div class="show-status-badge"><span class="show-live-dot"></span>LIVE</div>`;
        } else if (status === 'UPCOMING') {
            headerClass = 'upcoming';
            statusBadge = `<div class="show-status-badge"><span class="show-upcoming-dot"></span>UPCOMING</div>`;
        } else {
            headerClass = 'finished';
            statusBadge = `<div class="show-status-badge">SHOW ENDED</div>`;
        }

        // ✅ Parse tanggal sebagai WIB agar nama hari tidak geser
        const d = new Date(show.date + 'T00:00:00+07:00');
        const dayName = dayNames[d.getDay()];
        const dayNumber = d.getDate();
        const monthName = monthNames[d.getMonth()];
        const year = d.getFullYear();

        let specialBadges = '';
        if (show.isBirthday && show.birthdayMember) {
            specialBadges += `<div class="birthday-badge">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                    <path d="m7.994.013-.595.79a.747.747 0 0 0 .101 1.01V4H5a2 2 0 0 0-2 2v3H2a2 2 0 0 0-2 2v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4a2 2 0 0 0-2-2h-1V6a2 2 0 0 0-2-2H8.5V1.806A.747.747 0 0 0 8.592.802zM4 6a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v.414a.9.9 0 0 1-.646-.268 1.914 1.914 0 0 0-2.708 0 .914.914 0 0 1-1.292 0 1.914 1.914 0 0 0-2.708 0A.9.9 0 0 1 4 6.414zm0 1.414c.49 0 .98-.187 1.354-.56a.914.914 0 0 1 1.292 0c.748.747 1.96.747 2.708 0a.914.914 0 0 1 1.292 0c.374.373.864.56 1.354.56V9H4zM1 11a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v.793l-.354.354a.914.914 0 0 1-1.293 0 1.914 1.914 0 0 0-2.707 0 .914.914 0 0 1-1.292 0 1.914 1.914 0 0 0-2.708 0 .914.914 0 0 1-1.292 0L1 11.793zm11.646 1.854a1.915 1.915 0 0 0 2.354.279V15H1v-1.867c.737.452 1.715.36 2.354-.28a.914.914 0 0 1 1.292 0c.748.748 1.96.748 2.708 0a.914.914 0 0 1 1.292 0c.748.748 1.96.748 2.707 0a.914.914 0 0 1 1.293 0Z"/>
                </svg>STS ${escapeHtml(show.birthdayMember)}</div>`;
        }
        if (show.isGraduation && show.graduationMember) {
            specialBadges += `<div class="graduation-badge">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8.211 2.047a.5.5 0 0 0-.422 0l-7.5 3.5a.5.5 0 0 0 .025.917l7.5 3a.5.5 0 0 0 .372 0L14 7.14V13a1 1 0 0 0-1 1v2h3v-2a1 1 0 0 0-1-1V6.739l.686-.275a.5.5 0 0 0 .025-.917l-7.5-3.5Z"/>
                    <path d="M4.176 9.032a.5.5 0 0 0-.656.327l-.5 1.7a.5.5 0 0 0 .294.605l4.5 1.8a.5.5 0 0 0 .372 0l4.5-1.8a.5.5 0 0 0 .294-.605l-.5-1.7a.5.5 0 0 0-.656-.327L8 10.466 4.176 9.032Z"/>
                </svg>Graduation Show ${escapeHtml(show.graduationMember)}</div>`;
        }

        // Hitung jam selesai berdasarkan durasi show
        const durationMins = getDurationMinutes(show.is_non_show);
        const [startHour, startMin] = show.time.split(':').map(Number);
        const endTotalMin = startHour * 60 + startMin + durationMins;
        const endHour = Math.floor(endTotalMin / 60) % 24;
        const endMin = endTotalMin % 60;
        const endTimeStr = String(endHour).padStart(2,'0') + ':' + String(endMin).padStart(2,'0');

        const setlistParam = encodeURIComponent(show.setlist);
        const dateParam = encodeURIComponent(show.date);
        const timeParam = encodeURIComponent(show.time);
        const slColor = show.is_non_show ? '#22c55e' : getSetlistColor(show.setlist);
        const bgStyle = status === 'LIVE'
            ? 'linear-gradient(135deg, #e60012 0%, #a00010 100%)'
            : status === 'FINISHED'
                ? 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
                : (getSetlistGradient(show.setlist, show.is_non_show) || 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)');
        // dark text on light setlists so the header stays readable
        const lightText = status === 'UPCOMING' && isLightColor(slColor);

        showsHTML += `
            <div class="show-card" data-setlist="${setlistParam}" data-date="${dateParam}" data-time="${timeParam}" onclick="openShowDetail(this)">
                <div class="show-card-header ${headerClass}${lightText ? ' on-light' : ''}" style="background:${bgStyle};">
                    ${statusBadge}
                    <div class="show-card-title"><span>${escapeHtml(show.setlist)}</span>${specialBadges}</div>
                    <div class="show-card-time">
                        <div>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            ${dayName}, ${dayNumber} ${monthName} ${year}
                        </div>
                        <div>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            ${show.time.slice(0, 5)} - ${endTimeStr} WIB
                        </div>
                        <div>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            ${show.members.length > 0 ? show.members.length + ' member' : '-'}
                        </div>
                    </div>
                </div>
                <div class="show-card-members">
                    <p><strong>${(() => { if (show.members.length === 0) return 'Member yang tampil'; const teams = [...new Set(show.members.map(m => m.team && m.team.toLowerCase()).filter(Boolean))]; if (teams.length === 1) { const t = teams[0]; if (t === 'dream') return 'Team Dream'; if (t === 'passion') return 'Team Passion'; if (t === 'love') return 'Team Love'; } return 'Member yang tampil'; })()}:</strong> ${show.members.length > 0 ? show.members.map(m => escapeHtml(m.name)).sort().join(', ') : '<em>Member Belum Diumumkan</em>'}</p>
                </div>
            </div>`;
    });
    showsHTML += '</div>';
    container.innerHTML = showsHTML;
}

function openShowDetail(element) {
    const setlist = element.getAttribute('data-setlist');
    const date = element.getAttribute('data-date');
    const time = element.getAttribute('data-time');
    localStorage.setItem('jkt48_selected_setlist', setlist);
    localStorage.setItem('jkt48_selected_date', date);
    localStorage.setItem('jkt48_selected_time', time);
    window.location.href = `liveshow.html?setlist=${setlist}&date=${date}&time=${time}`;
}

// Auto-update status show setiap 30 detik
setInterval(() => { if (allShows.length > 0) renderShows(currentDate); }, 30000);

// ============= CEK PERGANTIAN HARI DALAM WIB =============
let lastCheckedDate = getTodayWIB();

function checkDayChange() {
    const todayStr = getTodayWIB(); // ✅ Cek berdasarkan WIB
    if (lastCheckedDate !== todayStr) {
        console.log('Hari berganti (WIB) dari', lastCheckedDate, 'ke', todayStr);
        lastCheckedDate = todayStr;
        currentDate = todayStr;
        currentMonth = moment().utcOffset(7 * 60);
        renderCalendar();
        renderShows(currentDate);
    }
}

setInterval(checkDayChange, 60000);

// ============= SCHEDULE TEPAT TENGAH MALAM WIB =============
function scheduleMidnightUpdate() {
    const nowWIB = moment().utcOffset(7 * 60);
    const midnightWIB = nowWIB.clone().add(1, 'day').startOf('day');
    const msUntilMidnight = midnightWIB.diff(nowWIB);

    console.log('Next midnight WIB in', Math.round(msUntilMidnight / 1000 / 60), 'menit');

    setTimeout(() => {
        console.log('Tengah malam WIB! Update ke hari baru...');
        const todayStr = getTodayWIB();
        lastCheckedDate = todayStr;
        currentDate = todayStr;
        currentMonth = moment().utcOffset(7 * 60);
        renderCalendar();
        renderShows(currentDate);
        scheduleMidnightUpdate(); // Schedule tengah malam berikutnya
    }, msUntilMidnight);
}

document.addEventListener('DOMContentLoaded', () => {
    loadSchedule();
    scheduleMidnightUpdate();
    // Set header height CSS var for landscape layout
    function setHeaderHeight(){
        const h = document.querySelector('.main-header');
        if(h) document.documentElement.style.setProperty('--header-h', h.offsetHeight+'px');
    }
    setHeaderHeight();
    window.addEventListener('resize', setHeaderHeight);
    new ResizeObserver(setHeaderHeight).observe(document.querySelector('.main-header'));
});
