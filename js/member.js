const SUPABASE_URL = "https://hypbqiyrxubbvpisgjhq.supabase.co";
const SUPABASE_KEY = "sb_publishable_pD27IltTJKOW_mpglb9o2A_S6sMYmY9";

const urlParams = new URLSearchParams(window.location.search);
const MEMBER_NAME = urlParams.get('member');

const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let isLoading = true;

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

async function loadMember() {
  if (!MEMBER_NAME) {
    showError('Member tidak ditemukan');
    return;
  }

  try {
    const { data, error } = await db
      .from('members')
      .select('*')
      .eq('name', MEMBER_NAME)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        showError('Member tidak ditemukan');
      } else {
        throw error;
      }
      return;
    }
    
    renderMember(data);
    
  } catch (err) {
    console.error('Error:', err);
    showError('Gagal memuat data. Coba refresh halaman.');
  }
}

function renderMember(member) {
  isLoading = false;
  
  const color = GEN_COLORS[member.gen] || '#ec4899';
  const colorDark = adjustColor(color, -20);

  document.documentElement.style.setProperty('--gen-color', color);
  document.documentElement.style.setProperty('--gen-color-dark', colorDark);
  document.documentElement.style.setProperty('--gen-on-color', isLightColor(color) ? '#12121a' : '#ffffff');
  
  const currentShow = member.show || 0;
  
  const photoHtml = `
    <div class="photo-container">
      <img class="photo" 
           src="img/${encodeURIComponent(member.name.toLowerCase())}.jpg" 
           loading="lazy"
           decoding="async"
           onerror="this.onerror=null; this.parentNode.innerHTML='<div class=\\'photo-error\\'>${escapeHtml(member.name.charAt(0))}</div>';"
           alt="${escapeHtml(member.name)}">
    </div>
  `;
  
  const nextMilestone = Math.ceil(currentShow / 100) * 100;
  const remaining = nextMilestone - currentShow;
  const progress = ((currentShow % 100) / 100) * 100;
  
  let statusClass = 'normal';
  if (remaining === 0) {
    statusClass = 'completed';
  } else if (remaining > 0 && remaining <= 10) {
    statusClass = 'warning';
  } else {
    statusClass = 'normal';
  }
  
  document.getElementById('container').innerHTML = `
    <!-- Header dengan warna generasi dan teks Profile Member + tombol show history -->
    <div class="container-header">
      <div class="profile-title">Profile Member</div>
      <button class="show-history-btn" onclick="window.location.href='riwayat.html?member=${encodeURIComponent(member.name)}'" title="Riwayat Show" aria-label="Riwayat Show">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="9"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      </button>
    </div>
    
    <!-- Main Content - Flex container untuk kiri dan kanan -->
    <div class="main-content">
      <!-- PANEL KIRI: Foto + Progres -->
      <div class="left-panel">
        ${photoHtml}
        <div class="member-name">${escapeHtml(member.name)}</div>
        <div class="panel-title">Progres</div>
        <div class="milestone-card">
          <div class="milestone-header">
            <div class="milestone-title">Progres Milestone</div>
            <div class="milestone-target ${statusClass}">${nextMilestone} show</div>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar-fill" style="width:${progress}%"></div>
            <div class="progress-text">${currentShow} show</div>
          </div>
          <div class="progress-info">
            ${remaining === 0 ? 'Target tercapai!' : `${remaining} show lagi untuk mencapai target`}
          </div>
        </div>
      </div>

      <!-- PANEL KANAN: About + Social Media -->
      <div class="right-panel">
        <div class="panel-title">About</div>
        <div class="info-row">
          <div class="info-label">Nama</div>
          <div class="info-value">${escapeHtml(member.full_name || member.name)}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Tanggal Lahir</div>
          <div class="info-value">${escapeHtml(formatTanggal(member.birth_date))}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Golongan Darah</div>
          <div class="info-value">${escapeHtml(member.blood_type) || '-'}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Horoskop</div>
          <div class="info-value">${escapeHtml(member.zodiac) || '-'}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Tinggi Badan</div>
          <div class="info-value">${member.height ? escapeHtml(member.height) + ' cm' : '-'}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Generasi</div>
          <div class="info-value">${escapeHtml(member.gen)}</div>
        </div>
        ${member.status !== 'trainee' ? `
        <div class="info-row">
          <div class="info-label">Team</div>
          <div class="info-value" style="color:${ member.team && member.team.toLowerCase()==='passion' ? '#f69220' : member.team && member.team.toLowerCase()==='dream' ? '#00a4a5' : member.team && member.team.toLowerCase()==='love' ? '#e20785' : 'inherit' };font-weight:${member.team ? '700' : 'inherit'}">${escapeHtml(member.team) || '-'}</div>
        </div>
        ` : ''}
        
        <!-- SOCIAL MEDIA - Tanpa card -->
        <div class="social-section">
          <div class="social-title">Social Media</div>
          ${member.twitter || member.instagram || member.tiktok ? `
            ${member.twitter ? `
            <a href="https://twitter.com/${encodeURIComponent(member.twitter)}" target="_blank" rel="noopener noreferrer" class="social-link">
              <div class="social-icon twitter">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="18" height="18" fill="currentColor">
                  <path d="M357.2 48L427.8 48 273.6 224.2 455 464 313 464 201.7 318.6 74.5 464 3.8 464 168.7 275.5-5.2 48 140.4 48 240.9 180.9 357.2 48z"/>
                </svg>
              </div>
              <div class="social-info">
                <div class="social-name">Twitter</div>
                <div class="social-handle">@${escapeHtml(member.twitter)}</div>
              </div>
              <div class="social-arrow">→</div>
            </a>
            ` : ''}
            ${member.instagram ? `
            <a href="https://instagram.com/${encodeURIComponent(member.instagram)}" target="_blank" rel="noopener noreferrer" class="social-link">
              <div class="social-icon instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </div>
              <div class="social-info">
                <div class="social-name">Instagram</div>
                <div class="social-handle">@${escapeHtml(member.instagram)}</div>
              </div>
              <div class="social-arrow">→</div>
            </a>
            ` : ''}
            ${member.tiktok ? `
            <a href="https://tiktok.com/@${encodeURIComponent(member.tiktok)}" target="_blank" rel="noopener noreferrer" class="social-link">
              <div class="social-icon tiktok">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
              </div>
              <div class="social-info">
                <div class="social-name">TikTok</div>
                <div class="social-handle">@${escapeHtml(member.tiktok)}</div>
              </div>
              <div class="social-arrow">→</div>
            </a>
            ` : ''}
          ` : `
            <div class="empty-social">
              <p>Social media tidak tersedia untuk member ini</p>
            </div>
          `}
        </div>
      </div>
    </div>

    <!-- Footer - Menyatu dengan konten -->
    <footer class="detail-footer">
      <p>© 2026 Show Theater. Data diperbarui secara real-time</p>
    </footer>
  `;
}

function formatTanggal(dateStr) {
  if (!dateStr) return '-';
  const bulan = [
    'Januari','Februari','Maret','April','Mei','Juni',
    'Juli','Agustus','September','Oktober','November','Desember'
  ];
  const date = new Date(dateStr);
  if (isNaN(date)) return dateStr;
  return `${date.getDate()} ${bulan[date.getMonth()]} ${date.getFullYear()}`;
}

function adjustColor(color, amount) {
  const num = parseInt(color.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
  const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

function goBack() {
  if (isLoading) return;
  
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.replace('index.html');
  }
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

function showError(message) {
  isLoading = false;
  
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
      <div style="color:#6b7280;margin-bottom:30px">Member tidak ditemukan atau terjadi kesalahan</div>
      <button onclick="goBack()" style="background:#e60012;color:#fff;border:none;border-radius:12px;padding:12px 24px;font-size:14px;font-weight:600;cursor:pointer">
        Kembali ke Beranda
      </button>
    </div>
  `;
}

window.addEventListener('DOMContentLoaded', () => {
  loadMember();
  // CSS var untuk tinggi header (landscape full-screen)
  function setMbHeaderH(){
    const h = document.querySelector('.main-header');
    if(h) document.documentElement.style.setProperty('--mb-header-h', h.offsetHeight+'px');
  }
  setMbHeaderH();
  window.addEventListener('resize', setMbHeaderH);
  new ResizeObserver(setMbHeaderH).observe(document.querySelector('.main-header'));
});
