const SUPABASE_URL = "https://hypbqiyrxubbvpisgjhq.supabase.co";
const SUPABASE_KEY = "sb_publishable_pD27IltTJKOW_mpglb9o2A_S6sMYmY9";

const urlParams = new URLSearchParams(window.location.search);
const MEMBER_NAME = urlParams.get('member');

const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

function escapeForJsAttr(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const LIVE_CONFIG = {
    BEFORE_MINUTES: 15,
    DURATION_MINUTES: 150
};

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

function getLiveStatus(showDate, showTime) {
    if (!showDate || !showTime) return 'FINISHED';
    
    const now = new Date();
    const showDateTime = parseWIB(showDate, showTime);
    
    const liveStart = new Date(showDateTime.getTime() - (LIVE_CONFIG.BEFORE_MINUTES * 60 * 1000));
    const liveEnd = new Date(showDateTime.getTime() + (LIVE_CONFIG.DURATION_MINUTES * 60 * 1000));
    
    if (now < liveStart) return 'UPCOMING';
    if (now >= liveStart && now <= liveEnd) return 'LIVE';
    return 'FINISHED';
}

let memberData = null;
let showsData = [];
let currentFilter = 'all';

function getSetlistShortName(setlistName) {
  // Hapus suffix dalam kurung siku seperti [SHONICHI], [TEAM J], dll.
  return setlistName.replace(/\s*\[.*?\]/g, '').trim();
}

function getFilterButtonsHTML() {
  const realShows = showsData.filter(s => !s.is_non_show);
  const eventShows = showsData.filter(s => s.is_non_show);
  const setlists = [...new Set(realShows.map(s => s.setlist_name))];
  let html = `<button class="filter-btn ${currentFilter === 'all' ? 'active' : ''}" onclick="filterShows('all')" data-filter="all">All - ${showsData.length}</button>`;
  
  setlists.forEach(setlist => {
    const count = realShows.filter(s => s.setlist_name === setlist).length;
    const shortName = getSetlistShortName(setlist);
    html += `<button class="filter-btn ${currentFilter === setlist ? 'active' : ''}" onclick="filterShows('${escapeForJsAttr(setlist)}')" data-filter="${escapeHtml(setlist)}">${escapeHtml(shortName)} - ${count}</button>`;
  });
  
  if (eventShows.length > 0) {
    html += `<button class="filter-btn ${currentFilter === 'event' ? 'active' : ''}" onclick="filterShows('event')" data-filter="event">Event - ${eventShows.length}</button>`;
  }
  return html;
}

async function loadData() {
  if (!MEMBER_NAME) {
    showError('Member tidak ditemukan');
    return;
  }

  try {
    const { data: member, error: memberError } = await db
      .from('members')
      .select('*')
      .eq('name', MEMBER_NAME)
      .single();

    if (memberError) {
      if (memberError.code === 'PGRST116') {
        showError('Member tidak ditemukan');
      } else {
        throw memberError;
      }
      return;
    }
    
    memberData = member;
    
    const { data: shows, error: showsError } = await db
      .from('setlist_performance')
      .select('*')
      .eq('member_id', member.id)
      .order('show_date', { ascending: false })
      .order('show_time', { ascending: false });

    if (showsError) throw showsError;
    
    showsData = shows || [];
    
    // Restore filter yang tersimpan
    const savedFilter = sessionStorage.getItem('jkt48_show_filter_' + MEMBER_NAME);
    if (savedFilter) currentFilter = savedFilter;
    
    renderPage();
    
  } catch (err) {
    console.error('Error:', err);
    showError('Gagal memuat data. Coba refresh halaman.');
  }
}

function renderPage() {
  const color = GEN_COLORS[memberData.gen] || '#ec4899';
  const colorDark = adjustColor(color, -20);
  
  document.documentElement.style.setProperty('--gen-color', color);
  document.documentElement.style.setProperty('--gen-color-dark', colorDark);
  document.documentElement.style.setProperty('--gen-on-color', isLightColor(color) ? '#12121a' : '#ffffff');
  
  const realShows = showsData.filter(s => !s.is_non_show);
  const setlists = [...new Set(realShows.map(s => s.setlist_name))];
  const filterButtons = getFilterButtonsHTML();
  
  const graduationInfo = memberData.status === 'graduated' ? 
    `<div style="margin-top: 10px; padding: 8px 16px; background: #1e40af; color: white; border-radius: 12px; font-size: 12px; display: inline-flex; align-items: center; gap: 6px;">
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zM4.5 6.5a.5.5 0 0 1 0-1h5.793L8.146 4.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 7.5H4.5z"/>
      </svg>
      Graduated Member
    </div>` : '';
  
  document.getElementById('container').innerHTML = `
    <div class="member-info">
      <div class="photo-container">
        <img class="photo" 
             src="img/${encodeURIComponent(memberData.name.toLowerCase())}.jpg" 
             loading="lazy"
             decoding="async"
             onerror="this.onerror=null; this.parentNode.innerHTML='<div class=\\'photo-error\\'>${escapeHtml(memberData.name.charAt(0))}</div>';"
             alt="${escapeHtml(memberData.name)}">
      </div>
      <div class="member-name">${escapeHtml(memberData.name)}</div>
      ${graduationInfo}
      <div class="member-stats">
        <div class="stat-item">
          <div class="stat-number">${realShows.length}</div>
          <div class="stat-label">TOTAL SHOW</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">${setlists.length}</div>
          <div class="stat-label">JENIS SETLIST</div>
        </div>
      </div>
      <!-- Filter untuk mobile (akan disembunyikan di desktop lewat CSS) -->
      <div class="filter-section">
        ${filterButtons}
      </div>
    </div>
    
    <div class="content">
      <!-- Filter untuk desktop (NON-SCROLL / diam saja) -->
      <div class="filter-section">
        ${filterButtons}
      </div>
      <div id="showListContainer">
        ${renderShowList()}
      </div>
    </div>
  `;
}

function renderShowList() {
  let filtered = showsData;
  
  if (currentFilter === 'event') {
    filtered = showsData.filter(s => s.is_non_show);
  } else if (currentFilter !== 'all') {
    filtered = showsData.filter(s => s.setlist_name === currentFilter);
  }
  
  const sortedFilteredShows = [...filtered].sort((a, b) => {
    const dateA = new Date(a.show_date + ' ' + a.show_time);
    const dateB = new Date(b.show_date + ' ' + b.show_time);
    return dateA - dateB;
  });
  
  const showsForDisplay = [...filtered].sort((a, b) => {
    const dateA = new Date(a.show_date + ' ' + a.show_time);
    const dateB = new Date(b.show_date + ' ' + b.show_time);
    return dateB - dateA;
  });
  
  if (filtered.length === 0) {
    return `
      <div class="empty-state">
        <div class="empty-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </div>
        <div class="empty-title">Belum Ada Show</div>
        <div class="empty-desc">
          ${currentFilter === 'all' 
            ? 'Belum ada riwayat show yang tercatat untuk member ini' 
            : `Belum ada show dengan setlist "${escapeHtml(currentFilter)}"`
          }
        </div>
      </div>
    `;
  }
  
  return `
    <div class="show-list">
      ${showsForDisplay.map(show => {
        const date = show.show_date ? formatDate(show.show_date) : 'Tanggal tidak tersedia';
        const time = show.show_time ? formatTime(show.show_time) : null;
        const showNumber = sortedFilteredShows.findIndex(s => s.id === show.id) + 1;
        const isLatestShow = showNumber === 1;
        
        const status = getLiveStatus(show.show_date, show.show_time);
        const isLive = status === 'LIVE';
        
        const isMemberBirthday = show.is_birthday_show && show.birthday_member === memberData.name;
        const isMemberGraduation = show.is_graduation_show && show.graduation_member === memberData.name;
        
        let cardClass = 'show-card';
        if (isLive) cardClass += ' live-now';
        
        return `
          <div class="${cardClass}" 
               data-setlist="${escapeHtml(show.setlist_name)}" 
               data-date="${escapeHtml(show.show_date)}" 
               data-time="${escapeHtml(show.show_time || '')}"
               onclick="openShowDetail(this.dataset.setlist, this.dataset.date, this.dataset.time)">
            <div class="show-header">
              <div>
                <div class="show-date">${date}</div>
                ${time ? `
                  <div class="show-time">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    ${time}
                  </div>
                ` : ''}

              </div>
              <div class="badge-container">
                ${isLive ? `
                  <div class="live-badge">
                    <span class="live-dot"></span>
                    LIVE
                  </div>
                ` : ''}
                ${isMemberBirthday ? `
                  <div class="sts-badge">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                      <path d="m7.994.013-.595.79a.747.747 0 0 0 .101 1.01V4H5a2 2 0 0 0-2 2v3H2a2 2 0 0 0-2 2v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4a2 2 0 0 0-2-2h-1V6a2 2 0 0 0-2-2H8.5V1.806A.747.747 0 0 0 8.592.802zM4 6a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v.414a.9.9 0 0 1-.646-.268 1.914 1.914 0 0 0-2.708 0 .914.914 0 0 1-1.292 0 1.914 1.914 0 0 0-2.708 0A.9.9 0 0 1 4 6.414zm0 1.414c.49 0 .98-.187 1.354-.56a.914.914 0 0 1 1.292 0c.748.747 1.96.747 2.708 0a.914.914 0 0 1 1.292 0c.374.373.864.56 1.354.56V9H4zM1 11a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v.793l-.354.354a.914.914 0 0 1-1.293 0 1.914 1.914 0 0 0-2.707 0 .914.914 0 0 1-1.292 0 1.914 1.914 0 0 0-2.708 0 .914.914 0 0 1-1.292 0L1 11.793zm11.646 1.854a1.915 1.915 0 0 0 2.354.279V15H1v-1.867c.737.452 1.715.36 2.354-.28a.914.914 0 0 1 1.292 0c.748.748 1.96.748 2.708 0a.914.914 0 0 1 1.292 0c.748.748 1.96.748 2.707 0a.914.914 0 0 1 1.293 0Z"/>
                    </svg>
                    STS
                  </div>
                ` : ''}
                ${isMemberGraduation ? `
                  <div class="lastshow-badge">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8.211 2.047a.5.5 0 0 0-.422 0l-7.5 3.5a.5.5 0 0 0 .025.917l7.5 3a.5.5 0 0 0 .372 0L14 7.14V13a1 1 0 0 0-1 1v2h3v-2a1 1 0 0 0-1-1V6.739l.686-.275a.5.5 0 0 0 .025-.917l-7.5-3.5Z"/>
                      <path d="M4.176 9.032a.5.5 0 0 0-.656.327l-.5 1.7a.5.5 0 0 0 .294.605l4.5 1.8a.5.5 0 0 0 .372 0l4.5-1.8a.5.5 0 0 0 .294-.605l-.5-1.7a.5.5 0 0 0-.656-.327L8 10.466 4.176 9.032Z"/>
                    </svg>
                    Graduation Show
                  </div>
                ` : ''}
                <div class="show-badge">#${showNumber}</div>
              </div>
            </div>
            <div class="show-setlist">
              ${escapeHtml(show.setlist_name)}
              ${show.is_birthday_show && show.birthday_member ? ` (STS ${escapeHtml(show.birthday_member)})` : ''}
              ${show.is_graduation_show && show.graduation_member ? ` (Graduation ${escapeHtml(show.graduation_member)})` : ''}
            </div>
            ${status === 'FINISHED' ? `<div class="end-badge">END</div>` : ''}
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function filterShows(filter) {
  currentFilter = filter;
  sessionStorage.setItem('jkt48_show_filter_' + MEMBER_NAME, filter);

  // Hapus class active dari semua tombol filter
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  // Aktifkan tombol yang sesuai dengan filter
  const activeBtn = document.querySelector(`.filter-btn[data-filter="${filter}"]`);
  if (activeBtn) activeBtn.classList.add('active');

  // Render ulang daftar show
  document.getElementById('showListContainer').innerHTML = renderShowList();
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('id-ID', options);
}

function formatTime(timeString, isNonShow) {
  if (!timeString) return null;
  
  const parts = timeString.split(':');
  const hours = parts[0];
  const minutes = parts[1];
  
  // Hitung jam selesai
  const dur = LIVE_CONFIG.DURATION_MINUTES;
  const endTotal = parseInt(hours) * 60 + parseInt(minutes) + dur;
  const eh = String(Math.floor(endTotal / 60) % 24).padStart(2, '0');
  const em = String(endTotal % 60).padStart(2, '0');
  
  return `${hours}:${minutes} - ${eh}:${em} WIB`;
}

function adjustColor(color, amount) {
  const num = parseInt(color.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
  const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

function goBack() {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.replace('index.html');
  }
}

function openShowDetail(setlistName, showDate, showTime) {
  const params = new URLSearchParams();
  params.append('setlist', setlistName);
  params.append('date', showDate);
  if (showTime) {
    params.append('time', showTime);
  }
  params.append('source', 'show');
  window.location.href = `liveshow.html?${params.toString()}`;
}

function showError(message) {
  document.getElementById('container').innerHTML = `
    <div class="content" style="padding:60px 20px;text-align:center">
      <div style="font-size:64px;margin-bottom:20px">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#e60012" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <div style="font-size:18px;font-weight:bold;color:#333;margin-bottom:10px">${message}</div>
      <div style="color:#6b7280;margin-bottom:30px">Data tidak ditemukan atau terjadi kesalahan</div>
      <button onclick="goBack()" style="background:#e60012;color:#fff;border:none;border-radius:12px;padding:12px 24px;font-size:14px;font-weight:600;cursor:pointer">
        Kembali ke Beranda
      </button>
    </div>
  `;
}

window.addEventListener('DOMContentLoaded', () => {
  loadData();
});
