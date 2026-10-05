const SUPABASE_URL = "https://hypbqiyrxubbvpisgjhq.supabase.co";
const SUPABASE_KEY = "sb_publishable_pD27IltTJKOW_mpglb9o2A_S6sMYmY9";

const SETLIST_DATA = {
    ramune: {id: 'ramune', title: 'Cara Meminum Ramune', members: {}},
    tte: {id: 'tte', title: 'Te Wo Tsunaginagara', members: {}},
    pertaruhan: {id: 'pertaruhan', title: 'Pertaruhan Cinta', members: {}},
    pajama: {id: 'pajama', title: 'Pajama Drive', members: {}}
};

const SHOW_DURATION_MINUTES = 150;       // Durasi show biasa
const EVENT_DURATION_MINUTES = 150;      // Durasi event (non-show)
const PRE_SHOW_BUFFER_MINUTES = 15; // Live mulai 15 menit sebelum jam tayang

function getDurationMinutes(isNonShow) {
    return isNonShow ? EVENT_DURATION_MINUTES : SHOW_DURATION_MINUTES;
}

// Helper: parse show datetime as WIB (UTC+7)

const MILESTONE = 1000;
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let members = [], 
    membersMap = {},
    allMembersData = [], 
    currentGen = 'all', 
    currentTeam = 'all', 
    searchQuery = '', 
    isDataLoaded = false, 
    scrollSaveTimeout, 
    currentSetlistView = null, 
    currentLiveShowData = null, 
    liveShowRefreshInterval = null,
    latestUpdateTime = null,
    allShowsData = [];

// Member dianggap keluar dari grup kalau sudah graduated ATAU resigned (dua status terpisah),
// termasuk kalau tanggal efektif graduation_date/resign_date sudah lewat meskipun admin
// belum sempat buka panel admin untuk finalize (dihitung real-time di sini)
function isMemberInactive(m) {
    if (m.is_graduated || m.is_resigned) return true;
    var today = new Date();
    var todayStr = today.getFullYear() + '-' + String(today.getMonth()+1).padStart(2,'0') + '-' + String(today.getDate()).padStart(2,'0');
    if (m.graduation_date && m.graduation_date <= todayStr) return true;
    if (m.resign_date && m.resign_date <= todayStr) return true;
    return false;
}

// ============= FUNGSI LIVE STATUS =============
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

// ============= SEARCH CLEAR BUTTON =============
function toggleClearBtn() {
    const btn = document.getElementById('searchClearBtn');
    const icon = document.querySelector('.search-icon');
    const input = document.getElementById('searchInput');
    const hasValue = input.value.length > 0;
    if (btn) btn.classList.toggle('visible', hasValue);
    if (icon) icon.style.display = hasValue ? 'none' : 'flex';
}

function clearSearch() {
    document.getElementById('searchInput').value = '';
    toggleClearBtn();
    searchMember();
    document.getElementById('searchInput').focus();
}

// ============= FUNGSI THEME =============
(function initializeTheme() {
    const savedTheme = localStorage.getItem('jkt48_theme') || 'light';
    const html = document.documentElement;
    const body = document.body;
    if (savedTheme === 'dark') {
        html.classList.add('dark');
        body.classList.add('dark');
        updateThemeIcon('dark');
    } else {
        html.classList.remove('dark');
        body.classList.remove('dark');
        updateThemeIcon('light');
    }
})();

function updateThemeIcon(theme) {
    const icon = document.getElementById('themeIcon');
    if (!icon) return;
    if (theme === 'dark') {
        icon.innerHTML = '<path d="M12,17a5,5,0,1,1,5-5A5,5,0,0,1,12,17Zm0-8a3,3,0,1,0,3,3A3,3,0,0,0,12,9Zm0-4a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41L6.34,5A1,1,0,0,0,4.93,6.34ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm.64,5.66a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71a1,1,0,0,0-1.41-1.41ZM12,19a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19Zm6.36-2.34a1,1,0,0,0-1.41,1.41l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-3.64-3.95a1,1,0,0,0,.7.29,1,1,0,0,0,.71-1.7l-.71-.71a1,1,0,0,0-1.41,1.41Z"/>';
    } else {
        icon.innerHTML = '<path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z"/>';
    }
}

function toggleTheme() {
    const html = document.documentElement;
    const body = document.body;
    const isDark = body.classList.contains('dark');
    if (isDark) {
        html.classList.remove('dark');
        body.classList.remove('dark');
        localStorage.setItem('jkt48_theme', 'light');
        updateThemeIcon('light');
    } else {
        html.classList.add('dark');
        body.classList.add('dark');
        localStorage.setItem('jkt48_theme', 'dark');
        updateThemeIcon('dark');
    }
}

function openSchedule() {
    window.location.href = 'schedule.html';
}

// ============= LIVE SHOW BANNER =============
async function checkLiveShows() {
    try {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const todayShows = allShowsData.filter(show => show.show_date === today);
        if (todayShows.length === 0) return null;
        const liveShows = [];
        todayShows.forEach(show => {
            const status = getLiveStatus(show.show_date, show.show_time, show.is_non_show);
            if (status === 'LIVE') {
                const member = membersMap[show.member_id];
                if (member) {
                    liveShows.push({ ...show, memberName: member.name, status });
                }
            }
        });
        if (liveShows.length > 0) return prepareShowData(liveShows);
        return null;
    } catch (err) {
        console.error('Error in checkLiveShows:', err);
        return null;
    }
}

function prepareShowData(shows) {
    const groupedShows = {};
    shows.forEach(show => {
        const key = `${show.setlist_name}|${show.show_date}|${show.show_time}`;
        if (!groupedShows[key]) {
            groupedShows[key] = {
                setlistName: show.setlist_name,
                showDate: show.show_date,
                showTime: show.show_time,
                members: [],
                isBirthdayShow: show.is_birthday_show || false,
                birthdayMember: show.birthday_member || null,
                isGraduationShow: show.is_graduation_show || false,
                graduationMember: show.graduation_member || null,
                status: show.status
            };
        }
        if (show.memberName && !groupedShows[key].members.includes(show.memberName)) {
            groupedShows[key].members.push(show.memberName);
        }
    });
    const sortedKeys = Object.keys(groupedShows).sort((a, b) => {
        const timeA = a.split('|')[2];
        const timeB = b.split('|')[2];
        return timeA.localeCompare(timeB);
    });
    if (sortedKeys.length === 0) return null;
    const firstShow = groupedShows[sortedKeys[0]];
    return {
        name: firstShow.setlistName,
        shows: firstShow.members,
        memberCount: firstShow.members.length,
        earliestTime: firstShow.showTime,
        isBirthdayShow: firstShow.isBirthdayShow,
        birthdayMember: firstShow.birthdayMember,
        isGraduationShow: firstShow.isGraduationShow,
        graduationMember: firstShow.graduationMember,
        status: firstShow.status
    };
}

async function updateLiveShowBanner() {
    const banner = document.getElementById('liveShowBanner');
    const title = document.getElementById('liveShowTitle');
    const timeElement = document.getElementById('liveShowTime');
    const badge = document.getElementById('liveStatusBadge');
    try {
        const showData = await checkLiveShows();
        currentLiveShowData = showData;
        if (!showData) {
            banner.style.display = 'none';
            return;
        }
        banner.style.display = 'block';
        let displayTitle = showData.name;
        if (showData.isBirthdayShow && showData.birthdayMember) displayTitle += ` (STS ${showData.birthdayMember})`;
        if (showData.isGraduationShow && showData.graduationMember) displayTitle += ` (Graduation ${showData.graduationMember})`;
        title.textContent = displayTitle;
        banner.className = 'live-show-banner';
        if (showData.isGraduationShow) banner.classList.add('graduation');
        badge.className = 'live-badge';

        // Graduation badge
        const graduationBadgeEl = document.getElementById('liveGraduationBadge');
        const graduationTextEl = document.getElementById('liveGraduationText');
        if (showData.isGraduationShow && showData.graduationMember) {
            graduationBadgeEl.style.display = 'flex';
            graduationTextEl.textContent = 'Graduation Show ' + showData.graduationMember;
        } else {
            graduationBadgeEl.style.display = 'none';
        }

        if (showData.status === 'LIVE') {
            banner.classList.add('live-now');
            badge.innerHTML = '<span class="live-dot"></span><span>LIVE</span>';
        } else {
            banner.classList.add('finished');
            badge.innerHTML = '<span>SHOW ENDED</span>';
        }
        if (showData.earliestTime) {
            const timeStr = showData.earliestTime.slice(0, 5);
            timeElement.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> ${timeStr} WIB • ${showData.memberCount} member`;
        } else {
            timeElement.textContent = `Hari ini • ${showData.memberCount} member`;
        }
    } catch (err) {
        console.error('Error updating banner:', err);
        banner.style.display = 'none';
    }
}

function openLiveShowDetail() {
    if (!currentLiveShowData) return;
    const setlistParam = encodeURIComponent(currentLiveShowData.name);
    const dateParam = encodeURIComponent(new Date().toISOString().split('T')[0]);
    const timeParam = encodeURIComponent(currentLiveShowData.earliestTime);
    localStorage.setItem('jkt48_selected_setlist', currentLiveShowData.name);
    localStorage.setItem('jkt48_selected_date', dateParam);
    localStorage.setItem('jkt48_selected_time', currentLiveShowData.earliestTime);
    window.location.href = `liveshow.html?setlist=${setlistParam}&date=${dateParam}&time=${timeParam}`;
}

// ============= LOAD DATA =============
async function loadData() {
    try {
        const { data: membersData, error: membersError } = await db
            .from('members')
            .select('id, name, gen, team, show, status, is_graduated, is_resigned, graduation_date, resign_date')
            .order('show', { ascending: false });
        if (membersError) throw membersError;
        members = membersData || [];
        allMembersData = [...members];
        membersMap = {};
        members.forEach(member => { membersMap[member.id] = member; });
        await loadAllShows();
        await updateLiveShowBanner();
        await updateFooterWithLatestUpdate();
        restoreState();
        if (members.length === 0) {
            document.getElementById('list').innerHTML = '<div class="msg">Tidak ada data</div>';
            document.getElementById('lastUpdate').innerHTML = 'Tidak ada data';
        } else {
            await updateLastUpdate();
            renderMembers();
            updateStats();
            isDataLoaded = true;
            setTimeout(() => restoreScrollPosition(), 100);
            setupRealtimeSubscription();
        }
    } catch (err) {
        console.error('Error:', err);
        document.getElementById('list').innerHTML = '<div class="msg" style="color:#ef4444">Error: ' + escapeHtml(err.message) + '</div>';
        document.getElementById('lastUpdate').innerHTML = 'Error';
    }
}

async function loadAllShows() {
    try {
        const PAGE_SIZE = 1000;
        let offset = 0;
        let allRows = [];
        while (true) {
            const { data: showsData, error: showsError } = await db
                .from('setlist_performance')
                .select('*')
                .order('show_date', { ascending: false })
                .order('show_time', { ascending: false })
                .order('id', { ascending: false })
                .range(offset, offset + PAGE_SIZE - 1);
            if (showsError) throw showsError;
            allRows = allRows.concat(showsData || []);
            if (!showsData || showsData.length < PAGE_SIZE) break;
            offset += PAGE_SIZE;
        }
        allShowsData = allRows;
        processSetlistCounts();
    } catch (err) {
        console.error('Error loading shows:', err);
    }
}

function processSetlistCounts() {
    try {
        Object.keys(SETLIST_DATA).forEach(key => { SETLIST_DATA[key].members = {}; });
        members.forEach(member => {
            Object.keys(SETLIST_DATA).forEach(key => { SETLIST_DATA[key].members[member.name] = 0; });
        });
        const showCountMap = {};
        allShowsData.forEach(show => {
            const member = membersMap[show.member_id];
            if (!member || !show.setlist_name) return;
            const memberName = member.name;
            const setlistName = show.setlist_name.toLowerCase().trim();
            let key = null;
            if (setlistName.includes('ramune')) key = 'ramune';
            else if (setlistName.includes('tsunaginagara') || setlistName.includes('tte') || setlistName.includes('te wo')) key = 'tte';
            else if (setlistName.includes('pertaruhan')) key = 'pertaruhan';
            else if (setlistName.includes('pajama')) key = 'pajama';
            if (key) {
                const mapKey = `${memberName}_${key}`;
                showCountMap[mapKey] = (showCountMap[mapKey] || 0) + 1;
            }
        });
        Object.keys(showCountMap).forEach(mapKey => {
            const setlistKeys = Object.keys(SETLIST_DATA);
            let key = null;
            let memberName = mapKey;
            for (const sk of setlistKeys) {
                const suffix = '_' + sk;
                if (mapKey.endsWith(suffix)) {
                    key = sk;
                    memberName = mapKey.slice(0, -suffix.length);
                    break;
                }
            }
            if (key && memberName) {
                SETLIST_DATA[key].members[memberName] = showCountMap[mapKey];
            }
        });
    } catch (err) {
        console.error('Error processing setlist counts:', err);
    }
}

async function updateFooterWithLatestUpdate() {
    try {
        const { data, error } = await db
            .from('setlist_performance')
            .select('updated_at')
            .order('updated_at', { ascending: false })
            .limit(1);
        if (!error && data && data.length > 0 && data[0].updated_at) {
            latestUpdateTime = new Date(data[0].updated_at);
            updateFooter();
            return true;
        }
        return false;
    } catch (err) {
        console.error('Error update footer:', err);
        return false;
    }
}

function updateFooter() {
    if (!latestUpdateTime) return;
    const day = latestUpdateTime.getDate();
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const formatted = `${day} ${monthNames[latestUpdateTime.getMonth()]}`;
    const footer = document.getElementById('mainFooter');
    if (footer) footer.innerHTML = `<p>© 2026 Show Theater. Data diperbarui secara real-time</p>`;
}

async function updateLastUpdate() {
    if (members.length === 0) return;
    try {
        const { data, error } = await db
            .from('setlist_performance')
            .select('updated_at')
            .order('updated_at', { ascending: false })
            .limit(1);
        if (!error && data && data.length > 0 && data[0].updated_at) {
            const rawDate = data[0].updated_at; const date = new Date(rawDate.endsWith('Z') || rawDate.includes('+') ? rawDate : rawDate + 'Z');
            const monthNames = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Oct','Nov','Des'];
            const hours = String(date.getHours()).padStart(2,'0'); const minutes = String(date.getMinutes()).padStart(2,'0'); document.getElementById('lastUpdate').innerHTML = `Update: ${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}, ${hours}:${minutes}`;
            return;
        }
    } catch (err) {
        console.error('Error update time:', err);
    }
    document.getElementById('lastUpdate').innerHTML = 'Data tersedia';
}

function openMemberPage(name) {
    saveCurrentState();
    window.location.href = (currentSetlistView ? 'riwayat.html' : 'member.html') + '?member=' + encodeURIComponent(name);
}

// ============= RENDER MEMBERS =============
function renderMembers() {
    const list = document.getElementById('list');
    searchQuery = document.getElementById('searchInput').value.trim();
    if (currentSetlistView) {
        renderSetlistMembers();
        return;
    }
    let filtered = members.filter(m => {
        if (isMemberInactive(m)) return false;
        const matchGen = currentGen === 'all' || m.gen === currentGen;
        const matchTeam = currentTeam === 'all' || m.team === currentTeam;
        const matchSearch = !searchQuery || m.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchGen && matchTeam && matchSearch;
    });
    if (filtered.length === 0) {
        let msg = '';
        if (searchQuery) {
            const inactiveMatch = members.find(m =>
                isMemberInactive(m) && m.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            if (inactiveMatch) {
                const isResignCase = inactiveMatch.is_resigned || (inactiveMatch.resign_date && !inactiveMatch.is_graduated);
                msg = isResignCase
                    ? `${inactiveMatch.name} telah Resign`
                    : `${inactiveMatch.name} telah Graduation`;
            } else {
                msg = `Tidak ada "${searchQuery}"`;
            }
        } else if (currentTeam !== 'all') msg = `Belum Tersedia ${currentTeam}`;
        else if (currentGen !== 'all') msg = `Belum ada Gen ${currentGen}`;
        else msg = 'Belum ada data';
        list.innerHTML = `<div class="simple-message">${msg}</div>`;
        return;
    }
    list.innerHTML = '';
    filtered.sort((a, b) => b.show - a.show).forEach(m => {
        const percent = Math.min(100, (m.show / MILESTONE) * 100);
        const color = GEN_COLORS[m.gen] || '#6366f1';
        const isGraduated = m.status === 'graduated';
        const card = document.createElement('div');
        card.className = isGraduated ? 'card graduated-member' : 'card';
        card.addEventListener('click', () => openMemberPage(m.name));
        const genText = m.gen ? `Gen ${m.gen}` : 'Gen ?';
        const graduationBadge = isGraduated ? '<div class="graduation-badge">GRADUATED</div>' : '';
        const footerColor = isGraduated ? '#6b7280' : color;
        card.innerHTML = `
            <div class="avatar-container">
                <img class="avatar" src="img/${encodeURIComponent(m.name.toLowerCase())}.jpg" alt="${escapeHtml(m.name)}" loading="lazy" onerror="this.onerror=null;this.style.display='none';this.parentNode.innerHTML='<div class=&quot;avatar-placeholder&quot;>${escapeHtml(m.name.charAt(0))}</div>'">
                ${graduationBadge}
            </div>
            <div class="card-footer${isLightColor(footerColor) ? ' on-light' : ''}" style="background-color:${footerColor}">
                <div class="gen-badge">${genText}</div>
                <div class="name-container">
                    <div class="name">${escapeHtml(m.name)}</div>
                </div>
                <div class="show-info">${m.show} show</div>
                <div class="bar-container">
                    <div class="bar"><span style="width:${percent}%"></span></div>
                </div>
            </div>
        `;
        list.appendChild(card);
    });
}

function renderSetlistMembers() {
    const list = document.getElementById('list');
    const setlistData = SETLIST_DATA[currentSetlistView];
    if (!setlistData) {
        list.innerHTML = '<div class="simple-message">Data tidak tersedia</div>';
        return;
    }
    list.innerHTML = '';
    const arr = members.filter(m => !isMemberInactive(m)).map(m => ({
        name: m.name,
        shows: setlistData.members[m.name] || 0,
        memberData: m
    })).sort((a, b) => b.shows !== a.shows ? b.shows - a.shows : a.name.localeCompare(b.name));
    const active = arr.filter(m => m.shows > 0);
    document.getElementById('setlistStats').innerHTML = setlistData.title;
    document.getElementById('setlistStats').style.display = 'block';
    const badges = { ramune: 'CMR', tte: 'TWT', pertaruhan: 'PC', pajama: 'PD' };
    const badge = badges[currentSetlistView] || '';
    let maxShows = active.length > 0 ? Math.max(...active.map(m => m.shows)) : 0;
    let scale = 15;
    if (maxShows > 0) {
        if (maxShows <= 10) scale = 15;
        else if (maxShows <= 50) scale = maxShows + 10;
        else if (maxShows <= 100) scale = maxShows + 20;
        else if (maxShows <= 200) scale = maxShows + 30;
        else scale = maxShows + 40;
    }
    active.forEach((m, i) => {
        const rank = i + 1;
        const percent = Math.min(100, (m.shows / scale) * 100);
        const color = GEN_COLORS[m.memberData.gen] || '#6366f1';
        const isGraduated = m.memberData.status === 'graduated';
        const card = document.createElement('div');
        card.className = `card setlist-card ${rank <= 3 ? 'rank-' + rank : ''}`;
        if (isGraduated) card.classList.add('graduated-member');
        card.addEventListener('click', () => openMemberPage(m.name));
        const rankBadge = rank <= 10 ? `<div class="rank-badge rank-${rank}">${rank}</div>` : '';
        const graduationBadge = isGraduated ? '<div class="graduation-badge">GRADUATED</div>' : '';
        const genText = m.memberData.gen ? `Gen ${m.memberData.gen}` : 'Gen ?';
        const footerColor = isGraduated ? '#6b7280' : color;
        card.innerHTML = `
            <div class="avatar-container">
                <img class="avatar" src="img/${encodeURIComponent(m.name.toLowerCase())}.jpg" alt="${escapeHtml(m.name)}" loading="lazy" onerror="this.onerror=null;this.style.display='none';this.parentNode.innerHTML='<div class=&quot;avatar-placeholder&quot;>${escapeHtml(m.name.charAt(0))}</div>'">
                ${rankBadge}
                ${graduationBadge}
                <div class="photo-setlist-badge">${badge}</div>
            </div>
            <div class="card-footer${isLightColor(footerColor) ? ' on-light' : ''}" style="background-color:${footerColor}">
                <div class="gen-badge">${genText}</div>
                <div class="name-container">
                    <div class="name">${escapeHtml(m.name)}</div>
                </div>
                <div class="show-info">${m.shows} show</div>
                <div class="bar-container">
                    <div class="bar"><span style="width:${percent}%"></span></div>
                </div>
            </div>
        `;
        list.appendChild(card);
    });
    if (active.length === 0) {
        list.innerHTML = '<div class="simple-message">Belum ada member</div>';
    }
}

function updateStats() {
    const filtered = members.filter(m => {
        if (isMemberInactive(m)) return false;
        const matchGen = currentGen === 'all' || m.gen === currentGen;
        const matchTeam = currentTeam === 'all' || m.team === currentTeam;
        const matchSearch = !searchQuery || m.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchGen && matchTeam && matchSearch;
    });
    const total = filtered.length;
    const totalShows = filtered.reduce((sum, m) => sum + m.show, 0);
    let txt = `${total} members • ${totalShows.toLocaleString()} total shows`;
    if (currentGen !== 'all') txt += ' • Gen ' + currentGen;
    if (currentTeam !== 'all') txt += ' • ' + currentTeam;
    document.getElementById('stats').innerHTML = txt;
}

// ============= FILTER & SEARCH =============
function searchMember() {
    searchQuery = document.getElementById('searchInput').value;
    currentSetlistView = null;
    currentGen = 'all';
    currentTeam = 'all';
    document.querySelectorAll('.top-member-filter').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.team-filter').forEach(btn => btn.classList.remove('active'));
    document.getElementById('stats').style.display = 'block';
    document.getElementById('setlistStats').style.display = 'none';
    renderMembers();
    updateStats();
    saveCurrentState();
}

function filterTeam(team) {
    currentTeam = team;
    currentGen = 'all';
    currentSetlistView = null;
    searchQuery = '';
    document.getElementById('searchInput').value = '';
    toggleClearBtn();
    document.querySelectorAll('.filter').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.top-member-filter').forEach(btn => btn.classList.remove('active'));
    document.getElementById('stats').style.display = 'block';
    document.getElementById('setlistStats').style.display = 'none';
    event.target.classList.add('active');
    renderMembers();
    updateStats();
    saveCurrentState();
}

function showSetlist(type) {
    currentSetlistView = type;
    currentGen = 'all';
    currentTeam = 'all';
    searchQuery = '';
    document.getElementById('searchInput').value = '';
    toggleClearBtn();
    document.querySelectorAll('.filter').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.team-filter').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.top-member-filter').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById('stats').style.display = 'none';
    document.getElementById('setlistStats').style.display = 'block';
    renderSetlistMembers();
    saveCurrentState();
}

// ============= STATE MANAGEMENT =============
function saveCurrentState() {
    sessionStorage.setItem('jkt48_setlist_view', currentSetlistView || '');
    sessionStorage.setItem('jkt48_scroll_position', window.scrollY);
}

function restoreState() {
    const savedSetlist = sessionStorage.getItem('jkt48_setlist_view');
    // Bersihkan sisa key lama - search & filter gen/team selalu mulai default tiap refresh
    sessionStorage.removeItem('jkt48_search_query');
    sessionStorage.removeItem('jkt48_current_gen');
    sessionStorage.removeItem('jkt48_current_team');
    if (savedSetlist && savedSetlist !== 'null' && savedSetlist !== '') {
        currentSetlistView = savedSetlist;
        if (currentSetlistView) {
            document.getElementById('stats').style.display = 'none';
            document.getElementById('setlistStats').style.display = 'block';
            document.querySelectorAll('.top-member-filter').forEach(btn => {
                btn.classList.remove('active');
                const txt = btn.textContent.toLowerCase();
                if ((currentSetlistView === 'ramune' && txt.includes('ramune')) ||
                    (currentSetlistView === 'tte' && txt.includes('menggandeng')) ||
                    (currentSetlistView === 'pertaruhan' && txt.includes('pertaruhan')) ||
                    (currentSetlistView === 'pajama' && txt.includes('pajama'))) {
                    btn.classList.add('active');
                }
            });
        }
    } else {
        currentSetlistView = null;
    }
}

function restoreScrollPosition() {
    const saved = sessionStorage.getItem('jkt48_scroll_position');
    if (saved && saved !== 'null') {
        setTimeout(() => window.scrollTo({ top: parseInt(saved), behavior: 'instant' }), 50);
    }
}

window.addEventListener('scroll', () => {
    clearTimeout(scrollSaveTimeout);
    scrollSaveTimeout = setTimeout(() => {
        if (isDataLoaded) sessionStorage.setItem('jkt48_scroll_position', window.scrollY);
    }, 150);
});

window.addEventListener('beforeunload', () => saveCurrentState());

// ============= MODAL GEN =============
function openGenModal() {
    document.getElementById('genModal').classList.add('active');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
        document.querySelectorAll('.gen-option').forEach(option => {
            option.classList.remove('active');
            if (option.classList.contains('all-gen') && currentGen === 'all') {
                option.classList.add('active');
            } else if (option.textContent.includes('Gen')) {
                const genNum = parseInt(option.textContent.replace('Gen ', '').trim());
                if (genNum === currentGen) option.classList.add('active');
            }
        });
    }, 10);
}

function closeGenModal() {
    document.getElementById('genModal').classList.remove('active');
    document.body.style.overflow = 'auto';
}

function closeModalOnOverlay(e) {
    if (e.target === document.getElementById('genModal')) closeGenModal();
}

function selectGen(gen) {
    currentGen = gen;
    currentTeam = 'all';
    currentSetlistView = null;
    searchQuery = '';
    document.getElementById('searchInput').value = '';
    toggleClearBtn();
    document.querySelectorAll('.team-filter').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.top-member-filter').forEach(btn => btn.classList.remove('active'));
    document.getElementById('stats').style.display = 'block';
    document.getElementById('setlistStats').style.display = 'none';
    closeGenModal();
    renderMembers();
    updateStats();
    saveCurrentState();
}

// ============= REALTIME SUBSCRIPTION =============
let realtimeChannel = null;

function setupRealtimeSubscription() {
    if (realtimeChannel) {
        db.removeChannel(realtimeChannel);
    }
    realtimeChannel = db
        .channel('db-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'setlist_performance' }, async () => {
            await loadAllShows();
            await updateLastUpdate();
            if (currentSetlistView) {
                renderSetlistMembers();
            } else {
                renderMembers();
            }
            updateStats();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'members' }, async () => {
            const { data: membersData, error } = await db
                .from('members')
                .select('id, name, gen, team, show, status, is_graduated, is_resigned, graduation_date, resign_date')
                .order('show', { ascending: false });
            if (!error && membersData) {
                members = membersData;
                allMembersData = [...members];
                membersMap = {};
                members.forEach(member => { membersMap[member.id] = member; });
                processSetlistCounts();
                await updateLastUpdate();
                if (currentSetlistView) {
                    renderSetlistMembers();
                } else {
                    renderMembers();
                }
                updateStats();
            }
        })
        .subscribe();
}

// ============= INITIALIZATION =============
document.addEventListener('DOMContentLoaded', () => {
    // Pastikan URL selalu '/' bukan '/index' agar tombol back tidak dobel
    if (window.location.pathname === '/index' || window.location.pathname === '/index.html') {
        history.replaceState(null, '', '/');
    }
    loadData();
    if (liveShowRefreshInterval) clearInterval(liveShowRefreshInterval);
    liveShowRefreshInterval = setInterval(() => {
        updateLiveShowBanner();
    }, 30000);
});

window.addEventListener('unload', () => {
    if (liveShowRefreshInterval) clearInterval(liveShowRefreshInterval);
    if (realtimeChannel) db.removeChannel(realtimeChannel);
});
