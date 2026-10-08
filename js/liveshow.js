const SUPABASE_URL = "https://hypbqiyrxubbvpisgjhq.supabase.co";
const SUPABASE_KEY = "sb_publishable_pD27IltTJKOW_mpglb9o2A_S6sMYmY9";

// Global variables
let countdownInterval = null;
let autoRefreshInterval = null;

function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const setlist = params.get('setlist') || '';
    const date = params.get('date') || '';
    const time = params.get('time') || '';
    return { setlist, date, time };
}

const { setlist: SETLIST_NAME, date: SHOW_DATE, time: SHOW_TIME } = getUrlParams();
const SOURCE_PAGE = new URLSearchParams(window.location.search).get('source') || '';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const SETLIST_COLORS = {
  'Te Wo Tsunaginagara':     { from: '#FF69B4', to: '#c0407a' },
  'Te wo Tsunaginagara':     { from: '#FF69B4', to: '#c0407a' },
  'Cara Meminum Ramune':     { from: '#00CED1', to: '#008b8d' },
  'Ramune no Nomikata':      { from: '#00CED1', to: '#008b8d' },
  'Pertaruhan Cinta':        { from: '#D30000', to: '#900603' },
  'Pajama Drive':            { from: '#00006d', to: '#000045' },
  // Non-Show Activity
  'non_show':                { from: '#3b82f6', to: '#1d4ed8' },
  // Team Shows
  'Passion 200%':            { from: '#f69220', to: '#c4711a' },
  'Passion 200% [SHONICHI]': { from: '#f69220', to: '#c4711a' },
  'Dream bakudan':              { from: '#00a4a5', to: '#007b7c' },
  'Dream bakudan [SHONICHI]':   { from: '#00a4a5', to: '#007b7c' },
  'Love 200%':               { from: '#e20785', to: '#a80562' },
  'Love 200% [SHONICHI]':    { from: '#e20785', to: '#a80562' },
  'ITADAKI♥LOVE':            { from: '#e20785', to: '#a80562' },
};

function getSetlistGradient(setlistName, isNonShow) {
  if (isNonShow) {
    const col = SETLIST_COLORS['non_show'];
    return `linear-gradient(135deg, ${col.from} 0%, ${col.to} 100%)`;
  }
  const col = SETLIST_COLORS[setlistName];
  if (col) return `linear-gradient(135deg, ${col.from} 0%, ${col.to} 100%)`;
  const lower = (setlistName || '').toLowerCase();
  if (lower.includes('passion')) return `linear-gradient(135deg, #f69220 0%, #c4711a 100%)`;
  if (lower.includes('dream')) return `linear-gradient(135deg, #00a4a5 0%, #007b7c 100%)`;
  if (lower.includes('love')) return `linear-gradient(135deg, #e20785 0%, #a80562 100%)`;
  return null;
}

const SHOW_DURATION_MINUTES = 150;       // Durasi show biasa
const EVENT_DURATION_MINUTES = 150;      // Durasi event (non-show)
const PRE_SHOW_BUFFER_MINUTES = 15; // Live mulai 15 menit sebelum jam tayang

function getDurationMinutes(isNonShow) {
    return isNonShow ? EVENT_DURATION_MINUTES : SHOW_DURATION_MINUTES;
}

function getLiveStatus(show_date, show_time, isNonShow = false) {
    if (!show_date || !show_time) return 'FINISHED';
    const now = new Date();
    const showStart = parseWIB(show_date, show_time);
    
    // Live dimulai 15 menit sebelum jam tayang
    const liveStart = new Date(showStart.getTime() - PRE_SHOW_BUFFER_MINUTES * 60000);
    const liveEnd = new Date(showStart.getTime() + getDurationMinutes(isNonShow) * 60000);
    
    if (now < liveStart) return 'UPCOMING';
    if (now >= liveStart && now <= liveEnd) return 'LIVE';
    return 'FINISHED';
}

(function initializeTheme() {
  const savedTheme = localStorage.getItem('jkt48_theme') || 'light';
  const html = document.documentElement;
  const body = document.body;
  if (savedTheme === 'dark') {
    html.classList.add('dark');
    body.classList.add('dark');
  } else {
    html.classList.remove('dark');
    body.classList.remove('dark');
  }
})();

function getSetlistBannerUrl(setlistName) {
  const bannerMap = {
    'Te wo Tsunaginagara': 'banner/te_wo_tsunaginagara.jpg',
    
    'Pertaruhan Cinta': 'banner/pertaruhan_cinta.jpg',
    
    'Pajama Drive': 'banner/pajama_drive.jpg',
    
    'Ramune no Nomikata': 'banner/ramune_no_nomikata.jpg',
    
    "Passion 200%": "banner/passion.jpg",
    
    "DREAM BAKUDAN": "banner/dream.jpg",
    
    "ITADAKI♥LOVE": "banner/love.jpg",
    "ITADAKI♥LOVE [SHONICHI]": "banner/love.jpg"
  };
  
  const normalizedName = setlistName.trim();
  
  // Coba exact match dulu
  if (bannerMap[normalizedName]) {
    return bannerMap[normalizedName];
  }
  
  // Kalau gak ada, coba cari yang mirip (case-insensitive & partial match)
  const lowerName = normalizedName.toLowerCase();
  
  if (lowerName.includes('ramune')) {
    return 'banner/ramune_no_nomikata.jpg';
  }
  if (lowerName.includes('tsunagi')) {
    return 'banner/te_wo_tsunaginagara.jpg';
  }
  if (lowerName.includes('pertaruhan') || lowerName.includes('cinta')) {
    return 'banner/pertaruhan_cinta.jpg';
  }
  if (lowerName.includes('pajama')) {
    return 'banner/pajama_drive.jpg';
  }
  if (lowerName.includes('passion')) {
    return 'banner/passion.jpg';
  }
    if (lowerName.includes('itadaki')) {
    return 'banner/love.jpg';
  }
  if (lowerName.includes('bakudan') || lowerName.includes('dream')) {
    return 'banner/dream.jpg';
  }
  
  return null;
}

function getMemberPhotoUrl(memberName) {
  const formattedName = memberName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  return `img/${formattedName}.jpg`;
}

function adjustColor(color, amount) {
  const num = parseInt(color.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
  const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

function handleBannerError(img) {
  // Coba fallback ke JKT48_FIGHT.jpg dulu
  if (!img.dataset.usedFallback) {
    img.dataset.usedFallback = '1';
    img.src = 'banner/JKT48_FIGHT.jpg';
    return;
  }
  // Kalau JKT48_FIGHT.jpg juga gagal, tampilkan teks
  const container = img.parentElement;
  container.innerHTML = `
    <div class="banner-fallback">
      ${escapeHtml(SETLIST_NAME)}
    </div>
  `;
}

async function loadData() {
  if (!SETLIST_NAME || !SHOW_DATE) {
    showError('Data tidak lengkap. Silakan kembali ke halaman jadwal.');
    return;
  }
  try {
    let query = db
      .from('setlist_performance')
      .select(`
        *,
        members(id, name, gen, team, status)
      `)
      .eq('setlist_name', SETLIST_NAME)
      .eq('show_date', SHOW_DATE);
    
    if (SHOW_TIME) {
      const formattedTime = SHOW_TIME.includes(':') ? SHOW_TIME : `${SHOW_TIME}:00`;
      query = query.eq('show_time', formattedTime);
    }
    
    const { data: shows, error: showsError } = await query;
    
    if (showsError) throw showsError;
    
    if (!shows || shows.length === 0) {
      const retryQuery = db
        .from('setlist_performance')
        .select(`
          *,
          members(id, name, gen, team, status)
        `)
        .eq('setlist_name', SETLIST_NAME)
        .eq('show_date', SHOW_DATE);
      
      const { data: retryShows, error: retryError } = await retryQuery;
      if (retryError) throw retryError;
      
      if (!retryShows || retryShows.length === 0) {
        showNoShowsMessage();
        return;
      }
      renderShowData(retryShows);
    } else {
      renderShowData(shows);
    }
  } catch (err) {
    console.error('Error:', err);
    
    // Better error messages
    if (err.message && err.message.includes('Failed to fetch')) {
      showError('Koneksi internet terputus. Silakan periksa koneksi Anda dan coba lagi.');
    } else if (err.code === 'PGRST116') {
      showError('Data show tidak ditemukan di database.');
    } else {
      showError('Gagal memuat data show. Silakan coba lagi atau periksa koneksi internet.');
    }
  }
}

async function renderShowData(shows) {
  const showData = shows || [];
  const firstShow = showData[0];
  
  if (!firstShow) {
    showNoShowsMessage();
    return;
  }
  
  const isBirthdayShow = firstShow.is_birthday_show || false;
  const birthdayMember = firstShow.birthday_member || null;
  const isGraduationShow = firstShow.is_graduation_show || false;
  const graduationMember = firstShow.graduation_member || null;
  const isNonShow = firstShow.is_non_show || false;
  const showTime = firstShow.show_time || '';
  
  const membersData = showData.map(show => show.members).filter(Boolean);
  const uniqueMembers = Array.from(
    new Map(membersData.map(m => [m.id, m])).values()
  );
  
  renderPage(firstShow, showTime, isBirthdayShow, birthdayMember, isGraduationShow, graduationMember, uniqueMembers, isNonShow);
}

function renderPage(showData, showTime, isBirthdayShow, birthdayMember, isGraduationShow, graduationMember, membersData, isNonShow = false) {
  const date = new Date(SHOW_DATE);
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const formattedDate = `${dayNames[date.getDay()]}, ${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  const displayTime = showTime ? showTime.slice(0, 5) : '-';
  
  // Hitung jam selesai
  let displayEndTime = '';
  if (showTime) {
    const [sh, sm] = showTime.split(':').map(Number);
    const dur = isNonShow ? EVENT_DURATION_MINUTES : SHOW_DURATION_MINUTES;
    const endTotal = sh * 60 + sm + dur;
    const eh = Math.floor(endTotal / 60) % 24;
    const em = endTotal % 60;
    displayEndTime = String(eh).padStart(2,'0') + ':' + String(em).padStart(2,'0');
  }
  
  const status = getLiveStatus(SHOW_DATE, showTime, isNonShow);
  
  let statusBadge = '';
  let headerClass = status.toLowerCase();
  let watchLiveButton = '';
  let countdownHTML = '';
  
  if (status === 'UPCOMING') {
    statusBadge = `<div class="status-badge-main"><span class="upcoming-dot-main"></span>UPCOMING</div>`;
    
    // Countdown ke waktu LIVE (15 menit sebelum jam tayang)
    const showStart = parseWIB(SHOW_DATE, showTime);
    const liveStart = new Date(showStart.getTime() - PRE_SHOW_BUFFER_MINUTES * 60000);
    
    countdownHTML = `
      <div class="countdown-container">
        <div class="countdown-title">Live dimulai dalam:</div>
        <div class="countdown-timer" id="countdown">
          <div class="countdown-item"><div class="countdown-value" id="days">0</div><div class="countdown-label">Hari</div></div>
          <div class="countdown-item"><div class="countdown-value" id="hours">0</div><div class="countdown-label">Jam</div></div>
          <div class="countdown-item"><div class="countdown-value" id="minutes">0</div><div class="countdown-label">Menit</div></div>
          <div class="countdown-item"><div class="countdown-value" id="seconds">0</div><div class="countdown-label">Detik</div></div>
        </div>
      </div>`;
  } else if (status === 'LIVE') {
    statusBadge = `<div class="status-badge-main"><span class="live-dot-main"></span>LIVE</div>`;
    watchLiveButton = `<button class="watch-live-btn" onclick="window.open('https://www.idn.app', '_blank')"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>Tonton Live di IDN App</button>`;
  } else {
    statusBadge = '<div class="status-badge-main">SHOW ENDED</div>';
  }
  
  let displayTitle = SETLIST_NAME || 'Show JKT48';
  let specialBadges = '';
  
  if (isBirthdayShow && birthdayMember) {
    displayTitle += ` (STS ${birthdayMember})`;
    specialBadges += `<div class="birthday-badge-header"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="m7.994.013-.595.79a.747.747 0 0 0 .101 1.01V4H5a2 2 0 0 0-2 2v3H2a2 2 0 0 0-2 2v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4a2 2 0 0 0-2-2h-1V6a2 2 0 0 0-2-2H8.5V1.806A.747.747 0 0 0 8.592.802zM4 6a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v.414a.9.9 0 0 1-.646-.268 1.914 1.914 0 0 0-2.708 0 .914.914 0 0 1-1.292 0 1.914 1.914 0 0 0-2.708 0A.9.9 0 0 1 4 6.414zm0 1.414c.49 0 .98-.187 1.354-.56a.914.914 0 0 1 1.292 0c.748.747 1.96.747 2.708 0a.914.914 0 0 1 1.292 0c.374.373.864.56 1.354.56V9H4zM1 11a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v.793l-.354.354a.914.914 0 0 1-1.293 0 1.914 1.914 0 0 0-2.707 0 .914.914 0 0 1-1.292 0 1.914 1.914 0 0 0-2.708 0 .914.914 0 0 1-1.292 0L1 11.793zm11.646 1.854a1.915 1.915 0 0 0 2.354.279V15H1v-1.867c.737.452 1.715.36 2.354-.28a.914.914 0 0 1 1.292 0c.748.748 1.96.748 2.708 0a.914.914 0 0 1 1.292 0c.748.748 1.96.748 2.707 0a.914.914 0 0 1 1.293 0Z"/></svg>Birthday Show ${birthdayMember}</div>`;
  }
  
  if (isGraduationShow && graduationMember) {
    displayTitle += ` (Graduation ${graduationMember})`;
    specialBadges += `<div class="graduation-badge-header"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8.211 2.047a.5.5 0 0 0-.422 0l-7.5 3.5a.5.5 0 0 0 .025.917l7.5 3a.5.5 0 0 0 .372 0L14 7.14V13a1 1 0 0 0-1 1v2h3v-2a1 1 0 0 0-1-1V6.739l.686-.275a.5.5 0 0 0 .025-.917l-7.5-3.5Z"/><path d="M4.176 9.032a.5.5 0 0 0-.656.327l-.5 1.7a.5.5 0 0 0 .294.605l4.5 1.8a.5.5 0 0 0 .372 0l4.5-1.8a.5.5 0 0 0 .294-.605l-.5-1.7a.5.5 0 0 0-.656-.327L8 10.466 4.176 9.032Z"/></svg>Graduation Show ${graduationMember}</div>`;
  }
  
  const bannerUrl = getSetlistBannerUrl(SETLIST_NAME);
  
  // Banner muncul untuk semua status (LIVE / UPCOMING / FINISHED)
  // badge status nempel di atas gambar banner (bukan di luar kartu)
  const bannerHTML = bannerUrl ? `
    <div class="setlist-banner-container">
      <img src="${bannerUrl}" 
           alt="Banner ${escapeHtml(SETLIST_NAME)}" 
           class="setlist-banner" 
           onload="this.classList.add('loaded')"
           onerror="handleBannerError(this)">
      ${statusBadge}
    </div>` : statusBadge;
  
  const slColor = isNonShow ? '#22c55e' : (SETLIST_COLORS[SETLIST_NAME] ? SETLIST_COLORS[SETLIST_NAME].from : '#3b82f6');
  const lightText = status === 'UPCOMING' && isLightColor(slColor);

  document.getElementById('container').innerHTML = `
    <div class="show-content-wrapper">
      <div class="show-left-panel">
        <div class="live-show-header ${headerClass}${lightText ? ' on-light' : ''}" style="background:${status === 'LIVE' ? '#e60012' : status === 'FINISHED' ? '#6b7280' : (getSetlistGradient(SETLIST_NAME, isNonShow) || '#2563eb')}">
          ${bannerHTML}
          <h1>${escapeHtml(displayTitle)}</h1>
          ${specialBadges}
          <div class="live-show-date-time">
            <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>${formattedDate}</div>
            <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>${displayTime}${displayEndTime ? ' - ' + displayEndTime : ''} WIB</div>
            <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>${membersData.length > 0 ? membersData.length + ' member' : '-'}</div>
          </div>
          ${countdownHTML}
          ${watchLiveButton}
        </div>
      </div>
      <div class="show-right-panel">
        <div class="members-section">
          <div class="section-title"><span>${(() => { if (membersData.length === 0) return 'Member yang Tampil'; const teams = [...new Set(membersData.map(m => m.team && m.team.toLowerCase()).filter(Boolean))]; if (teams.length === 1) { const t = teams[0]; if (t === 'dream') return 'Team Dream'; if (t === 'passion') return 'Team Passion'; if (t === 'love') return 'Team Love'; } return 'Member yang Tampil'; })()}</span><span class="members-count">${membersData.length}</span></div>
          <div class="members-grid" id="membersGrid">${renderMembersGrid(membersData, birthdayMember, graduationMember)}</div>
        </div>
      </div>
    </div>`;
  
  if (status === 'UPCOMING') {
    const showStart = parseWIB(SHOW_DATE, showTime);
    const liveStart = new Date(showStart.getTime() - PRE_SHOW_BUFFER_MINUTES * 60000);
    startCountdown(liveStart);
  }
  
  // Setup auto-refresh only for UPCOMING or LIVE shows
  setupAutoRefresh(status);
}

function renderMembersGrid(membersData, birthdayMember, graduationMember) {
  if (!membersData || membersData.length === 0) return `
    <div style="grid-column:1/-1;text-align:center;padding:40px 20px;color:#8b5cf6;">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:12px;opacity:0.6"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="12" y1="15" x2="12" y2="15"/></svg>
      <div style="font-size:15px;font-weight:700;margin-bottom:6px;">Member Belum Diumumkan</div>
      <div style="font-size:13px;opacity:0.8;">Lineup member untuk show ini akan segera diumumkan.</div>
    </div>`;
  
  const sortedMembers = [...membersData].sort((a, b) => a.name.localeCompare(b.name));
  
  return sortedMembers.map(member => {
    const isBirthdayStar = birthdayMember && member.name.toLowerCase().includes(birthdayMember.toLowerCase());
    const isGraduationStar = graduationMember && member.name.toLowerCase().includes(graduationMember.toLowerCase());
    const photoUrl = getMemberPhotoUrl(member.name);
    
    let cardClass = 'member-card';
    if (SOURCE_PAGE === 'show') cardClass += ' no-click';
    if (isBirthdayStar) cardClass += ' birthday-member-card';
    if (isGraduationStar) cardClass += ' graduation-member-card';
    
    let borderColor = GEN_COLORS[member.gen] || '#6366f1';
    if (isBirthdayStar) borderColor = '#f59e0b';
    if (isGraduationStar) borderColor = '#7c3aed';
    
    // Security: use a data-attribute instead of building an inline onclick string.
    // Interpolating member.name directly into an onclick="...('...')" string let a member
    // name containing a single quote break out of the JS string and inject arbitrary script.
    const clickable = SOURCE_PAGE !== 'show';
    const cardStyle = SOURCE_PAGE === 'show' ? ' style="cursor:default"' : '';

return `<div class="${cardClass}"${clickable ? ` data-member-name="${escapeHtml(member.name)}" role="button" tabindex="0"` : ''}${cardStyle}>
              <div class="member-avatar">
                <img src="${photoUrl}" 
                     alt="Foto ${escapeHtml(member.name)} - Gen ${escapeHtml(member.gen)}" 
                     loading="lazy" 
                     onload="this.classList.add('loaded')"
                     onerror="this.onerror=null; this.style.display='none'; this.parentNode.style.background='linear-gradient(135deg, ${GEN_COLORS[member.gen] || '#6366f1'}, ${adjustColor(GEN_COLORS[member.gen] || '#6366f1', -20)})'; this.parentNode.innerHTML='<div style=width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:white;font-size:24px;font-weight:bold>${escapeHtml(member.name.charAt(0))}</div>'">
              </div>
              <div class="member-info${isLightColor(borderColor) ? ' on-light' : ''}" style="background:${borderColor}">
                <div class="member-name">${escapeHtml(member.name)}</div>
                <div class="member-gen">Gen ${escapeHtml(member.gen) || '?'} · ${escapeHtml(member.team) || 'JKT48'}</div>
              </div>
            </div>`;
  }).join('');
}

// Event delegation replaces inline onclick handlers for member cards (see renderMembersGrid).
// Attached once; safe to call multiple times since {once:false} listeners on a stable ancestor.
document.addEventListener('DOMContentLoaded', function () {
  document.addEventListener('click', function (e) {
    const card = e.target.closest('[data-member-name]');
    if (card) openMemberPage(card.getAttribute('data-member-name'));
  });
  document.addEventListener('keypress', function (e) {
    if (e.key !== 'Enter') return;
    const card = e.target.closest('[data-member-name]');
    if (card) openMemberPage(card.getAttribute('data-member-name'));
  });
});

function openMemberPage(memberName) {
  window.location.href = 'riwayat.html?member=' + encodeURIComponent(memberName);
}

function showNoShowsMessage() {
  document.getElementById('container').innerHTML = `<div class="no-shows-message"><div class="no-shows-icon"><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg></div><div class="no-shows-title">Show Tidak Ditemukan</div><div class="no-shows-desc">Tidak ditemukan show untuk "${escapeHtml(SETLIST_NAME)}" pada tanggal ${escapeHtml(SHOW_DATE)}${SHOW_TIME ? ` jam ${escapeHtml(SHOW_TIME)}` : ''}.<br><br>Pastikan Anda memilih show dari halaman jadwal.</div><button onclick="goBack()" style="background:#e60012;color:#fff;border:none;border-radius:12px;padding:12px 24px;font-size:14px;font-weight:600;cursor:pointer;margin-top:20px">Kembali ke Jadwal</button></div>`;
}

function showError(message) {
  document.getElementById('container').innerHTML = `<div class="no-shows-message"><div class="no-shows-icon"><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg></div><div class="no-shows-title">Terjadi Kesalahan</div><div class="no-shows-desc">${escapeHtml(message)}</div><button onclick="goBack()" style="background:#e60012;color:#fff;border:none;border-radius:12px;padding:12px 24px;font-size:14px;font-weight:600;cursor:pointer;margin-top:20px">Kembali ke Jadwal</button></div>`;
}

function goBack() {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.replace('index.html');
  }
}

function startCountdown(targetDate) {
  // Clear existing countdown
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
  
  countdownInterval = setInterval(() => {
    const now = new Date().getTime();
    const distance = targetDate - now;
    
    if (distance < 0) {
      clearInterval(countdownInterval);
      countdownInterval = null;
      loadData(); // Reload when countdown ends
      return;
    }
    
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    
    if (daysEl) daysEl.textContent = days.toString().padStart(2, '0');
    if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0');
    if (minutesEl) minutesEl.textContent = minutes.toString().padStart(2, '0');
    if (secondsEl) secondsEl.textContent = seconds.toString().padStart(2, '0');
  }, 1000);
}

function setupAutoRefresh(status) {
  // Clear existing auto-refresh
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
    autoRefreshInterval = null;
  }
  
  // Only auto-refresh for UPCOMING or LIVE shows
  if (status === 'UPCOMING' || status === 'LIVE') {
    autoRefreshInterval = setInterval(() => {
      loadData();
    }, 30000); // 30 seconds
  }
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
    autoRefreshInterval = null;
  }
});

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
  loadData();
  // CSS var untuk tinggi header (landscape full-screen)
  function setLvHeaderH(){
    const h = document.querySelector('.main-header');
    if(h) document.documentElement.style.setProperty('--lv-header-h', h.offsetHeight+'px');
  }
  setLvHeaderH();
  window.addEventListener('resize', setLvHeaderH);
  new ResizeObserver(setLvHeaderH).observe(document.querySelector('.main-header'));
});
