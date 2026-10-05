var SUPABASE_URL='https://pprxfopqkvpeajeoxzig.supabase.co';
var SUPABASE_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwcnhmb3Bxa3ZwZWFqZW94emlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNTI4MTIsImV4cCI6MjA4MTgyODgxMn0.iXRO_dAHhtVHRLqGTresG_63RD2zIaopNXtXYNfthdg';
// SECURITY: hardcoded ADMIN_ACCOUNTS removed — login now goes through real Supabase Auth
// (supabase.auth.signInWithPassword). Create admin users in the Supabase Dashboard under
// Authentication → Users, not in this file. See SECURITY REPORT for the RLS policies that
// must accompany this change — without them, this login is still cosmetic.

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
var SETLIST_INTI={'Cara Meminum Ramune':'Setlist segar seperti minuman ramune','Te Wo Tsunaginagara':'Setlist sambil bergandengan tangan','Pertaruhan Cinta':'Setlist tentang taruhan cinta untuk member inti'};
var SETLIST_PASSION=Object.assign({},SETLIST_INTI,{'Passion 200%':'Setlist penuh semangat 200% untuk member inti'});
var SETLIST_DREAM=Object.assign({},SETLIST_INTI,{'DREAM BAKUDAN':'Setlist spesial Team Dream — penuh ledakan energi'});
var SETLIST_LOVE=Object.assign({},SETLIST_INTI,{'ITADAKI♥LOVE':'Setlist spesial Team Love — penuh cinta dan semangat'});
var SETLIST_TRAINEE={'Pajama Drive':'Setlist klasik untuk member trainee'};
var SETLIST_INFO=Object.assign({},SETLIST_INTI,SETLIST_PASSION,SETLIST_DREAM,SETLIST_LOVE,SETLIST_TRAINEE);
// Mapping setlist per team — semua team inti dapat semua SETLIST_INTI
var SETLIST_BY_TEAM={
    'passion':SETLIST_PASSION,
    'love':SETLIST_LOVE,
    'dream':SETLIST_DREAM
};





// Helper: dapatkan label team
function getTeamLabel(team){ var t=(team||'').toLowerCase(); if(t==='passion') return 'Team Passion'; if(t==='love') return 'Team Love'; if(t==='dream') return 'Team Dream'; return 'INTI'; }

// Populate <select> setlist per member (trainee / inti)
function buildSetlistOptions(member, currentValue) {
    var sel = document.getElementById('setlistSelect');
    if (!sel) return;
    // Reset
    sel.innerHTML = '<option value="">Pilih Setlist...</option><option value="__custom__">Kustom Setlist (Ketik Manual)</option>';
    if (!member || member.status === 'trainee') {
        var grpT = document.createElement('optgroup');
        grpT.label = 'TRAINEE';
        for (var k in SETLIST_TRAINEE) {
            var o = document.createElement('option');
            o.value = k; o.textContent = k;
            if (currentValue === k) o.selected = true;
            grpT.appendChild(o);
        }
        sel.appendChild(grpT);
    } else {
        var team = (member.team || '').toLowerCase();
        var teamSetlists = SETLIST_BY_TEAM[team] || SETLIST_INTI;
        var teamLabel = getTeamLabel(member.team).toUpperCase();
        var grpI = document.createElement('optgroup');
        grpI.label = teamLabel;
        for (var k in teamSetlists) {
            var o = document.createElement('option');
            o.value = k; o.textContent = k;
            if (currentValue === k) o.selected = true;
            grpI.appendChild(o);
        }
        sel.appendChild(grpI);
    }
    if (currentValue === '__custom__') sel.value = '__custom__';
    else if (!currentValue) sel.value = '';
}

// Populate <select> setlist untuk Bulk Add (semua setlist)
function buildSetlistOptionsAll(currentValue) {
    var sel = document.getElementById('bulkSetlistSelect');
    if (!sel) return;
    sel.innerHTML = '<option value="">Pilih Setlist...</option><option value="__custom__">Kustom Setlist (Ketik Manual)</option>';
    var grpI = document.createElement('optgroup');
    grpI.label = 'INTI';
    for (var k in SETLIST_INTI) {
        var o = document.createElement('option');
        o.value = k; o.textContent = k;
        if (currentValue === k) o.selected = true;
        grpI.appendChild(o);
    }
    sel.appendChild(grpI);
    var grpP = document.createElement('optgroup');
    grpP.label = 'TEAM PASSION';
    for (var k in SETLIST_PASSION) {
        if (!(k in SETLIST_INTI)) {
            var o = document.createElement('option');
            o.value = k; o.textContent = k;
            if (currentValue === k) o.selected = true;
            grpP.appendChild(o);
        }
    }
    if (grpP.children.length > 0) sel.appendChild(grpP);
    var grpD = document.createElement('optgroup');
    grpD.label = 'TEAM DREAM';
    for (var k in SETLIST_DREAM) {
        if (!(k in SETLIST_INTI)) {
            var o = document.createElement('option');
            o.value = k; o.textContent = k;
            if (currentValue === k) o.selected = true;
            grpD.appendChild(o);
        }
    }
    if (grpD.children.length > 0) sel.appendChild(grpD);
    var grpL = document.createElement('optgroup');
    grpL.label = 'TEAM LOVE';
    for (var k in SETLIST_LOVE) {
        if (!(k in SETLIST_INTI)) {
            var o = document.createElement('option');
            o.value = k; o.textContent = k;
            if (currentValue === k) o.selected = true;
            grpL.appendChild(o);
        }
    }
    if (grpL.children.length > 0) sel.appendChild(grpL);
    var grpT = document.createElement('optgroup');
    grpT.label = 'TRAINEE';
    for (var k in SETLIST_TRAINEE) {
        var o = document.createElement('option');
        o.value = k; o.textContent = k;
        if (currentValue === k) o.selected = true;
        grpT.appendChild(o);
    }
    sel.appendChild(grpT);
    if (currentValue === '__custom__') sel.value = '__custom__';
    else if (!currentValue) sel.value = '';
}

// Populate <select> setlist untuk editShowModal
function buildEditSetlistOptions(member, currentValue) {
    var sel = document.getElementById('editSetlistSelect');
    if (!sel) return;
    sel.innerHTML = '<option value="">Pilih Setlist...</option><option value="__custom__">Kustom Setlist (Ketik Manual)</option>';
    if (!member || member.status === 'trainee') {
        var grpT = document.createElement('optgroup');
        grpT.label = 'TRAINEE';
        for (var k in SETLIST_TRAINEE) {
            var o = document.createElement('option');
            o.value = k; o.textContent = k;
            if (currentValue === k) o.selected = true;
            grpT.appendChild(o);
        }
        sel.appendChild(grpT);
    } else {
        var team = (member.team || '').toLowerCase();
        var teamSetlists = SETLIST_BY_TEAM[team] || SETLIST_INTI;
        var teamLabel = getTeamLabel(member.team).toUpperCase();
        var grpI = document.createElement('optgroup');
        grpI.label = teamLabel;
        for (var k in teamSetlists) {
            var o = document.createElement('option');
            o.value = k; o.textContent = k;
            if (currentValue === k) o.selected = true;
            grpI.appendChild(o);
        }
        sel.appendChild(grpI);
    }
    if (currentValue === '__custom__') sel.value = '__custom__';
    else if (!currentValue) sel.value = '';
}

// Baca nilai terpilih dari <select> (kompatibel dengan kode lama yang pakai getRadioListValue)
function getRadioListValue(containerId) {
    // Map wrapper ID lama → select ID baru
    var map = { 'setlistSelectWrap': 'setlistSelect', 'editSetlistSelectWrap': 'editSetlistSelect', 'bulkSetlistSelectWrap': 'bulkSetlistSelect' };
    var selId = map[containerId] || containerId;
    var el = document.getElementById(selId);
    return el ? (el.value || '') : '';
}
var db;
try {
    if (typeof supabase === 'undefined') throw new Error('Library Supabase tidak ter-load');
    db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} catch (initErr) {
    console.error('Gagal inisialisasi Supabase:', initErr);
    document.addEventListener('DOMContentLoaded', showInitError);
}
var members=[];
var currentGen='all';
var currentStatus='all';
var searchQuery='';
var activityLog=[];
var currentMemberId=null;

// Mapping untuk lookup cepat
var memberIdMap = {}; // { memberName: memberId }
var memberNameMap = {}; // { memberId: memberName }

// Member dianggap tidak aktif kalau sudah graduated ATAU resigned (dua status terpisah, sama-sama berarti "keluar dari grup")
function isMemberInactive(m) {
    return m.status === 'graduated' || m.status === 'resigned';
}

// Team Quick-Select
function selectTeamMembers(team) {
    var activeTeamMembers = members.filter(function(m) {
        return m.team && m.team.toLowerCase() === team.toLowerCase() && !isMemberInactive(m);
    });

    if (activeTeamMembers.length === 0) {
        showNotification('warning', 'Team ' + team, 'Tidak ada member aktif di team ini');
        return;
    }

    var textarea = document.getElementById('bulkMemberNames');
    var names = activeTeamMembers.map(function(m) { return m.name; }).join(', ');
    textarea.value = names;

    // Update active state tombol
    ['Love','Dream','Passion'].forEach(function(t) {
        var btn = document.getElementById('teamBtn' + t);
        if (btn) {
            btn.className = btn.className.replace(/\s*active-\w+/, '');
            if (t === team) {
                btn.classList.add('active-' + team.toLowerCase());
            }
        }
    });

    showNotification('info', 'Team ' + team, activeTeamMembers.length + ' member dipilih');
}

// Reset active state team btn saat textarea diketik manual
document.addEventListener('DOMContentLoaded', function() {
    var textarea = document.getElementById('bulkMemberNames');
    if (textarea) {
        textarea.addEventListener('input', function() {
            ['Love','Dream','Passion'].forEach(function(t) {
                var btn = document.getElementById('teamBtn' + t);
                if (btn) btn.className = btn.className.replace(/\s*active-\w+/, '');
            });
        });
    }
});



// Edit show variables
var currentEditShowId = null;
var currentEditShowData = null;

// Notification System
function showNotification(type, title, message, duration = 3000) {
    const container = document.getElementById('notificationContainer');
    const id = 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    const notification = document.createElement('div');
    notification.className = `notification-item notification-${type}`;
    notification.id = id;
    
    const text = message || title;
    notification.innerHTML = `<span class="notification-dot"></span><span>${escapeHtml(text)}</span>`;
    
    container.appendChild(notification);
    
    if (duration > 0) {
        setTimeout(() => { removeNotification(id); }, duration);
    }
    
    return id;
}

function removeNotification(id) {
    const notification = document.getElementById(id);
    if (notification) {
        notification.classList.add('hiding');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
}

// Replace old showToast function with new notification system
function showToast(message, isError) {
    if (isError) {
        showNotification('error', 'Error', message);
    } else {
        showNotification('success', 'Success', message);
    }
}

function getTodayDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

function toggleTheme(){ /* dark mode permanent */ }

document.body.classList.add('dark');
// SECURITY: session state now comes from Supabase Auth (server-verified JWT session),
// not from a locally-set localStorage flag that anyone could fake in the console.
// The actual check + login-modal toggle happens in the "Initialize" DOMContentLoaded
// handler below (it needs to run after the DOM, and this script block runs before it).

// Keep the UI in sync if the session expires or the user logs out/in from another tab
db.auth.onAuthStateChange(function(event, session){
    if (event === 'SIGNED_OUT' || !session) {
        var lm = document.getElementById('loginModal');
        if (lm) lm.style.display='flex';
    }
});

async function loadData(){
    try{
        console.log('Memuat data dari Supabase...');

        
        var result=await db.from('members').select('*').order('name');
        
        if(result.error){
            console.error('Error dari Supabase:', result.error);
            throw result.error;
        }
        
        members=result.data||[];
        console.log('Berhasil memuat '+members.length+' member');

        var today = todayDateStr();

        // Koreksi: member yang KELIRU sudah kefinalisasi (is_graduated/is_resigned = true)
        // padahal graduation_date/resign_date-nya masih di masa depan (misal dari bug versi lama).
        // Balikin dulu jadi aktif normal - finalizeMemberStatuses() nanti yang akan mengunci ulang
        // begitu tanggalnya beneran tiba.
        var prematureFixed = [];
        for (var p = 0; p < members.length; p++) {
            var pm = members[p];
            var prematureGrad = pm.is_graduated && pm.graduation_date && pm.graduation_date > today;
            var prematureResign = pm.is_resigned && pm.resign_date && pm.resign_date > today;
            if (prematureGrad || prematureResign) {
                var revertData = {};
                if (prematureGrad) { revertData.is_graduated = false; if (pm.status === 'graduated') revertData.status = 'inti'; }
                if (prematureResign) { revertData.is_resigned = false; if (pm.status === 'resigned') revertData.status = 'inti'; }
                var revertResult = await db.from('members').update(revertData).eq('id', pm.id);
                if (!revertResult.error) {
                    Object.assign(pm, revertData);
                    prematureFixed.push(pm);
                }
            }
        }
        if (prematureFixed.length > 0) {
            console.log('Koreksi finalisasi prematur:', prematureFixed.map(function(m){return m.name;}));
            showNotification('info', 'Status Dikoreksi', prematureFixed.length + ' member dikembalikan aktif (tanggal efektif belum tiba)');
        }

        // Auto-sync #1: perbaiki data dimana is_graduated=true tapi status belum 'graduated'
        var outOfSync = members.filter(function(m){ return m.is_graduated === true && m.status !== 'graduated'; });

        // Auto-sync #2: cari riwayat show yang ditandai graduation di setlist_performance,
        // isi graduation_date member yang belum punya (TIDAK langsung finalize - biar
        // finalizeMemberStatuses() yang menentukan berdasarkan tanggal show tersebut)
        var gradShowsResult = await db.from('setlist_performance')
            .select('graduation_member, show_date')
            .eq('is_graduation_show', true)
            .not('graduation_member', 'is', null);

        if (!gradShowsResult.error && gradShowsResult.data) {
            var gradDateMap = {};
            gradShowsResult.data.forEach(function(row) {
                if (row.graduation_member && row.show_date) {
                    if (!gradDateMap[row.graduation_member] || row.show_date > gradDateMap[row.graduation_member]) {
                        gradDateMap[row.graduation_member] = row.show_date;
                    }
                }
            });
            for (var k = 0; k < members.length; k++) {
                var mm = members[k];
                if (gradDateMap[mm.name] && !mm.graduation_date && mm.status !== 'graduated') {
                    var setDateResult = await db.from('members').update({ graduation_date: gradDateMap[mm.name] }).eq('id', mm.id);
                    if (!setDateResult.error) {
                        mm.graduation_date = gradDateMap[mm.name];
                    }
                }
            }
        }

        if (outOfSync.length > 0) {
            console.log('Sinkronisasi status graduated untuk ' + outOfSync.length + ' member:', outOfSync.map(function(m){return m.name;}));
            for (var i = 0; i < outOfSync.length; i++) {
                var fixResult = await db.from('members').update({ is_graduated: true, status: 'graduated' }).eq('id', outOfSync[i].id);
                if (!fixResult.error) {
                    outOfSync[i].is_graduated = true;
                    outOfSync[i].status = 'graduated';
                } else {
                    console.error('Gagal sinkronisasi status untuk ' + outOfSync[i].name + ':', fixResult.error);
                }
            }
            showNotification('info', 'Data Disinkronkan', outOfSync.length + ' member graduated diperbaiki statusnya');
        }

        // Auto-sync #3: perbaiki data dimana is_resigned=true tapi status belum 'resigned'
        var resignOutOfSync = members.filter(function(m){ return m.is_resigned === true && m.status !== 'resigned'; });
        if (resignOutOfSync.length > 0) {
            console.log('Sinkronisasi status resigned untuk ' + resignOutOfSync.length + ' member:', resignOutOfSync.map(function(m){return m.name;}));
            for (var j = 0; j < resignOutOfSync.length; j++) {
                var fixResignResult = await db.from('members').update({ is_resigned: true, status: 'resigned' }).eq('id', resignOutOfSync[j].id);
                if (!fixResignResult.error) {
                    resignOutOfSync[j].is_resigned = true;
                    resignOutOfSync[j].status = 'resigned';
                } else {
                    console.error('Gagal sinkronisasi status untuk ' + resignOutOfSync[j].name + ':', fixResignResult.error);
                }
            }
            showNotification('info', 'Data Disinkronkan', resignOutOfSync.length + ' member resigned diperbaiki statusnya');
        }

        // Auto-finalize: member yang graduation_date/resign_date sudah lewat, dikunci statusnya
        await finalizeMemberStatuses();
        
        // Update mapping
        updateMemberMappings();
        
        renderMembers();
        updateStats();
        updateLoginStats();
        
    }catch(err){
        console.error('Error:',err);
        document.getElementById('list').innerHTML='<div class="msg" style="color:#ef4444">Error: '+escapeHtml(err.message)+'</div>';
        showNotification('error', 'Load Error', 'Gagal memuat data: ' + err.message);
    }
}

// Helper tanggal hari ini dalam format YYYY-MM-DD (untuk dibandingkan dengan graduation_date/resign_date)
function todayDateStr() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}

// Cek semua member yang graduation_date/resign_date-nya sudah lewat tapi status belum di-finalize,
// lalu otomatis kunci mereka (is_graduated/is_resigned = true, status disesuaikan).
// Member dengan tanggal efektif di masa depan TETAP aktif normal sampai tanggalnya tiba.
async function finalizeMemberStatuses() {
    var today = todayDateStr();
    var toFinalize = members.filter(function(m) {
        var gradDue = m.graduation_date && m.graduation_date <= today && m.status !== 'graduated';
        var resignDue = m.resign_date && m.resign_date <= today && m.status !== 'resigned';
        return gradDue || resignDue;
    });

    for (var i = 0; i < toFinalize.length; i++) {
        var m = toFinalize[i];
        try {
            if (m.graduation_date && m.graduation_date <= today && m.status !== 'graduated') {
                var r1 = await db.from('members').update({ is_graduated: true, is_resigned: false, status: 'graduated' }).eq('id', m.id);
                if (!r1.error) { m.is_graduated = true; m.is_resigned = false; m.status = 'graduated'; }
            } else if (m.resign_date && m.resign_date <= today && m.status !== 'resigned') {
                var r2 = await db.from('members').update({ is_resigned: true, is_graduated: false, status: 'resigned' }).eq('id', m.id);
                if (!r2.error) { m.is_resigned = true; m.is_graduated = false; m.status = 'resigned'; }
            }
        } catch (e) {
            console.error('Gagal finalize status untuk ' + m.name + ':', e);
        }
    }

    if (toFinalize.length > 0) {
        showNotification('info', 'Status Diperbarui', toFinalize.length + ' member sudah lewat tanggal efektif, status diperbarui otomatis');
    }
}

// ============= RESIGN MODAL (pengunduran diri dengan tanggal efektif) =============
function openResignModal() {
    var sel = document.getElementById('resignMemberSelect');
    sel.innerHTML = '<option value="">-- Pilih Member --</option>';

    var sortedMembers = members.slice().sort(function(a,b){ return a.name.localeCompare(b.name); });
    sortedMembers.forEach(function(m) {
        // Tampilkan member yang belum graduated, ATAU member yang sedang resign (untuk bisa dibatalkan)
        if (m.status === 'graduated') return;
        var label = m.name;
        if (m.resign_date) {
            var isDone = m.status === 'resigned';
            label += isDone ? ' (Resigned sejak ' + formatDateID(m.resign_date) + ')' : ' (Resign efektif ' + formatDateID(m.resign_date) + ')';
        }
        var opt = document.createElement('option');
        opt.value = m.id;
        opt.textContent = label;
        sel.appendChild(opt);
    });

    document.getElementById('resignEffectiveDate').value = getTodayDate();
    document.getElementById('resignDateSection').style.display = 'block';
    document.getElementById('resignAlreadySetInfo').style.display = 'none';
    document.getElementById('resignCancelBtn').style.display = 'none';
    document.getElementById('resignSaveBtn').style.display = 'block';
    document.getElementById('resignModal').style.display = 'flex';
}

function closeResignModal() {
    document.getElementById('resignModal').style.display = 'none';
}

function formatDateID(dateStr) {
    if (!dateStr) return '';
    var months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    var parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return parseInt(parts[2],10) + ' ' + months[parseInt(parts[1],10)-1] + ' ' + parts[0];
}

function onResignMemberChange() {
    var id = document.getElementById('resignMemberSelect').value;
    var infoBox = document.getElementById('resignAlreadySetInfo');
    var cancelBtn = document.getElementById('resignCancelBtn');
    var saveBtn = document.getElementById('resignSaveBtn');
    var dateSection = document.getElementById('resignDateSection');

    if (!id) {
        infoBox.style.display = 'none';
        cancelBtn.style.display = 'none';
        saveBtn.style.display = 'block';
        dateSection.style.display = 'block';
        return;
    }

    var m = members.find(function(x){ return String(x.id) === String(id); });
    if (m && m.resign_date) {
        var isDone = m.status === 'resigned';
        infoBox.textContent = isDone
            ? m.name + ' sudah RESIGNED sejak ' + formatDateID(m.resign_date) + '. Tidak bisa diubah lagi kecuali dibatalkan.'
            : m.name + ' terjadwal resign efektif ' + formatDateID(m.resign_date) + '. Masih aktif normal sampai tanggal tersebut.';
        infoBox.style.display = 'block';
        cancelBtn.style.display = 'block';
        document.getElementById('resignEffectiveDate').value = m.resign_date;
        // Kalau sudah final (lewat tanggal), kunci - tidak bisa diubah lagi, cuma bisa dibatalkan
        if (isDone) {
            saveBtn.style.display = 'none';
            dateSection.style.display = 'none';
        } else {
            saveBtn.style.display = 'block';
            dateSection.style.display = 'block';
        }
    } else {
        infoBox.style.display = 'none';
        cancelBtn.style.display = 'none';
        saveBtn.style.display = 'block';
        dateSection.style.display = 'block';
        document.getElementById('resignEffectiveDate').value = getTodayDate();
    }
}

async function saveResignForSelected() {
    var id = document.getElementById('resignMemberSelect').value;
    if (!id) { showNotification('warning', 'Validasi', 'Pilih member dulu'); return; }

    var effDate = document.getElementById('resignEffectiveDate').value;
    if (!effDate) { showNotification('warning', 'Validasi', 'Pilih tanggal efektif resign'); return; }

    var m = members.find(function(x){ return String(x.id) === String(id); });
    if (!m) return;

    var today = todayDateStr();
    var isImmediate = effDate <= today;
    var confirmMsg = isImmediate
        ? 'Tandai ' + m.name + ' RESIGNED efektif ' + formatDateID(effDate) + ' (langsung berlaku sekarang)?'
        : 'Jadwalkan ' + m.name + ' resign efektif ' + formatDateID(effDate) + '?\n\nMember tetap aktif normal sampai tanggal tersebut tiba.';
    if (!confirm(confirmMsg)) return;

    try {
        var updateData = { resign_date: effDate, graduation_date: null };
        if (isImmediate) {
            updateData.is_resigned = true;
            updateData.is_graduated = false;
            updateData.status = 'resigned';
        }
        var result = await db.from('members').update(updateData).eq('id', m.id);
        if (result.error) throw result.error;

        Object.assign(m, updateData);

        showNotification('success', isImmediate ? 'Ditandai Resigned' : 'Resign Dijadwalkan',
            m.name + (isImmediate ? ' telah resigned' : ' akan resign efektif ' + formatDateID(effDate)));

        closeResignModal();
        renderMembers();
        updateStats();
    } catch (err) {
        console.error('Gagal set resign:', err);
        showNotification('error', 'Error', 'Gagal simpan: ' + err.message);
    }
}

async function cancelResignForSelected() {
    var id = document.getElementById('resignMemberSelect').value;
    if (!id) return;
    var m = members.find(function(x){ return String(x.id) === String(id); });
    if (!m) return;

    if (!confirm('Batalkan resign untuk ' + m.name + '? Member akan aktif kembali (status: Inti).')) return;

    try {
        var updateData = { resign_date: null, is_resigned: false, status: 'inti' };
        var result = await db.from('members').update(updateData).eq('id', m.id);
        if (result.error) throw result.error;

        Object.assign(m, updateData);

        showNotification('success', 'Resign Dibatalkan', m.name + ' aktif kembali');

        closeResignModal();
        renderMembers();
        updateStats();
    } catch (err) {
        console.error('Gagal batalkan resign:', err);
        showNotification('error', 'Error', 'Gagal batalkan: ' + err.message);
    }
}

function updateMemberMappings() {
    memberIdMap = {};
    memberNameMap = {};
    
    members.forEach(function(member) {
        memberIdMap[member.name.toLowerCase()] = member.id;
        memberNameMap[member.id] = member.name;
    });
}

function updateLoginStats() {
    var activeMembers = members.filter(function(m){ return !isMemberInactive(m); });
    var elM = document.getElementById('loginStatMembers');
    var elG = document.getElementById('loginStatGen');
    if (elM) elM.textContent = activeMembers.length;
    if (elG) elG.textContent = '14';
}

function loadActivityLog(){
    var saved=localStorage.getItem('jkt48_activity_log');
    if(saved){
        activityLog=JSON.parse(saved);
        var today=new Date().toDateString();
        activityLog=activityLog.filter(function(log){
            return new Date(log.time).toDateString()===today;
        });
    }
    renderActivityLog();
}

function saveActivityLog(){
    localStorage.setItem('jkt48_activity_log',JSON.stringify(activityLog));
}

function addActivity(memberName,change,newValue,setlist,status,showDate,showTime,isNonShow,isBirthday,isGraduation){
    var activity={
        member:memberName,
        change:change,
        newValue:newValue,
        setlist:setlist||null,
        status:status||'inti',
        showDate:showDate||null,
        showTime:showTime||null,
        isNonShow:isNonShow||false,
        isBirthday:isBirthday||false,
        isGraduation:isGraduation||false,
        time:new Date().toISOString()
    };
    activityLog.unshift(activity);
    if(activityLog.length>50) activityLog=activityLog.slice(0,50);
    saveActivityLog();
    renderActivityLog();
}

function addActivityFailed(failedEntry){
    var activity={
        member:failedEntry,
        change:0,
        newValue:null,
        setlist:null,
        status:'failed',
        time:new Date().toISOString()
    };
    activityLog.unshift(activity);
    if(activityLog.length>50) activityLog=activityLog.slice(0,50);
    saveActivityLog();
    renderActivityLog();
}

function renderActivityLog(){
    var logEl=document.getElementById('activityLog');
    if(activityLog.length===0){
        logEl.innerHTML='<div class="activity-empty">Belum ada aktivitas hari ini</div>';
        return;
    }
    logEl.innerHTML=activityLog.map(function(log){
        var time=new Date(log.time);
        var timeStr=time.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});

        if(log.status==='failed'){
            return'<div class="activity-item" style="--color:#60a5fa"><div class="activity-icon" style="font-size:16px;font-weight:900;color:#60a5fa;">✗</div><div class="activity-content"><div class="activity-text"><span style="font-weight:800;color:#60a5fa;">Gagal: '+escapeHtml(log.member)+'</span></div><div class="activity-time">'+timeStr+' • Bulk Add Gagal</div></div></div>';
        }

        var icon = log.isNonShow ? '○' : (log.change > 0 ? '+' : '−');
        var color = log.isNonShow ? '#22c55e' : (log.change > 0 ? '#22c55e' : '#ef4444');
        var statusBadge = log.status==='trainee' ? ' <span style="background:rgba(245,158,11,0.2);color:#f59e0b;font-size:9px;font-weight:700;padding:1px 6px;border-radius:8px;">TRAINEE</span>' : '';

        // Baris 1: Nama member + perubahan show
        var oldValue = log.isNonShow ? (log.newValue - 1) : ((log.newValue || 0) - log.change);
        var specialBadge = '';
        if (log.isNonShow) {
            specialBadge = ' <span style="background:rgba(34,197,94,0.15);color:#22c55e;font-size:9px;font-weight:700;padding:2px 7px;border-radius:8px;margin-left:2px;">NON-SHOW</span>';
        } else if (log.isGraduation) {
            specialBadge = ' <span style="background:rgba(99,102,241,0.15);color:#818cf8;font-size:9px;font-weight:700;padding:2px 7px;border-radius:8px;margin-left:2px;">LAST SHOW</span>';
        } else if (log.isBirthday) {
            specialBadge = ' <span style="background:rgba(251,191,36,0.15);color:#fbbf24;font-size:9px;font-weight:700;padding:2px 7px;border-radius:8px;margin-left:2px;">STS</span>';
        }
        var changeDisplay = log.isNonShow ? '+1' : ((log.change > 0 ? '+' : '') + log.change);
        var changeLine = '<span style="font-weight:800;color:'+color+';">'+escapeHtml(log.member)+'</span>'+statusBadge+specialBadge+
            ' <span style="color:'+color+';font-weight:700;margin-left:4px;">'+changeDisplay+'</span>'+
            ' <span style="color:#9ca3af;font-size:10px;margin-left:2px;">'+oldValue+' → '+log.newValue+' '+(log.isNonShow?'non-show':'show')+'</span>';

        // Baris 2: setlist - tanggal - jam
        var detailParts = [];
        var cleanSetlist = log.setlist ? log.setlist.replace(/\s*\(Non-Show\)\s*/i, '').trim() : null;
        if(cleanSetlist) detailParts.push(escapeHtml(cleanSetlist));
        if(log.showDate) detailParts.push(formatDate(log.showDate));
        if(log.showTime) detailParts.push(formatTime(log.showTime));
        var detailLine = detailParts.length > 0
            ? '<div style="font-size:10px;color:#9ca3af;margin-top:3px;">'+detailParts.join(' · ')+'</div>'
            : '';

        return'<div class="activity-item" style="--color:'+color+'">'+
            '<div class="activity-icon" style="font-size:16px;font-weight:900;color:'+color+';">'+icon+'</div>'+
            '<div class="activity-content">'+
                '<div class="activity-text">'+changeLine+'</div>'+
                detailLine+
                '<div class="activity-time">'+timeStr+'</div>'+
            '</div>'+
        '</div>';
    }).join('');
}

function clearActivityLog(){
    if(confirm('Hapus semua activity log?')){
        activityLog=[];
        saveActivityLog();
        renderActivityLog();
        showNotification('success', 'Activity Log', 'Log dihapus');
    }
}

function animateCounter(el, target, duration) {
    var step = target / (duration / 16);
    var current = 0;
    var timer = setInterval(function() {
        current += step;
        if (current >= target) { current = target; clearInterval(timer); }
        el.textContent = Math.floor(current);
    }, 16);
}

function renderMembers(){
    var list=document.getElementById('list');
    var filtered=members.filter(function(m){
        var matchGen=currentGen==='all'||m.gen==currentGen;
        var matchStatus=currentStatus==='all'||m.status===currentStatus;
        var matchSearch=!searchQuery||m.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchGen&&matchStatus&&matchSearch;
    });
    
    if(filtered.length===0){
        var message = 'Tidak ada data member';
        if(searchQuery){
            message = 'Tidak ada member dengan nama "'+searchQuery+'"';
        }else if(currentStatus!=='all' && currentGen!=='all'){
            message = 'Tidak ada '+currentStatus+' Generasi '+currentGen;
        }else if(currentStatus!=='all'){
            message = 'Tidak ada member '+currentStatus;
        }else if(currentGen!=='all'){
            message = 'Tidak ada member Generasi '+currentGen;
        }
        list.innerHTML='<div class="msg">'+escapeHtml(message)+'</div>';
        return;
    }
    
    list.innerHTML='';
    var sorted=filtered.sort(function(a,b){return b.show-a.show});
    sorted.forEach(function(m){
        var percent=Math.min(100,(m.show/1000)*100);
        var color=GEN_COLORS[m.gen]||'#6366f1';
        var card=document.createElement('div');
        card.className='card animate-in'+(m.status==='trainee'?' trainee':'')+(m.status==='graduated'?' graduated':'')+(m.status==='resigned'?' resigned':'');
        card.style.setProperty('--gen-color',color);
        
        var statusBadgeHtml='';
        if(m.status==='graduated'){
            statusBadgeHtml='<div class="status-badge graduated">GRADUATED</div>';
        }else if(m.status==='resigned'){
            statusBadgeHtml='<div class="status-badge resigned">RESIGNED</div>';
        }else if(m.status==='trainee'){
            statusBadgeHtml='<div class="status-badge trainee">TRAINEE</div>';
        }else{
            statusBadgeHtml='<div class="status-badge">INTI</div>';
        }
        
        var firstChar = m.name.charAt(0);
        var memberInactive = isMemberInactive(m);
        card.innerHTML=
            '<div class="avatar-wrap">'+
                '<img class="avatar" src="img/'+encodeURIComponent(m.name.toLowerCase())+'.jpg" onerror="this.onerror=null;this.style.display=\'none\';var p=document.createElement(\'div\');p.className=\'avatar-placeholder\';p.textContent=\''+escapeForJsAttr(firstChar)+'\';this.parentNode.appendChild(p);" alt="'+escapeHtml(m.name)+'">'+
                '<div class="avatar-overlay"></div>'+
                statusBadgeHtml+
            '</div>'+
            '<div class="card-footer">'+
                '<div class="gen-badge">Gen '+escapeHtml(m.gen)+'</div>'+
                '<div class="name">'+escapeHtml(m.name)+'</div>'+
                '<div class="show"><span class="show-num">'+m.show+'</span>&nbsp;show</div>'+
                '<div class="bar"><span style="width:'+percent+'%"></span></div>'+
                '<div class="admin-controls">'+
                    '<button onclick="updateShow('+m.id+',-1)" title="Kurang show" '+(memberInactive?'disabled': '')+'>−</button>'+
                    '<button onclick="openSetlistModal('+m.id+')" title="Tambah show" '+(memberInactive?'disabled': '')+' style="background:rgba(255,255,255,0.25);">+</button>'+
                    '<button onclick="openMemberShowList('+m.id+')" title="Edit show" style="background:rgba(59,130,246,0.45);">✎</button>'+
                '</div>'+
            '</div>';
        list.appendChild(card);
        var numEl = card.querySelector('.show-num');
        if (numEl) {
            numEl.textContent = '0';
            setTimeout(function(el, val) { animateCounter(el, val, 600); }, 0, numEl, m.show);
        }
    });
}

// =================== HELPER FUNCTIONS ===================

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('id-ID', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
}

function formatTime(timeString) {
    if (!timeString) return '-';
    const parts = timeString.split(':');
    return `${parts[0]}:${parts[1]}`;
}

function formatShortDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    return `${day}/${month}`;
}

function isShowPast(showDate, showTime) {
    if (!showDate || !showTime) return false;
    
    var now = new Date();
    var timePart = showTime.length === 5 ? showTime + ':00' : showTime;
    var showDateTime = new Date(showDate + 'T' + timePart);
    
    return now > showDateTime;
}

function isToday(dateString) {
    var today = new Date().toISOString().split('T')[0];
    return dateString === today;
}

function isThisWeek(dateString) {
    var now = new Date();
    var target = new Date(dateString);
    
    // Set both dates to start of day
    var startOfWeek = new Date(now);
    startOfWeek.setHours(0, 0, 0, 0);
    
    var endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7); // 7 hari ke depan
    endOfWeek.setHours(23, 59, 59, 999);
    
    target.setHours(0, 0, 0, 0);
    
    return target >= startOfWeek && target <= endOfWeek;
}

// =================== CUSTOM SETLIST FUNCTIONS ===================

function toggleCustomSetlistField() {
    var value = document.getElementById('setlistSelect') ? document.getElementById('setlistSelect').value : '';
    var customField = document.getElementById('customSetlistField');
    var setlistInfo = document.getElementById('setlistInfo');
    if (value === '__custom__') {
        customField.classList.add('show');
        setlistInfo.style.display = 'none';
        document.getElementById('customSetlistName').focus();
    } else {
        customField.classList.remove('show');
        if (value) {
            setlistInfo.style.display = 'block';
            document.getElementById('setlistDescription').textContent = SETLIST_INFO[value] || '';
        } else {
            setlistInfo.style.display = 'none';
        }
    }
}

function toggleBulkCustomSetlistField() {
    var value = document.getElementById('bulkSetlistSelect') ? document.getElementById('bulkSetlistSelect').value : '';
    var customField = document.getElementById('bulkCustomSetlistField');
    if (value === '__custom__') {
        customField.classList.add('show');
        document.getElementById('bulkCustomSetlistName').focus();
    } else {
        customField.classList.remove('show');
    }
}

function toggleEditCustomSetlistField() {
    var value = document.getElementById('editSetlistSelect') ? document.getElementById('editSetlistSelect').value : '';
    var customField = document.getElementById('editCustomSetlistField');
    if (value === '__custom__') {
        customField.classList.add('show');
        document.getElementById('editCustomSetlistName').focus();
    } else {
        customField.classList.remove('show');
    }
}

// Filter dropdown member berdasarkan setlist yang dipilih di edit show
function filterEditMemberBySetlist() {
    var setlistVal = document.getElementById('editSetlistSelect') ? document.getElementById('editSetlistSelect').value : '';
    var memberSelect = document.getElementById('editMemberSelect');
    var currentVal = memberSelect.value;
    var allowedStatus = null;
    if (SETLIST_TRAINEE[setlistVal]) allowedStatus = 'trainee';
    else if (SETLIST_INTI[setlistVal]) allowedStatus = 'inti';
    memberSelect.innerHTML = '<option value="">-- Pilih Member --</option>';
    var sorted = members.slice().sort(function(a,b){ return a.name.localeCompare(b.name); });
    sorted.forEach(function(m) {
        if (isMemberInactive(m)) return;
        if (allowedStatus && m.status !== allowedStatus) return;
        var selected = (String(m.id) === String(currentVal)) ? 'selected' : '';
        memberSelect.innerHTML += '<option value="' + escapeHtml(m.id) + '" ' + selected + '>' + escapeHtml(m.name) + '</option>';
    });
}

function getSelectedSetlist(selectId, customInputId) {
    // selectId bisa berupa ID wrapper lama atau ID select langsung
    var map = { 'setlistSelectWrap': 'setlistSelect', 'editSetlistSelectWrap': 'editSetlistSelect', 'bulkSetlistSelectWrap': 'bulkSetlistSelect' };
    var selId = map[selectId] || selectId;
    var selEl = document.getElementById(selId);
    var value = selEl ? (selEl.value || '') : '';
    var customInput = document.getElementById(customInputId);
    if (!value) {
        showNotification('warning', 'Validasi', 'Pilih setlist dulu');
        return null;
    }
    if (value === '__custom__') {
        var customName = customInput ? customInput.value.trim() : '';
        if (!customName) {
            showNotification('warning', 'Validasi', 'Masukkan nama setlist');
            return null;
        }
        return customName;
    }
    return value;
}

// =================== BIRTHDAY & GRADUATION FUNCTIONS ===================

function toggleBirthdayField() {
    var checkbox = document.getElementById('isBirthdayShow');
    var graduationCheckbox = document.getElementById('isGraduationShow');
    var field = document.getElementById('birthdayMemberField');
    
    if (checkbox.checked) {
        if (graduationCheckbox.checked) {
            showNotification('warning', 'Konflik', 'Birthday & Graduation tidak bisa bersamaan');
            checkbox.checked = false;
            return;
        }
        field.classList.add('show');
        populateMemberDropdown('birthdayMember');
    } else {
        field.classList.remove('show');
        document.getElementById('birthdayMember').value = '';
    }
}

function toggleGraduationField() {
    var checkbox = document.getElementById('isGraduationShow');
    var birthdayCheckbox = document.getElementById('isBirthdayShow');
    var field = document.getElementById('graduationMemberField');
    
    if (checkbox.checked) {
        if (birthdayCheckbox.checked) {
            showNotification('warning', 'Konflik', 'Birthday & Graduation tidak bisa bersamaan');
            checkbox.checked = false;
            return;
        }
        field.classList.add('show');
        populateMemberDropdown('graduationMember');
    } else {
        field.classList.remove('show');
        document.getElementById('graduationMember').value = '';
    }
}

function toggleBulkBirthdayField() {
    var checkbox = document.getElementById('bulkIsBirthdayShow');
    var graduationCheckbox = document.getElementById('bulkIsGraduationShow');
    var field = document.getElementById('bulkBirthdayMemberField');
    
    if (checkbox.checked) {
        if (graduationCheckbox.checked) {
            showNotification('warning', 'Konflik', 'Birthday & Graduation tidak bisa bersamaan');
            checkbox.checked = false;
            return;
        }
        field.classList.add('show');
        populateMemberDropdown('bulkBirthdayMember');
    } else {
        field.classList.remove('show');
        document.getElementById('bulkBirthdayMember').value = '';
    }
}

function toggleBulkGraduationField() {
    var checkbox = document.getElementById('bulkIsGraduationShow');
    var birthdayCheckbox = document.getElementById('bulkIsBirthdayShow');
    var field = document.getElementById('bulkGraduationMemberField');
    
    if (checkbox.checked) {
        if (birthdayCheckbox.checked) {
            showNotification('warning', 'Konflik', 'Birthday & Graduation tidak bisa bersamaan');
            checkbox.checked = false;
            return;
        }
        field.classList.add('show');
        populateMemberDropdown('bulkGraduationMember');
    } else {
        field.classList.remove('show');
        document.getElementById('bulkGraduationMember').value = '';
    }
}

function toggleBulkNonShow() {
    var cb = document.getElementById('bulkIsNonShowActivity');
    var info = document.getElementById('bulkNonShowInfo');
    info.classList.toggle('show', cb.checked);
    if (cb.checked) {
        document.getElementById('bulkMemberSection').style.opacity = '1';
    }
}

function toggleBulkEmptySchedule() {
    var cb = document.getElementById('bulkIsEmptySchedule');
    var info = document.getElementById('bulkEmptyScheduleInfo');
    info.classList.toggle('show', cb.checked);
    // Redup-kan member section saat schedule kosong dipilih
    document.getElementById('bulkMemberSection').style.opacity = cb.checked ? '0.4' : '1';
}

function toggleSetlistNonShow() {
    var cb = document.getElementById('isNonShowActivity');
    var info = document.getElementById('setlistNonShowInfo');
    info.classList.toggle('show', cb.checked);
}

function toggleSetlistEmptySchedule() {
    var cb = document.getElementById('isEmptySchedule');
    var info = document.getElementById('setlistEmptyInfo');
    info.classList.toggle('show', cb.checked);
}

// Fungsi helper untuk populate dropdown
function populateMemberDropdown(dropdownId) {
    var dropdown = document.getElementById(dropdownId);
    if (!dropdown) {
        console.error('Dropdown not found:', dropdownId);
        return;
    }
    
    // Simpan nilai yang dipilih sebelumnya
    var previousValue = dropdown.value;
    
    dropdown.innerHTML = '<option value="">-- Pilih Member --</option>';
    
    var sortedMembers = members.slice().sort(function(a, b) {
        return a.name.localeCompare(b.name);
    });
    
    sortedMembers.forEach(function(member) {
        if (!isMemberInactive(member)) {
            var selected = (member.name === previousValue) ? 'selected' : '';
            dropdown.innerHTML += '<option value="' + escapeHtml(member.name) + '" ' + selected + '>' + escapeHtml(member.name) + '</option>';
        }
    });
}

// =================== OPEN SETLIST MODAL ===================

function openSetlistModal(memberId){
    currentMemberId=memberId;
    var member=members.find(function(m){return m.id===memberId});
    if(!member) return;
    
    if(isMemberInactive(member)){
        showNotification('warning', member.status==='graduated'?'Graduated':'Resigned', member.name+' sudah '+(member.status==='graduated'?'graduated':'resigned'));
        return;
    }
    
    document.getElementById('setlistMemberName').textContent='Member: '+member.name+' ('+(member.status==='trainee'?'TRAINEE':'INTI')+')';
    
    document.getElementById('showDate').value = getTodayDate();
    document.getElementById('showTime').value = '19:00';
    
    buildSetlistOptions(member, '');
    
    // Sembunyikan custom field dan info
    document.getElementById('customSetlistField').classList.remove('show');
    document.getElementById('customSetlistName').value = '';
    document.getElementById('setlistInfo').style.display='none';
    
    // Reset semua checkbox
    document.getElementById('isBirthdayShow').checked = false;
    document.getElementById('birthdayMember').value = '';
    document.getElementById('birthdayMemberField').classList.remove('show');
    
    document.getElementById('isGraduationShow').checked = false;
    document.getElementById('graduationMember').value = member.name; // Auto select current member
    document.getElementById('graduationMemberField').classList.remove('show');
    
    // Reset Non-Show Activity & Schedule Kosong
    document.getElementById('isNonShowActivity').checked = false;
    document.getElementById('setlistNonShowInfo').classList.remove('show');
    document.getElementById('isEmptySchedule').checked = false;
    document.getElementById('setlistEmptyInfo').classList.remove('show');
    
    // Reset nama member manual
    var nameInput = document.getElementById('setlistMemberNameInput');
    if (nameInput) nameInput.value = '';
    
    // Dark mode footer
    var footer = document.getElementById('setlistFooter');
    if (footer) footer.style.background = '#111827';
    
    // Pre-populate dropdowns
    populateMemberDropdown('birthdayMember');
    populateMemberDropdown('graduationMember');

    // Trainee: sembunyikan Birthday & Graduation, hanya tampilkan Non-Show
    var isTrainee = member.status === 'trainee';
    document.getElementById('setlist-birthday-card').style.display = isTrainee ? 'none' : 'block';
    document.getElementById('setlist-graduation-card').style.display = isTrainee ? 'none' : 'block';
    
    document.getElementById('setlistModal').style.display='flex';
}

function closeSetlistModal(){
    document.getElementById('setlistModal').style.display='none';
    currentMemberId=null;
    var nameInput = document.getElementById('setlistMemberNameInput');
    if (nameInput) nameInput.value = '';
}

// =================== BULK ADD MODAL ===================

function openBulkAddModal(){
    document.getElementById('bulkShowDate').value = getTodayDate();
    document.getElementById('bulkShowTime').value = '19:00';
    
    buildSetlistOptionsAll('');
    
    // Reset custom field
    document.getElementById('bulkCustomSetlistField').classList.remove('show');
    document.getElementById('bulkCustomSetlistName').value = '';
    
    document.getElementById('bulkMemberNames').value='';
    
    // Reset semua checkbox di bulk modal
    document.getElementById('bulkIsBirthdayShow').checked = false;
    document.getElementById('bulkBirthdayMember').value = '';
    document.getElementById('bulkBirthdayMemberField').classList.remove('show');
    
    document.getElementById('bulkIsGraduationShow').checked = false;
    document.getElementById('bulkGraduationMember').value = '';
    document.getElementById('bulkGraduationMemberField').classList.remove('show');
    
    // Reset Non-Show Activity & Schedule Kosong
    document.getElementById('bulkIsNonShowActivity').checked = false;
    document.getElementById('bulkNonShowInfo').classList.remove('show');
    document.getElementById('bulkIsEmptySchedule').checked = false;
    document.getElementById('bulkEmptyScheduleInfo').classList.remove('show');
    document.getElementById('bulkMemberSection').style.opacity = '1';
    
    // Pre-populate dropdowns
    populateMemberDropdown('bulkBirthdayMember');
    populateMemberDropdown('bulkGraduationMember');

    document.getElementById('bulkAddModal').style.display='flex';
}

function closeBulkAddModal(){
    document.getElementById('bulkAddModal').style.display='none';
}

// =================== SHOW MANAGEMENT FUNCTIONS ===================

async function addShowWithSetlist(){
    // Dapatkan setlist (bisa dari pilihan atau custom)
    var setlist = getSelectedSetlist('setlistSelectWrap', 'customSetlistName');
    if (!setlist) return; // Error sudah ditampilkan di getSelectedSetlist
    
    var showDate=document.getElementById('showDate').value;
    var showTime=document.getElementById('showTime').value;
    var isBirthdayShow=document.getElementById('isBirthdayShow').checked;
    var birthdayMember=document.getElementById('birthdayMember').value;
    var isGraduationShow=document.getElementById('isGraduationShow').checked;
    var graduationMember=document.getElementById('graduationMember').value;
    var isNonShowActivity=document.getElementById('isNonShowActivity').checked;
    var isEmptySchedule=document.getElementById('isEmptySchedule').checked;
    
    if(!setlist){
        showNotification('warning', 'Peringatan', 'Pilih setlist dulu');
        return;
    }
    
    if(!showDate){
        showDate = getTodayDate();
    }
    
    if(!showTime){
        showTime = '19:00:00';
    } else {
        if (showTime.length === 5) {
            showTime = showTime + ':00';
        }
    }
    
    // Cek apakah ada input nama manual (untuk retry bulk add yang gagal)
    var manualName = document.getElementById('setlistMemberNameInput') ? document.getElementById('setlistMemberNameInput').value.trim() : '';
    var member = null;
    
    if (manualName) {
        // Cari member berdasarkan nama yang diketik
        member = members.find(function(m){ return m.name.toLowerCase() === manualName.toLowerCase(); });
        if (!member) {
            showNotification('error', 'Tidak Ditemukan', '"' + manualName + '" tidak ada di database');
            return;
        }
        currentMemberId = member.id;
    } else {
        if(!currentMemberId) return;
        member = members.find(function(m){return m.id===currentMemberId});
        if(!member) return;
    }
    
    if(isMemberInactive(member)){
        showNotification('error', member.status==='graduated'?'Graduated':'Resigned', member.name+' sudah '+(member.status==='graduated'?'graduated':'resigned'));
        closeSetlistModal();
        return;
    }
    
    if (isBirthdayShow && isGraduationShow) {
        showNotification('error', 'Konflik', 'Birthday & Graduation tidak bisa bersamaan');
        return;
    }

    // Jika schedule kosong: insert tanpa member_id
    if (isEmptySchedule) {
        try {
            var emptyData = {
                member_id: null,
                setlist_name: setlist,
                show_date: showDate,
                show_time: showTime,
                is_birthday_show: false,
                birthday_member: null,
                is_graduation_show: false,
                graduation_member: null,
                is_non_show: isNonShowActivity,
                created_at: new Date().toISOString()
            };
            var emptyResult = await db.from('setlist_performance').insert([emptyData]).select();
            if (emptyResult.error) throw emptyResult.error;
            showNotification('success', 'Schedule Dibuat', 'Schedule kosong berhasil dibuat. Tambah member lewat Edit Show.');
            closeSetlistModal();
            await loadData();
            return;
        } catch(err) {
            showNotification('error', 'Error', 'Gagal buat schedule: ' + err.message);
            return;
        }
    }
    
    try {
        var setlistData={
            member_id: currentMemberId,
            setlist_name:setlist,
            show_date:showDate,
            show_time:showTime,
            is_birthday_show: isBirthdayShow,
            birthday_member: isBirthdayShow ? birthdayMember : null,
            is_graduation_show: isGraduationShow,
            graduation_member: isGraduationShow ? graduationMember : null,
            is_non_show: isNonShowActivity,
            created_at:new Date().toISOString()
        };
        
        var insertResult=await db.from('setlist_performance')
            .insert([setlistData])
            .select();
        
        if(insertResult.error){
            console.error('Insert error:',insertResult.error);
            showNotification('error', 'Insert Error', 'Gagal insert setlist: '+insertResult.error.message);
            return;
        }

        // Jika graduation show, set graduation_date = tanggal show. Status baru final kalau tanggalnya sudah lewat/hari ini.
        if (isGraduationShow && graduationMember) {
            var gradMember = members.find(function(m){ return m.name === graduationMember; });
            if (gradMember) {
                var isGradImmediate = showDate <= todayDateStr();
                var gradUpdateData = { graduation_date: showDate, resign_date: null };
                if (isGradImmediate) {
                    gradUpdateData.is_graduated = true;
                    gradUpdateData.is_resigned = false;
                    gradUpdateData.status = 'graduated';
                }
                await db.from('members').update(gradUpdateData).eq('id', gradMember.id);
            }
        }
        
        // Reload data members untuk mendapatkan count yang updated dari trigger
        await loadData();
        
        // Refresh member dari data terbaru
        var updatedMember = members.find(function(m){ return m.id === currentMemberId; }) || member;
        
        // Add activity log
        var activityText = '';
        if (isGraduationShow) {
            activityText = setlist + ' (LAST SHOW - ' + graduationMember + ')';
        } else if (isBirthdayShow) {
            activityText = setlist + ' (STS ' + birthdayMember + ')';
        } else {
            activityText = setlist;
        }
        
        // Hitung count show
        var countResult = await db.from('setlist_performance')
            .select('id', { count: 'exact', head: true })
            .eq('member_id', updatedMember.id)
            .eq('is_non_show', false);
        var displayCount = countResult.count || updatedMember.show;
        
        addActivity(updatedMember.name, 1, displayCount, activityText, updatedMember.status, showDate, showTime, false, isBirthdayShow, isGraduationShow);
        
        // Close modal
        closeSetlistModal();
        
        // Show success notification
        var successMessage = '';
        if (isGraduationShow) {
            successMessage = '[GRADUATED] ' + member.name + ' telah GRADUATED! Last show: ' + member.show + ' show (' + activityText + ')';
            showNotification('success', 'Graduation Success', successMessage);
        } else {
            successMessage = member.name + ': ' + member.show + ' show (' + activityText + ' - ' + formatDate(showDate) + ' ' + formatTime(showTime) + ')';
            showNotification('success', 'Show Added', successMessage);
        }
        
    } catch(err) {
        console.error('Exception:',err);
        showNotification('error', 'Error', 'Error: '+err.message);
    }
}

async function bulkAddShows(){
    // Dapatkan setlist (bisa dari pilihan atau custom)
    var setlist = getSelectedSetlist('bulkSetlistSelectWrap', 'bulkCustomSetlistName');
    if (!setlist) return; // Error sudah ditampilkan di getSelectedSetlist
    
    var namesInput=document.getElementById('bulkMemberNames').value;
    var showDate=document.getElementById('bulkShowDate').value;
    var showTime=document.getElementById('bulkShowTime').value;
    var isBirthdayShow=document.getElementById('bulkIsBirthdayShow').checked;
    var birthdayMember=document.getElementById('bulkBirthdayMember').value;
    var isGraduationShow=document.getElementById('bulkIsGraduationShow').checked;
    var graduationMember=document.getElementById('bulkGraduationMember').value;
    var isNonShowActivity=document.getElementById('bulkIsNonShowActivity').checked;
    var isEmptySchedule=document.getElementById('bulkIsEmptySchedule').checked;
    
    if(!setlist){
        showNotification('warning', 'Peringatan', 'Pilih setlist dulu');
        return;
    }
    
    if(!showDate){
        showDate = getTodayDate();
    }
    
    if(!showTime){
        showTime = '19:00:00';
    } else {
        if (showTime.length === 5) {
            showTime = showTime + ':00';
        }
    }

    // Jika schedule kosong: insert 1 row tanpa member_id
    if (isEmptySchedule) {
        try {
            var emptyBulkData = {
                member_id: null,
                setlist_name: setlist,
                show_date: showDate,
                show_time: showTime,
                is_birthday_show: false,
                birthday_member: null,
                is_graduation_show: false,
                graduation_member: null,
                is_non_show: isNonShowActivity,
                created_at: new Date().toISOString()
            };
            var emptyBulkResult = await db.from('setlist_performance').insert([emptyBulkData]).select();
            if (emptyBulkResult.error) throw emptyBulkResult.error;
            showNotification('success', 'Schedule Dibuat', 'Schedule kosong berhasil dibuat. Tambah member lewat Edit Show.');
            closeBulkAddModal();
            await loadData();
            return;
        } catch(err) {
            showNotification('error', 'Error', 'Gagal buat schedule: ' + err.message);
            return;
        }
    }

    if(!namesInput.trim()){
        showNotification('warning', 'Peringatan', 'Masukkan nama member');
        return;
    }
    
    var names=namesInput.split(',').map(function(n){return n.trim()}).filter(function(n){return n.length>0});
    
    if(names.length===0){
        showNotification('warning', 'Peringatan', 'Tidak ada nama yang valid');
        return;
    }
    
    if (isBirthdayShow && isGraduationShow) {
        showNotification('error', 'Konflik', 'Birthday & Graduation tidak bisa bersamaan');
        return;
    }
    
    var successCount=0;
    var failedNames=[];
    
    showNotification('info', 'Processing', 'Memproses '+names.length+' member...', 2000);
    
    var bulkData = [];
    
    for(var i=0;i<names.length;i++){
        var name=names[i];
        var member=members.find(function(m){return m.name.toLowerCase()===name.toLowerCase()});
        
        if(!member){
            failedNames.push(name+' (tidak ditemukan)');
            continue;
        }
        
        if(isMemberInactive(member)){
            failedNames.push(name+' (sudah '+(member.status==='graduated'?'graduated':'resigned')+')');
            continue;
        }
        
        var showData = {
            member_id: member.id,
            setlist_name: setlist,
            show_date: showDate,
            show_time: showTime,
            is_birthday_show: isBirthdayShow,
            birthday_member: isBirthdayShow ? birthdayMember : null,
            is_graduation_show: isGraduationShow,
            graduation_member: isGraduationShow ? graduationMember : null,
            is_non_show: isNonShowActivity,
            created_at: new Date().toISOString()
        };
        
        bulkData.push(showData);
        successCount++;
    }
    
    if (bulkData.length === 0) {
        showNotification('error', 'Bulk Add', 'Tidak ada data valid');
        return;
    }
    
    try {
        // Insert semua data sekaligus
        var insertResult = await db.from('setlist_performance')
            .insert(bulkData)
            .select();
        
        if(insertResult.error){
            console.error('Bulk insert error:', insertResult.error);
            showNotification('error', 'Bulk Insert Error', 'Gagal insert bulk data: ' + insertResult.error.message);
            return;
        }
        
        // Jika graduation show, set graduation_date = tanggal show. Status baru final kalau tanggalnya sudah lewat/hari ini.
        if (isGraduationShow && graduationMember) {
            var gradMemberBulk = members.find(function(m){ return m.name === graduationMember; });
            if (gradMemberBulk) {
                var isGradImmediateBulk = showDate <= todayDateStr();
                var gradUpdateDataBulk = { graduation_date: showDate, resign_date: null };
                if (isGradImmediateBulk) {
                    gradUpdateDataBulk.is_graduated = true;
                    gradUpdateDataBulk.is_resigned = false;
                    gradUpdateDataBulk.status = 'graduated';
                }
                await db.from('members').update(gradUpdateDataBulk).eq('id', gradMemberBulk.id);
            }
        }
        
        // Reload data members
        await loadData();
        
        for (var showData of bulkData) {
            var member = members.find(function(m) { return m.id === showData.member_id });
            if (member) {
                var activityText = setlist;
                if (showData.is_graduation_show) {
                    activityText += ' (LAST SHOW - ' + showData.graduation_member + ')';
                } else if (showData.is_birthday_show) {
                    activityText += ' (STS ' + showData.birthday_member + ')';
                }
                var countRes = await db.from('setlist_performance')
                    .select('id', { count: 'exact', head: true })
                    .eq('member_id', member.id)
                    .eq('is_non_show', false);
                var displayCount = countRes.count || member.show;
                addActivity(member.name, 1, displayCount, activityText, member.status, showData.show_date, showData.show_time, false, showData.is_birthday_show, showData.is_graduation_show);
            }
        }

        failedNames.forEach(function(failedEntry) {
            addActivityFailed(failedEntry);
        });
        
        closeBulkAddModal();
        
        var toastDateInfo = formatDate(showDate)+' '+formatTime(showTime);
        var toastBirthdayInfo = isBirthdayShow ? ' (STS ' + birthdayMember + ')' : '';
        var toastGraduationInfo = isGraduationShow ? ' (LAST SHOW - ' + graduationMember + ')' : '';
        
        if (isGraduationShow) {
            showNotification('success', 'Success', ''+successCount+' member berhasil! ' + graduationMember + ' telah GRADUATED!'+toastBirthdayInfo+' ('+toastDateInfo+')');
        } else {
            showNotification('success', 'Success', ''+successCount+' member berhasil ditambahkan!'+toastBirthdayInfo+toastGraduationInfo+' ('+toastDateInfo+')');
        }
        
    } catch(err) {
        console.error('Bulk add exception:', err);
        showNotification('error', 'Bulk Add Error', 'Error: ' + err.message);
    }
}

async function updateShow(id, change){
    var member = members.find(function(m) { return m.id === id });
    if (!member) return;
    
    if(isMemberInactive(member)){
        showNotification('warning', member.status==='graduated'?'Graduated':'Resigned', member.name+' sudah '+(member.status==='graduated'?'graduated':'resigned'));
        return;
    }
    
    // Cari show terakhir untuk member ini
    var setlistResult = await db.from('setlist_performance')
        .select('*')
        .eq('member_id', member.id)
        .order('created_at', { ascending: false })
        .limit(1);
    
    var lastSetlist = null;
    if (setlistResult.data && setlistResult.data.length > 0) {
        lastSetlist = setlistResult.data[0];
        
        if (lastSetlist.is_graduation_show && change < 0) {
            showNotification('error', 'Graduation', 'Show graduation tidak bisa dikurangi');
            return;
        }
        
        // Catatan: show yang sudah lewat tetap bisa dihapus oleh admin
    }
    
    if (change < 0) {
        showConfirmToast(
            member,
            lastSetlist,
            async function() {
                await doRemoveShow(member, lastSetlist);
            }
        );
        return;
    }
    
    if (change > 0) {
        openSetlistModal(member.id);
    }
}

function showConfirmToast(member, lastSetlist, onConfirm) {
    var modal = document.getElementById('confirmDeleteModal');
    var desc = document.getElementById('confirmDeleteDesc');
    var btn = document.getElementById('confirmDeleteBtn');

    var detailHtml = '';
    if (lastSetlist) {
        var tgl = lastSetlist.show_date ? formatDate(lastSetlist.show_date) : '-';
        var jam = lastSetlist.show_time ? formatTime(lastSetlist.show_time) : '-';
        var setlist = lastSetlist.setlist_name || '-';
        var extra = '';
        if (lastSetlist.is_birthday_show) extra = ' <span style="background:#fef3c7;color:#92400e;font-size:10px;font-weight:700;padding:2px 7px;border-radius:10px;">STS ' + escapeHtml(lastSetlist.birthday_member || '') + '</span>';
        if (lastSetlist.is_graduation_show) extra = ' <span style="background:#ede9fe;color:#5b21b6;font-size:10px;font-weight:700;padding:2px 7px;border-radius:10px;">LAST SHOW</span>';
        if (lastSetlist.is_non_show) extra = ' <span style="background:#dcfce7;color:#166534;font-size:10px;font-weight:700;padding:2px 7px;border-radius:10px;">NON-SHOW</span>';

        // Cek apakah show sudah lewat
        var showPassed = false;
        if (lastSetlist.show_date && lastSetlist.show_time) {
            var showDateTime = new Date(lastSetlist.show_date + 'T' + lastSetlist.show_time);
            showPassed = showDateTime < new Date();
        } else if (lastSetlist.show_date) {
            showPassed = new Date(lastSetlist.show_date) < new Date();
        }

        var liveshowParams = 'liveshow.html?setlist=' + encodeURIComponent(lastSetlist.setlist_name || '') +
            '&date=' + encodeURIComponent(lastSetlist.show_date || '') +
            '&time=' + encodeURIComponent(lastSetlist.show_time || '') +
            '&source=admin';

        var liveshowLink = showPassed ? '' :
            '<a href="' + escapeHtml(liveshowParams) + '" target="_blank" rel="noopener noreferrer" style="display:flex;align-items:center;justify-content:center;gap:6px;margin-top:12px;padding:9px;background:#e60012;color:#fff;border-radius:10px;font-size:13px;font-weight:700;text-decoration:none;">' +
                '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>' +
                'Lihat Live Show' +
            '</a>';

        detailHtml =
            '<div style="background:#f9fafb;border-radius:12px;padding:14px 16px;margin:14px 0 20px;text-align:left;border:1px solid #e5e7eb;">' +
                '<div style="font-size:11px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">Detail Show Terakhir</div>' +
                '<div style="display:flex;flex-direction:column;gap:8px;">' +
                    '<div style="display:flex;align-items:center;gap:8px;font-size:13px;">' +
                        '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>' +
                        '<span style="color:#6b7280;">Member</span>' +
                        '<span style="font-weight:700;color:#111;margin-left:auto;">' + escapeHtml(member.name) + '</span>' +
                    '</div>' +
                    '<div style="display:flex;align-items:center;gap:8px;font-size:13px;">' +
                        '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' +
                        '<span style="color:#6b7280;">Tanggal</span>' +
                        '<span style="font-weight:700;color:#111;margin-left:auto;">' + tgl + '</span>' +
                    '</div>' +
                    '<div style="display:flex;align-items:center;gap:8px;font-size:13px;">' +
                        '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' +
                        '<span style="color:#6b7280;">Jam</span>' +
                        '<span style="font-weight:700;color:#111;margin-left:auto;">' + jam + '</span>' +
                    '</div>' +
                    '<div style="display:flex;align-items:center;gap:8px;font-size:13px;">' +
                        '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>' +
                        '<span style="color:#6b7280;">Setlist</span>' +
                        '<span style="font-weight:700;color:#111;margin-left:auto;">' + escapeHtml(setlist) + extra + '</span>' +
                    '</div>' +
                '</div>' +
                liveshowLink +
            '</div>';
    } else {
        detailHtml = '<p style="font-size:13px;color:#6b7280;margin:12px 0 20px;">Tidak ada data show yang bisa dihapus.</p>';
    }

    desc.innerHTML = detailHtml;
    modal.style.display = 'flex';

    var newBtn = document.getElementById('confirmDeleteBtn');
    var clone = newBtn.cloneNode(true);
    newBtn.parentNode.replaceChild(clone, newBtn);
    document.getElementById('confirmDeleteBtn').onclick = function() {
        closeConfirmDeleteModal();
        onConfirm();
    };
}

function closeConfirmDeleteModal() {
    document.getElementById('confirmDeleteModal').style.display = 'none';
}

function dismissConfirmToast() { closeConfirmDeleteModal(); }

async function doRemoveShow(member, lastSetlist) {
    try {
        if (lastSetlist) {
            // Pakai .select() agar Supabase return row terhapus — tanpa ini RLS block tidak terdeteksi
            var delResult = await db.from('setlist_performance')
                .delete()
                .eq('id', lastSetlist.id)
                .select();

            if (delResult.error) {
                if (delResult.error.code === '42501' || (delResult.error.message && delResult.error.message.toLowerCase().includes('permission'))) {
                    showNotification('error', 'Akses Ditolak', 'Hapus gagal. Buka Supabase → Table Editor → setlist_performance → Policies → tambah DELETE policy.');
                } else {
                    showNotification('error', 'Gagal Hapus', delResult.error.message);
                }
                return;
            }
            // Supabase v2: RLS block tidak return error, tapi data kosong — verifikasi manual
            if (!delResult.data || delResult.data.length === 0) {
                var checkRes = await db.from('setlist_performance').select('id').eq('id', lastSetlist.id).maybeSingle();
                if (checkRes.data) {
                    showNotification('error', 'Akses Ditolak', 'Hapus gagal — aktifkan DELETE policy di Supabase untuk tabel setlist_performance.');
                    return;
                }
            }

            // Kurangi -1 show di tabel members (kalau bukan non-show)
            if (!lastSetlist.is_non_show) {
                var currentMember = members.find(function(m){ return m.id === member.id; }) || member;
                await db.from('members')
                    .update({ show: Math.max((currentMember.show || 0) - 1, 0) })
                    .eq('id', member.id);
            }

            await loadData();
            var updatedMember = members.find(function(m){ return m.id === member.id; }) || member;
            var activityText = lastSetlist.setlist_name;
            if (lastSetlist.is_graduation_show) activityText += ' (LAST SHOW)';
            else if (lastSetlist.is_birthday_show) activityText += ' (STS ' + lastSetlist.birthday_member + ')';
            addActivity(updatedMember.name, -1, updatedMember.show, activityText, updatedMember.status, lastSetlist.show_date, lastSetlist.show_time);
            showNotification('success', 'Dihapus', updatedMember.name + ': show dikurangi');
        }
    } catch (err) {
        console.error('Update error:', err);
        showNotification('error', 'Update Error', 'Gagal update: ' + err.message);
    }
}

// =================== EDIT SHOW FUNCTIONS ===================

async function openEditShow(showId) {
    currentEditShowId = showId;
    
    try {
        // Ambil data show dari database
        var result = await db.from('setlist_performance')
            .select('*, members(name, status)')
            .eq('id', showId)
            .single();
        
        if (result.error) {
            throw result.error;
        }
        
        currentEditShowData = result.data;
        
        // Tampilkan info original
        var originalInfo = 'Mengedit show untuk ' + 
                          (currentEditShowData.members ? currentEditShowData.members.name : 'Unknown') + 
                          ' pada ' + formatDate(currentEditShowData.show_date) + 
                          ' ' + formatTime(currentEditShowData.show_time);
        document.getElementById('editShowOriginalInfo').textContent = originalInfo;
        
        // Load dropdown member — difilter nanti setelah setlist dipilih
        var memberSelect = document.getElementById('editMemberSelect');
        memberSelect.innerHTML = '<option value="">-- Pilih Member --</option>';
        
        // Tampilkan semua member dulu (akan difilter ulang setelah setlist di-set)
        var sortedEditMembers = members.slice().sort(function(a,b){ return a.name.localeCompare(b.name); });
        sortedEditMembers.forEach(function(member) {
            if (isMemberInactive(member)) return;
            var selected = (member.id === currentEditShowData.member_id) ? 'selected' : '';
            memberSelect.innerHTML += '<option value="' + escapeHtml(member.id) + '" ' + selected + '>' + escapeHtml(member.name) + '</option>';
        });
        
        // Set tanggal dan waktu
        document.getElementById('editShowDate').value = currentEditShowData.show_date;
        
        var timeValue = currentEditShowData.show_time;
        if (timeValue && timeValue.length >= 5) {
            document.getElementById('editShowTime').value = timeValue.substring(0, 5);
        } else {
            document.getElementById('editShowTime').value = '19:00';
        }
        
        // Load setlist — berdasarkan team/status member
        var editMemberForSetlist = members.find(function(m){ return m.id === currentEditShowData.member_id; });
        var allSetlists = Object.assign({}, SETLIST_INTI, SETLIST_TRAINEE);
        var isCustomSetlist = currentEditShowData.setlist_name && !allSetlists[currentEditShowData.setlist_name];
        // Kalau custom, render tanpa pre-select (nanti set manual); kalau normal, pre-select via currentValue
        var preSelectVal = isCustomSetlist ? '__custom__' : (currentEditShowData.setlist_name || '');
        document.getElementById('editSetlistSelectWrap') && (document.getElementById('editSetlistSelectWrap').innerHTML = '');
        buildEditSetlistOptions(editMemberForSetlist, preSelectVal);
        
        // Reset custom field
        document.getElementById('editCustomSetlistField').classList.remove('show');
        document.getElementById('editCustomSetlistName').value = '';
        
        if (isCustomSetlist) {
            document.getElementById('editCustomSetlistField').classList.add('show');
            document.getElementById('editCustomSetlistName').value = currentEditShowData.setlist_name;
        }
        
        // Filter member berdasarkan setlist yang aktif
        filterEditMemberBySetlist();

        // Reset & pre-fill birthday/graduation
        document.getElementById('editIsBirthdayShow').checked = !!currentEditShowData.is_birthday_show;
        document.getElementById('editIsGraduationShow').checked = !!currentEditShowData.is_graduation_show;
        editPopulateMemberDropdown('editBirthdayMember');
        editPopulateMemberDropdown('editGraduationMember');
        document.getElementById('editBirthdayMemberField').style.display = currentEditShowData.is_birthday_show ? 'block' : 'none';
        document.getElementById('editGraduationMemberField').style.display = currentEditShowData.is_graduation_show ? 'block' : 'none';
        if (currentEditShowData.is_birthday_show && currentEditShowData.birthday_member)
            document.getElementById('editBirthdayMember').value = currentEditShowData.birthday_member;
        if (currentEditShowData.is_graduation_show && currentEditShowData.graduation_member)
            document.getElementById('editGraduationMember').value = currentEditShowData.graduation_member;

        document.getElementById('editShowModal').style.display = 'flex';
        
    } catch (err) {
        console.error('Error loading show data:', err);
        showNotification('error', 'Edit Error', 'Gagal memuat data show: ' + err.message);
    }
}

function closeEditShowModal() {
    document.getElementById('editShowModal').style.display = 'none';
    currentEditShowId = null;
    currentEditShowData = null;
}

async function saveEditShow() {
    var memberId = document.getElementById('editMemberSelect').value;
    var showDate = document.getElementById('editShowDate').value;
    var showTime = document.getElementById('editShowTime').value;

    var setlist = getSelectedSetlist('editSetlistSelectWrap', 'editCustomSetlistName');
    if (!setlist) return;

    var isBirthdayShow = document.getElementById('editIsBirthdayShow').checked;
    var birthdayMember = isBirthdayShow ? document.getElementById('editBirthdayMember').value : null;
    var isGraduationShow = document.getElementById('editIsGraduationShow').checked;
    var graduationMember = isGraduationShow ? document.getElementById('editGraduationMember').value : null;

    if (!memberId) { showNotification('warning', 'Validasi', 'Pilih member dulu'); return; }
    if (!showDate) { showNotification('warning', 'Validasi', 'Masukkan tanggal show'); return; }
    if (isBirthdayShow && !birthdayMember) { showNotification('warning', 'Validasi', 'Pilih member birthday'); return; }
    if (isGraduationShow && !graduationMember) { showNotification('warning', 'Validasi', 'Pilih member graduation'); return; }

    try {
        var updateData = {
            member_id: memberId,
            setlist_name: setlist,
            show_date: showDate,
            show_time: showTime + ':00',
            is_non_show: false,
            is_birthday_show: isBirthdayShow,
            birthday_member: birthdayMember || null,
            is_graduation_show: isGraduationShow,
            graduation_member: graduationMember || null,
            updated_at: new Date().toISOString()
        };

        var oldMemberId = currentEditShowData.member_id;
        var newMemberId = memberId;
        var memberChanged = String(oldMemberId) !== String(newMemberId);

        var updateResult = await db.from('setlist_performance')
            .update(updateData)
            .eq('id', currentEditShowId)
            .select();
        
        if (updateResult.error) {
            if (updateResult.error.code === '42501' || (updateResult.error.message && updateResult.error.message.toLowerCase().includes('permission'))) {
                showNotification('error', 'Akses Ditolak', 'Tidak ada izin edit. Aktifkan UPDATE policy di Supabase untuk tabel setlist_performance.');
            } else {
                throw updateResult.error;
            }
            return;
        }

        // Kalau member berubah, +1 member baru, -1 member lama
        if (memberChanged) {
            var oldMemberData = members.find(function(m){ return m.id == oldMemberId; });
            var newMemberData = members.find(function(m){ return m.id == newMemberId; });

            // Kurangi -1 member lama
            await db.from('members')
                .update({ show: Math.max(((oldMemberData && oldMemberData.show) || 0) - 1, 0) })
                .eq('id', oldMemberId);

            // Tambah +1 member baru
            await db.from('members')
                .update({ show: ((newMemberData && newMemberData.show) || 0) + 1 })
                .eq('id', newMemberId);
        }

        // Jika graduation show, set graduation_date = tanggal show. Status baru final kalau tanggalnya sudah lewat/hari ini.
        if (isGraduationShow && graduationMember) {
            var gradMemberEdit = members.find(function(m){ return m.name === graduationMember; });
            if (gradMemberEdit) {
                var isGradImmediateEdit = showDate <= todayDateStr();
                var gradUpdateDataEdit = { graduation_date: showDate, resign_date: null };
                if (isGradImmediateEdit) {
                    gradUpdateDataEdit.is_graduated = true;
                    gradUpdateDataEdit.is_resigned = false;
                    gradUpdateDataEdit.status = 'graduated';
                }
                await db.from('members').update(gradUpdateDataEdit).eq('id', gradMemberEdit.id);
            }
        }
        
        // Reload semua data
        await loadData();
        
        // Tampilkan notifikasi sukses
        var oldMemberName = currentEditShowData.members ? currentEditShowData.members.name : 'Unknown';
        var newMemberName = selectedMember ? selectedMember.name : 'Unknown';
        
        var message = memberChanged
            ? 'Show berhasil dipindah: ' + oldMemberName + ' → ' + newMemberName + ' (' + setlist + ' - ' + formatDate(showDate) + ' ' + formatTime(showTime) + ')'
            : 'Show berhasil diupdate: ' + newMemberName + ' (' + setlist + ' - ' + formatDate(showDate) + ' ' + formatTime(showTime) + ')';
        
        showNotification('success', 'Edit Success', message);
        
        // Tutup modal
        closeEditShowModal();
        
    } catch (err) {
        console.error('Error updating show:', err);
        showNotification('error', 'Edit Error', 'Gagal update show: ' + err.message);
    }
}

// =================== OTHER FUNCTIONS ===================

function updateStats(){
    var filtered=members.filter(function(m){
        var matchGen=currentGen==='all'||m.gen==currentGen;
        var matchStatus=currentStatus==='all'||m.status===currentStatus;
        var matchSearch=!searchQuery||m.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchGen&&matchStatus&&matchSearch;
    });
    
    var total=filtered.length;
    var trainee=filtered.filter(function(m){return m.status==='trainee'}).length;
    var inti=filtered.filter(function(m){return m.status==='inti'}).length;
    var graduated=filtered.filter(function(m){return m.status==='graduated'}).length;
    var resigned=filtered.filter(function(m){return m.status==='resigned'}).length;
    var totalShows=filtered.reduce(function(sum,m){return sum+m.show},0);
    
    var statsText=total+' members • '+inti+' Inti • '+trainee+' Trainee • '+graduated+' Graduated • '+resigned+' Resigned • '+totalShows+' total show';
    if(currentGen!=='all') statsText+=' • Gen '+currentGen;
    if(currentStatus!=='all') statsText+=' • '+currentStatus.toUpperCase();
    if(searchQuery) statsText+=' • Search: "'+escapeHtml(searchQuery)+'"';
    
    document.getElementById('stats').innerHTML=statsText;
}

function filterType(status){
    currentStatus = status;
    currentGen = 'all';
    document.querySelectorAll('.filter').forEach(function(f) {
        f.classList.remove('active');
    });
    event.target.classList.add('active');
    renderMembers();
    updateStats();
}

function filterGen(gen){
    currentGen = gen;
    currentStatus = 'all';
    document.querySelectorAll('.filter').forEach(function(f) {
        f.classList.remove('active');
    });
    event.target.classList.add('active');
    renderMembers();
    updateStats();
}

function searchMember(){
    searchQuery=document.getElementById('searchInput').value.toLowerCase();
    renderMembers();
    updateStats();
}

function toggleClearBtn() {
    const btn = document.getElementById('searchClear');
    const icon = document.getElementById('searchIconSpan');
    const input = document.getElementById('searchInput');
    const hasValue = input.value.length > 0;
    if (btn) btn.classList.toggle('visible', hasValue);
    if (icon) icon.classList.toggle('hidden', hasValue);
}

function clearSearch(){
    document.getElementById('searchInput').value='';
    searchQuery='';
    toggleClearBtn();
    renderMembers();
    updateStats();
    document.getElementById('searchInput').focus();
}


async function login(){
    var email=document.getElementById('email').value.trim();
    var password=document.getElementById('password').value.trim();
    var error=document.getElementById('errorMsg');

    error.style.display='none';

    if(!email||!password){
        error.textContent='Email dan password harus diisi';
        error.style.display='block';
        return;
    }

    var loginBtn = document.getElementById('loginBtn');
    if (loginBtn) { loginBtn.disabled = true; }

    try {
        // SECURITY: real authentication via Supabase Auth instead of a hardcoded
        // client-side password table. Supabase verifies the credentials server-side
        // and returns a session; database access is then governed by RLS policies
        // tied to that session, not by anything running in this page.
        var { data, error: authError } = await db.auth.signInWithPassword({ email: email, password: password });
        if (authError || !data.session) {
            error.textContent='Email atau password salah';
            error.style.display='block';
            showNotification('error', 'Login', 'Email atau password salah');
            return;
        }
        document.getElementById('loginModal').style.display='none';
        loadData();
        loadActivityLog();
        showNotification('success', 'Login', 'Berhasil masuk');
    } catch (e) {
        error.textContent='Login gagal: ' + escapeHtml(e.message || 'unknown error');
        error.style.display='block';
    } finally {
        if (loginBtn) { loginBtn.disabled = false; }
    }
}

function logout(){
    document.getElementById('logoutModal').style.display='flex';
}

function closeLogoutModal(){
    document.getElementById('logoutModal').style.display='none';
}

async function confirmLogout(){
    await db.auth.signOut();
    finishLogout();
}

function finishLogout(){
    closeLogoutModal();
    // Reset form login
    var emailEl = document.getElementById('email');
    var passEl = document.getElementById('password');
    var errEl = document.getElementById('errorMsg');
    if (emailEl) emailEl.value = '';
    if (passEl) { passEl.value = ''; passEl.type = 'password'; }
    if (errEl) errEl.textContent = '';
    // Reset eye icon ke default
    var eyeBtn = document.getElementById('eyeBtn');
    var eyeIcon = document.getElementById('eyeIcon');
    if (eyeBtn) eyeBtn.style.color = '#9ca3af';
    if (eyeIcon) eyeIcon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
    document.getElementById('loginModal').style.display='flex';
    showNotification('info', 'Logout', 'Berhasil keluar');
}



// =================== MEMBER SHOW LIST FUNCTIONS ===================

async function openMemberShowList(memberId) {
    var member = members.find(function(m){ return m.id === memberId; });
    if (!member) return;

    document.getElementById('mslSubtitle').textContent = member.name + ' — pilih show yang ingin diedit';
    document.getElementById('mslList').innerHTML = '<div class="msl-loading"><div class="spinner" style="width:18px;height:18px;border-width:2px;border-top-color:#3b82f6;"></div> Memuat show...</div>';
    document.getElementById('memberShowListModal').style.display = 'flex';

    try {
        var now = new Date();

        var todayStr = now.toISOString().split('T')[0];
        var SHOW_DURATION_MINUTES = 150;

        var result = await db.from('setlist_performance')
            .select('id, setlist_name, show_date, show_time')
            .eq('member_id', memberId)
            .gte('show_date', todayStr)
            .order('show_date', { ascending: true })
            .order('show_time', { ascending: true });

        if (result.error) throw result.error;

        // Filter client-side: hanya show yang belum lewat jam tayang + 150 menit
        var upcomingShows = (result.data || []).filter(function(s) {
            if (!s.show_time) return false;
            var showStart = new Date(s.show_date + 'T' + s.show_time);
            var showEnd = new Date(showStart.getTime() + SHOW_DURATION_MINUTES * 60000);
            return showEnd > now;
        });

        if (upcomingShows.length === 0) {
            document.getElementById('mslList').innerHTML = '<div class="msl-empty">Tidak ada show yang bisa diedit.</div>';
            return;
        }

        var html = upcomingShows.map(function(s) {
            var dateStr = formatDate(s.show_date);
            var timeStr = s.show_time ? formatTime(s.show_time) : '';
            var meta = dateStr + (timeStr ? ' · ' + timeStr : '');
            return '<div class="msl-item" onclick="pickShowToEdit(' + s.id + ')">' +
                '<div>' +
                  '<div class="msl-setlist">' + escapeHtml(s.setlist_name || '—') + '</div>' +
                  '<div class="msl-date">' + meta + '</div>' +
                '</div>' +
                '<div class="msl-arrow">›</div>' +
            '</div>';
        }).join('');

        document.getElementById('mslList').innerHTML = html;

    } catch(err) {
        document.getElementById('mslList').innerHTML = '<div class="msl-empty" style="color:#ef4444;">Gagal memuat: ' + escapeHtml(err.message) + '</div>';
    }
}

function closeMemberShowList() {
    document.getElementById('memberShowListModal').style.display = 'none';
}

function pickShowToEdit(showId) {
    closeMemberShowList();
    openEditShow(showId);
}

// =================== END MEMBER SHOW LIST FUNCTIONS ===================

// =================== DELETE SHOW FUNCTIONS ===================

var dslCurrentShowId = null;
var dslShowCache = {};

async function openDeleteShowModal() {
    document.getElementById('dslSubtitle').textContent = 'Pilih show yang ingin dihapus';
    document.getElementById('dslList').innerHTML = '<div class="msl-loading"><div class="spinner" style="width:18px;height:18px;border-width:2px;border-top-color:#ef4444;"></div> Memuat show...</div>';
    document.getElementById('deleteShowListModal').style.display = 'flex';
    dslShowCache = {};

    try {
        var now = new Date();
        var todayStr = now.toISOString().split('T')[0];
        var SHOW_DURATION_MINUTES = 150;

        var result = await db.from('setlist_performance')
            .select('id, setlist_name, show_date, show_time, is_non_show, member_id, members(name)')
            .gte('show_date', todayStr)
            .order('show_date', { ascending: true })
            .order('show_time', { ascending: true });

        if (result.error) throw result.error;

        // Filter: hanya show yang belum selesai (showEnd > now), sama seperti edit modal
        var shows = (result.data || []).filter(function(s) {
            if (!s.show_time) return false;
            var showStart = new Date(s.show_date + 'T' + s.show_time);
            var showEnd = new Date(showStart.getTime() + SHOW_DURATION_MINUTES * 60000);
            return showEnd > now;
        });

        if (shows.length === 0) {
            document.getElementById('dslList').innerHTML = '<div class="msl-empty">Tidak ada show mendatang.</div>';
            return;
        }

        // Group by setlist + date + time
        var groupMap = {};
        shows.forEach(function(s) {
            var key = (s.setlist_name || '') + '|' + s.show_date + '|' + (s.show_time || '');
            if (!groupMap[key]) {
                groupMap[key] = { setlist_name: s.setlist_name, show_date: s.show_date, show_time: s.show_time, is_non_show: s.is_non_show, members: [], ids: [] };
            }
            // Hanya push member jika member_id tidak null
            if (s.member_id) {
                groupMap[key].members.push({ id: s.member_id, name: s.members ? s.members.name : '?', rowId: s.id });
            }
            groupMap[key].ids.push(s.id);
            dslShowCache[s.id] = s;
        });

        var listEl = document.getElementById('dslList');
        listEl.innerHTML = '';

        Object.values(groupMap).forEach(function(g) {
            var dateStr = formatDate(g.show_date);
            var timeStr = g.show_time ? formatTime(g.show_time) : '';
            var meta = dateStr + (timeStr ? ' · ' + timeStr : '');
            var nonShowLabel = g.is_non_show ? '<span style="font-size:10px;background:#6b7280;color:#fff;border-radius:4px;padding:2px 7px;white-space:nowrap;">Non-Show</span>' : '';
            var memberNames = g.members.map(function(m){ return escapeHtml(m.name); }).join(', ');

            var item = document.createElement('div');
            item.className = 'msl-item';
            item.style.cursor = 'default';
            item.innerHTML =
                '<div style="flex:1;min-width:0;">' +
                  '<div class="msl-setlist">' + escapeHtml(g.setlist_name || '—') + nonShowLabel + '</div>' +
                  '<div class="msl-date">' + meta + '</div>' +
                  '<div style="font-size:11px;color:#9ca3af;margin-top:2px;">' + memberNames + '</div>' +
                '</div>' +
                '<div class="msl-actions">' +
                  '<button class="msl-btn-del">✕ Hapus</button>' +
                '</div>';

            item.querySelector('button').addEventListener('click', function() {
                confirmDslDelete(g);
            });

            listEl.appendChild(item);
        });

    } catch(err) {
        document.getElementById('dslList').innerHTML = '<div class="msl-empty" style="color:#ef4444;">Gagal memuat: ' + escapeHtml(err.message) + '</div>';
    }
}

function closeDeleteShowModal() {
    document.getElementById('deleteShowListModal').style.display = 'none';
    dslCurrentShowId = null;
    dslShowCache = {};
}

function confirmDslDelete(group) {
    var dateStr = formatDate(group.show_date);
    var timeStr = group.show_time ? formatTime(group.show_time) : '';
    document.getElementById('confirmDslDesc').textContent = (group.setlist_name || '—') + ' · ' + dateStr + (timeStr ? ' · ' + timeStr : '');

    // Isi chips member
    var chipsHtml = group.members.map(function(m){
        return '<div class="dsl-member-chip">' + escapeHtml(m.name) + '</div>';
    }).join('');
    document.getElementById('confirmDslMembers').innerHTML = chipsHtml;

    // Isi dropdown member (default: hapus seluruh show ini)
    var select = document.getElementById('dslMemberSelect');
    select.innerHTML = '<option value="entire">🗑 Hapus Show Ini (semua ' + group.members.length + ' member)</option>';
    group.members.forEach(function(m){
        var opt = document.createElement('option');
        opt.value = m.rowId;
        opt.textContent = '👤 Hapus ' + m.name + ' saja';
        select.appendChild(opt);
    });

    // Simpan group ke variabel
    window._dslCurrentGroup = group;
    document.getElementById('confirmDslModal').style.display = 'flex';
}

async function doDeleteDslShow() {
    var group = window._dslCurrentGroup;
    if (!group) return;
    var select = document.getElementById('dslMemberSelect');
    var val = select.value;
    document.getElementById('confirmDslModal').style.display = 'none';

    try {
        var idsToDelete;
        if (val === 'entire') {
            // Hapus semua row untuk show ini (semua member + null placeholder)
            idsToDelete = group.ids;
        } else {
            // Hapus 1 member saja dari show ini
            idsToDelete = [parseInt(val)];
        }

        for (var i = 0; i < idsToDelete.length; i++) {
            // Pakai .select() agar Supabase return row terhapus — tanpa ini RLS block tidak terdeteksi
            var delRes = await db.from('setlist_performance').delete().eq('id', idsToDelete[i]).select();
            if (delRes.error) {
                if (delRes.error.code === '42501' || (delRes.error.message && delRes.error.message.toLowerCase().includes('permission'))) {
                    showNotification('error', 'Akses Ditolak', 'Hapus gagal. Buka Supabase → Table Editor → setlist_performance → Policies → tambah DELETE policy.');
                    return;
                }
                throw delRes.error;
            }
            // Supabase v2: RLS block tidak return error, tapi data kosong — verifikasi manual
            if (!delRes.data || delRes.data.length === 0) {
                var checkRes = await db.from('setlist_performance').select('id').eq('id', idsToDelete[i]).maybeSingle();
                if (checkRes.data) {
                    showNotification('error', 'Akses Ditolak', 'Hapus gagal — aktifkan DELETE policy di Supabase untuk tabel setlist_performance.');
                    return;
                }
            }
        }

        // Update show count - hanya untuk member yang benar-benar dihapus dari show
        if (!group.is_non_show) {
            var membersToDecrement = [];
            if (val === 'entire') {
                // Semua member di show ini dikurang 1 masing-masing
                membersToDecrement = group.members;
            } else {
                // Hanya 1 member yang dipilih
                var targetRowId = parseInt(val);
                var singleMember = group.members.find(function(x){ return x.rowId === targetRowId || String(x.rowId) === String(targetRowId); });
                if (singleMember) membersToDecrement = [singleMember];
            }

            for (var j = 0; j < membersToDecrement.length; j++) {
                var m = membersToDecrement[j];
                var memberObj = members.find(function(x){ return String(x.id) === String(m.id); });
                if (memberObj) {
                    await db.from('members')
                        .update({ show: Math.max((memberObj.show || 0) - 1, 0) })
                        .eq('id', memberObj.id);
                }
            }
        }

        var successMsg = val === 'entire'
            ? 'Show berhasil dihapus (' + group.members.length + ' member)'
            : '1 member berhasil dihapus dari show';
        showNotification('success', 'Dihapus', successMsg);
        await loadData();
        await openDeleteShowModal();

    } catch(err) {
        showNotification('error', 'Error', 'Gagal hapus: ' + err.message);
    }
}

// =================== END DELETE SHOW FUNCTIONS ===================

// =================== EDIT SHOW FUNCTIONS ===================

async function openEditShowListModal() {
    document.getElementById('eslList').innerHTML = '<div class="msl-loading"><div class="spinner" style="width:18px;height:18px;border-width:2px;border-top-color:#3b82f6;"></div> Memuat show...</div>';
    document.getElementById('editShowListModal').style.display = 'flex';

    try {
        var now = new Date();
        var todayStr = now.toISOString().split('T')[0];

        var result = await db.from('setlist_performance')
            .select('id, setlist_name, show_date, show_time, is_non_show, is_birthday_show, birthday_member, is_graduation_show, graduation_member, member_id, members(name)')
            .gte('show_date', todayStr)
            .order('show_date', { ascending: true })
            .order('show_time', { ascending: true });

        if (result.error) throw result.error;

        var SHOW_DURATION_MINUTES = 150; // sama dengan liveshow.html
        var shows = (result.data || []).filter(function(s) {
            if (!s.show_time) return false;
            var showStart = new Date(s.show_date + 'T' + s.show_time);
            var showEnd = new Date(showStart.getTime() + SHOW_DURATION_MINUTES * 60000);
            return showEnd > now;
        });

        if (shows.length === 0) {
            document.getElementById('eslList').innerHTML = '<div class="msl-empty">Tidak ada show mendatang.</div>';
            return;
        }

        // Group by setlist + date + time
        var groupMap = {};
        shows.forEach(function(s) {
            var key = (s.setlist_name || '') + '|' + s.show_date + '|' + (s.show_time || '');
            if (!groupMap[key]) {
                groupMap[key] = { setlist_name: s.setlist_name, show_date: s.show_date, show_time: s.show_time, is_non_show: s.is_non_show, is_birthday_show: s.is_birthday_show, birthday_member: s.birthday_member, is_graduation_show: s.is_graduation_show, graduation_member: s.graduation_member, members: [], ids: [] };
            }
            // Hanya push member jika member_id tidak null
            if (s.member_id) {
                groupMap[key].members.push({ id: s.member_id, name: s.members ? s.members.name : '?', rowId: s.id });
            }
            groupMap[key].ids.push(s.id);
        });

        var listEl = document.getElementById('eslList');
        listEl.innerHTML = '';

        Object.values(groupMap).forEach(function(g) {
            var dateStr = formatDate(g.show_date);
            var timeStr = g.show_time ? formatTime(g.show_time) : '';
            var meta = dateStr + (timeStr ? ' · ' + timeStr : '');
            var nonShowLabel = g.is_non_show ? '<span style="font-size:10px;background:#6b7280;color:#fff;border-radius:4px;padding:2px 7px;white-space:nowrap;">Non-Show</span>' : '';
            var isKosong = g.members.length === 0;
            var emptyLabel = isKosong ? '<span style="font-size:10px;background:#8b5cf6;color:#fff;border-radius:4px;padding:2px 7px;white-space:nowrap;">Belum Ada Member</span>' : '';
            var memberNames = isKosong
                ? '<span style="color:#8b5cf6;font-style:italic;">Belum ada member — tambah lewat Edit</span>'
                : g.members.map(function(m){ return escapeHtml(m.name); }).join(', ');

            var item = document.createElement('div');
            item.className = 'msl-item';
            item.style.cursor = 'default';
            if (isKosong) item.style.borderLeft = '3px solid #8b5cf6';
            item.innerHTML =
                '<div style="flex:1;min-width:0;">' +
                  '<div class="msl-setlist" style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">' + escapeHtml(g.setlist_name || '—') + ' ' + nonShowLabel + emptyLabel + '</div>' +
                  '<div class="msl-date">' + meta + '</div>' +
                  '<div style="font-size:11px;color:#9ca3af;margin-top:2px;">' + memberNames + '</div>' +
                '</div>' +
                '<div class="msl-actions">' +
                  '<button class="msl-btn-edit">✎ Edit</button>' +
                '</div>';

            item.querySelector('button').addEventListener('click', function() {
                confirmEslEdit(g);
            });

            listEl.appendChild(item);

        });
    } catch(err) {
        document.getElementById('eslList').innerHTML = '<div class="msl-empty" style="color:#ef4444;">Gagal memuat: ' + escapeHtml(err.message) + '</div>';
    }
}

function closeEditShowListModal() {
    document.getElementById('editShowListModal').style.display = 'none';
}

function eslToggleBirthday() {
    var cb = document.getElementById('eslIsBirthdayShow');
    var gradCb = document.getElementById('eslIsGraduationShow');
    var field = document.getElementById('eslBirthdayMemberField');
    if (cb.checked) {
        if (gradCb && gradCb.checked) {
            showNotification('warning', 'Konflik', 'Birthday & Graduation tidak bisa bersamaan');
            cb.checked = false; return;
        }
        field.style.display = 'block';
        eslPopulateMemberDropdown('eslBirthdayMember');
    } else {
        field.style.display = 'none';
        document.getElementById('eslBirthdayMember').value = '';
    }
}

function eslToggleGraduation() {
    var cb = document.getElementById('eslIsGraduationShow');
    var birthdayCb = document.getElementById('eslIsBirthdayShow');
    var field = document.getElementById('eslGraduationMemberField');
    if (cb.checked) {
        if (birthdayCb && birthdayCb.checked) {
            showNotification('warning', 'Konflik', 'Birthday & Graduation tidak bisa bersamaan');
            cb.checked = false; return;
        }
        field.style.display = 'block';
        eslPopulateMemberDropdown('eslGraduationMember');
    } else {
        field.style.display = 'none';
        document.getElementById('eslGraduationMember').value = '';
    }
}

function eslPopulateMemberDropdown(dropdownId) {
    var sel = document.getElementById(dropdownId);
    if (!sel) return;
    var prev = sel.value;
    sel.innerHTML = '<option value="">-- Pilih Member --</option>';
    members.slice().sort(function(a,b){ return a.name.localeCompare(b.name); }).forEach(function(m) {
        if (isMemberInactive(m)) return;
        var opt = document.createElement('option');
        opt.value = m.name; opt.textContent = m.name;
        if (m.name === prev) opt.selected = true;
        sel.appendChild(opt);
    });
}

function toggleEditBirthdayField() {
    var cb = document.getElementById('editIsBirthdayShow');
    var gradCb = document.getElementById('editIsGraduationShow');
    var field = document.getElementById('editBirthdayMemberField');
    if (cb.checked) {
        if (gradCb && gradCb.checked) {
            showNotification('warning', 'Konflik', 'Birthday & Graduation tidak bisa bersamaan');
            cb.checked = false; return;
        }
        field.style.display = 'block';
        editPopulateMemberDropdown('editBirthdayMember');
    } else {
        field.style.display = 'none';
        document.getElementById('editBirthdayMember').value = '';
    }
}

function toggleEditGraduationField() {
    var cb = document.getElementById('editIsGraduationShow');
    var birthdayCb = document.getElementById('editIsBirthdayShow');
    var field = document.getElementById('editGraduationMemberField');
    if (cb.checked) {
        if (birthdayCb && birthdayCb.checked) {
            showNotification('warning', 'Konflik', 'Birthday & Graduation tidak bisa bersamaan');
            cb.checked = false; return;
        }
        field.style.display = 'block';
        editPopulateMemberDropdown('editGraduationMember');
    } else {
        field.style.display = 'none';
        document.getElementById('editGraduationMember').value = '';
    }
}

function editPopulateMemberDropdown(dropdownId) {
    var sel = document.getElementById(dropdownId);
    if (!sel) return;
    var prev = sel.value;
    sel.innerHTML = '<option value="">-- Pilih Member --</option>';
    members.slice().sort(function(a,b){ return a.name.localeCompare(b.name); }).forEach(function(m) {
        if (isMemberInactive(m)) return;
        var opt = document.createElement('option');
        opt.value = m.name; opt.textContent = m.name;
        if (m.name === prev) opt.selected = true;
        sel.appendChild(opt);
    });
}

function eslPopulateSetlistSelect(currentValue) {
    var sel = document.getElementById('eslSetlistSelect');
    if (!sel) return;
    sel.innerHTML = '<option value="">Pilih Setlist...</option><option value="__custom__">Kustom Setlist (Ketik Manual)</option>';
    var grpI = document.createElement('optgroup');
    grpI.label = 'INTI';
    for (var k in SETLIST_INTI) {
        var o = document.createElement('option');
        o.value = k; o.textContent = k;
        if (currentValue === k) o.selected = true;
        grpI.appendChild(o);
    }
    sel.appendChild(grpI);
    var grpT = document.createElement('optgroup');
    grpT.label = 'TRAINEE';
    for (var k in SETLIST_TRAINEE) {
        var o = document.createElement('option');
        o.value = k; o.textContent = k;
        if (currentValue === k) o.selected = true;
        grpT.appendChild(o);
    }
    sel.appendChild(grpT);
    if (currentValue === '__custom__') sel.value = '__custom__';
    else if (!currentValue) sel.value = '';
}

function eslToggleCustomSetlist() {
    var value = document.getElementById('eslSetlistSelect').value;
    var customField = document.getElementById('eslCustomSetlistField');
    if (value === '__custom__') {
        customField.classList.add('show');
        document.getElementById('eslSetlistName').focus();
    } else {
        customField.classList.remove('show');
        document.getElementById('eslSetlistName').value = '';
    }
}

function confirmEslEdit(group) {
    var dateStr = formatDate(group.show_date);
    var timeStr = group.show_time ? formatTime(group.show_time) : '';
    document.getElementById('confirmEslDesc').textContent = (group.setlist_name || '—') + ' · ' + dateStr + (timeStr ? ' · ' + timeStr : '');

    // Pre-fill form dengan data saat ini
    var allSetlists = Object.assign({}, SETLIST_INTI, SETLIST_TRAINEE);
    var isCustomSetlist = group.setlist_name && !allSetlists[group.setlist_name];
    eslPopulateSetlistSelect(isCustomSetlist ? '__custom__' : (group.setlist_name || ''));
    document.getElementById('eslCustomSetlistField').classList.toggle('show', isCustomSetlist);
    document.getElementById('eslSetlistName').value = isCustomSetlist ? (group.setlist_name || '') : '';
    document.getElementById('eslShowDate').value = group.show_date || '';
    document.getElementById('eslShowTime').value = group.show_time ? group.show_time.substring(0,5) : '';

    // Clone members agar bisa diedit tanpa mutate group asli
    window._eslCurrentGroup = group;
    window._eslOrigMemberCount = group.members ? group.members.length : 0;
    window._eslEditMembers = group.members.map(function(m){ return { rowId: m.rowId, name: m.name, member_id: m.id }; });

    eslRenderMemberChips();

    document.getElementById('eslMemberError').style.display = 'none';
    document.getElementById('eslAddMemberTextarea').value = '';

    // Reset & pre-fill birthday/graduation
    document.getElementById('eslIsBirthdayShow').checked = !!group.is_birthday_show;
    document.getElementById('eslIsGraduationShow').checked = !!group.is_graduation_show;
    eslPopulateMemberDropdown('eslBirthdayMember');
    eslPopulateMemberDropdown('eslGraduationMember');
    document.getElementById('eslBirthdayMemberField').style.display = group.is_birthday_show ? 'block' : 'none';
    document.getElementById('eslGraduationMemberField').style.display = group.is_graduation_show ? 'block' : 'none';
    if (group.is_birthday_show && group.birthday_member) document.getElementById('eslBirthdayMember').value = group.birthday_member;
    if (group.is_graduation_show && group.graduation_member) document.getElementById('eslGraduationMember').value = group.graduation_member;

    document.getElementById('confirmEslModal').style.display = 'flex';
}

function eslRenderMemberChips() {
    var mems = window._eslEditMembers || [];
    var html = mems.map(function(m, idx) {
        return '<div class="dsl-member-chip" style="display:flex;align-items:center;gap:4px;padding:4px 10px 4px 10px;">' +
            m.name +
            '<span onclick="eslRemoveMember(' + idx + ')" style="cursor:pointer;font-size:14px;font-weight:900;color:#ef4444;margin-left:4px;line-height:1;" title="Hapus">×</span>' +
            '</div>';
    }).join('');
    document.getElementById('confirmEslMembers').innerHTML = html || '<span style="font-size:12px;color:#8b5cf6;font-style:italic;">Belum ada member — tambah di bawah</span>';
}

function eslAddMembersFromTextarea() {
    var ta = document.getElementById('eslAddMemberTextarea');
    var raw = ta.value.trim();
    if (!raw) return;

    var names = raw.split(',').map(function(n){ return n.trim(); }).filter(function(n){ return n.length > 0; });
    var currentIds = (window._eslEditMembers || []).map(function(m){ return m.member_id; });
    var added = [], notFound = [], alreadyIn = [];

    names.forEach(function(name) {
        var found = (members || []).find(function(m){ return m.name.toLowerCase() === name.toLowerCase(); });
        if (!found) {
            notFound.push(name);
        } else if (currentIds.indexOf(found.id) !== -1) {
            alreadyIn.push(found.name);
        } else {
            window._eslEditMembers.push({ rowId: null, name: found.name, member_id: found.id });
            currentIds.push(found.id);
            added.push(found.name);
        }
    });

    eslRenderMemberChips();
    ta.value = '';

    var errEl = document.getElementById('eslMemberError');
    var msgs = [];
    if (notFound.length) msgs.push('Tidak ditemukan: ' + notFound.join(', '));
    if (alreadyIn.length) msgs.push('Sudah ada: ' + alreadyIn.join(', '));
    if (msgs.length) {
        errEl.textContent = msgs.join(' | ');
        errEl.style.display = 'block';
    } else {
        errEl.style.display = 'none';
    }
}

function eslRemoveMember(idx) {
    document.getElementById('eslMemberError').style.display = 'none';
    window._eslEditMembers.splice(idx, 1);
    eslRenderMemberChips();
}

function eslPopulateMemberDropdown(id) {
    var sel = document.getElementById(id);
    if (!sel) return;
    var prev = sel.value;
    sel.innerHTML = '<option value="">-- Pilih Member --</option>';
    (members || []).filter(function(m){ return !isMemberInactive(m); }).forEach(function(m){
        sel.innerHTML += '<option value="' + escapeHtml(m.name) + '">' + escapeHtml(m.name) + '</option>';
    });
    sel.value = prev;
}

async function doEditEslShow() {
    var group = window._eslCurrentGroup;
    if (!group) return;

    var eslSelVal = document.getElementById('eslSetlistSelect').value;
    var newSetlist = (eslSelVal === '__custom__' || eslSelVal === '')
        ? document.getElementById('eslSetlistName').value.trim()
        : eslSelVal;
    var newDate = document.getElementById('eslShowDate').value;
    var newTime = document.getElementById('eslShowTime').value;
    var editMembers = window._eslEditMembers || [];
    var eslIsBirthday = document.getElementById('eslIsBirthdayShow').checked;
    var eslBirthdayMember = eslIsBirthday ? document.getElementById('eslBirthdayMember').value : null;
    var eslIsGraduation = document.getElementById('eslIsGraduationShow').checked;
    var eslGraduationMember = eslIsGraduation ? document.getElementById('eslGraduationMember').value : null;

    if (!newSetlist) { showNotification('warning', 'Validasi', 'Nama setlist tidak boleh kosong'); return; }
    if (!newDate) { showNotification('warning', 'Validasi', 'Tanggal tidak boleh kosong'); return; }
    if (eslIsBirthday && !eslBirthdayMember) { showNotification('warning', 'Validasi', 'Pilih member birthday'); return; }
    if (eslIsGraduation && !eslGraduationMember) { showNotification('warning', 'Validasi', 'Pilih member graduation'); return; }

    document.getElementById('confirmEslModal').style.display = 'none';

    try {
        var updateData = {
            setlist_name: newSetlist,
            show_date: newDate,
            show_time: newTime ? newTime + ':00' : null,
            is_non_show: false,
            is_birthday_show: eslIsBirthday,
            birthday_member: eslBirthdayMember || null,
            is_graduation_show: eslIsGraduation,
            graduation_member: eslGraduationMember || null
        };

        var origRowIds = group.ids;
        var origMemberIds = group.members.map(function(m){ return m.id; });
        var newMemberIds = editMembers.map(function(m){ return m.member_id; });

        // Cek apakah ada row placeholder kosong (member_id null) di group
        var hasNullRow = origMemberIds.length < origRowIds.length || (group.members.length === 0 && origRowIds.length > 0);
        var nullRowId = null;
        if (hasNullRow) {
            // row dengan member_id null: id-nya ada di origRowIds tapi tidak ter-cover oleh group.members
            var coveredRowIds = group.members.map(function(m){ return m.rowId; });
            nullRowId = origRowIds.find(function(rid){ return coveredRowIds.indexOf(rid) === -1; });
        }

        // Jika ada member baru ditambah dan masih ada null row — gunakan null row untuk member pertama
        var addedMemberIds = newMemberIds.filter(function(mid){ return origMemberIds.indexOf(mid) === -1; });
        var removedMemberIds = origMemberIds.filter(function(mid){ return newMemberIds.indexOf(mid) === -1; });

        // 1. Update semua row lama dengan data show terbaru
        for (var i = 0; i < origRowIds.length; i++) {
            var res = await db.from('setlist_performance').update(updateData).eq('id', origRowIds[i]);
            if (res.error) throw res.error;
        }

        // 2. Hapus row member yang dihapus
        for (var j = 0; j < removedMemberIds.length; j++) {
            var rMid = removedMemberIds[j];
            var memberObj = group.members.find(function(m){ return m.id === rMid; });
            if (memberObj && memberObj.rowId) {
                var delRes = await db.from('setlist_performance').delete().eq('id', memberObj.rowId);
                if (delRes.error) throw delRes.error;
            }
        }

        // 3. Tambah row untuk member baru
        // Ambil sample sekali saja
        var sample = {};
        if (origRowIds.length > 0) {
            var sampleRow = await db.from('setlist_performance').select('*').eq('id', origRowIds[0]).single();
            sample = sampleRow.data || {};
        }
        var skipCols = ['id', 'member_id', 'setlist_name', 'show_date', 'show_time', 'members'];

        var firstAdded = true;
        for (var k = 0; k < addedMemberIds.length; k++) {
            var aMid = addedMemberIds[k];

            // Gunakan null row untuk member pertama (update saja, tidak insert baru)
            if (firstAdded && nullRowId) {
                var upRes = await db.from('setlist_performance').update({ member_id: aMid }).eq('id', nullRowId);
                if (upRes.error) throw upRes.error;
                nullRowId = null; // sudah dipakai
                firstAdded = false;
                continue;
            }
            firstAdded = false;

            var insertData = { member_id: aMid, setlist_name: newSetlist, show_date: newDate, show_time: newTime ? newTime + ':00' : null };
            Object.keys(sample).forEach(function(col) {
                if (skipCols.indexOf(col) === -1) insertData[col] = sample[col];
            });
            var insRes = await db.from('setlist_performance').insert(insertData);
            if (insRes.error) throw insRes.error;
        }

        showNotification('success', 'Berhasil', 'Show berhasil diperbarui');
        await loadData();
        await openEditShowListModal();

    } catch(err) {
        showNotification('error', 'Error', 'Gagal edit: ' + err.message);
    }
}

// Toggle password visibility
function togglePasswordVisibility() {
    var input = document.getElementById('password');
    var icon = document.getElementById('eyeIcon');
    var btn = document.getElementById('eyeBtn');
    var isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    btn.style.color = isHidden ? '#e60012' : '#9ca3af';
    // Ganti icon: eye-off saat visible, eye saat hidden
    icon.innerHTML = isHidden
        ? '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>'
        : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
}

// Auto lock scroll saat modal terbuka
(function() {
    function checkModals() {
        var modals = document.querySelectorAll('.modal');
        var anyOpen = false;
        for (var i = 0; i < modals.length; i++) {
            if (modals[i].style.display === 'flex') { anyOpen = true; break; }
        }
        if (anyOpen) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }
    }
    document.addEventListener('DOMContentLoaded', function() {
        var observer = new MutationObserver(checkModals);
        var modals = document.querySelectorAll('.modal');
        modals.forEach(function(m) {
            observer.observe(m, { attributes: true, attributeFilter: ['style'] });
        });
    });
})();

// Initialize
document.addEventListener('DOMContentLoaded', async function() {
    document.body.classList.add('dark');

    if (!db) {
        // db gagal terbentuk (library gagal load) - jangan lanjut, biarkan showInitError menangani
        return;
    }

    var splash = document.getElementById('loginSplash');
    var loginModal = document.getElementById('loginModal');
    splash.style.display = 'none';

    // Enter-key pada field password memicu login (menggantikan inline onkeypress)
    var passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') login();
        });
    }

    // SECURITY: session state now comes from Supabase Auth's server-verified session
    // (db.auth.getSession()) instead of a locally-set localStorage flag anyone could fake.
    var _sessionResult = await db.auth.getSession();
    var _needLogin = !(_sessionResult && _sessionResult.data && _sessionResult.data.session);

    if (!_needLogin) {
        loginModal.style.display = 'none';
        loadData();
        loadActivityLog();
    }

    if (_needLogin) {
        db.from('members').select('status,gen').then(function(result){
            if (!result.error && result.data) {
                var active = result.data.filter(function(m){ return !isMemberInactive(m); }).length;
                var elM = document.getElementById('loginStatMembers');
                var elG = document.getElementById('loginStatGen');
                if (elM) elM.textContent = active;
                if (elG) elG.textContent = '14';
            }
        });
        loginModal.style.display = 'flex';
        loginModal.classList.add('animate-in');
    }
});
