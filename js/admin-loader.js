// Fallback: kalau CDN utama gagal, coba CDN cadangan (unpkg)
window.addEventListener('DOMContentLoaded', function() {
    if (window.__supabaseLoadFailed && typeof supabase === 'undefined') {
        var fallback = document.createElement('script');
        fallback.src = 'https://unpkg.com/@supabase/supabase-js@2.107.0';
        fallback.onerror = function() { window.__supabaseTotallyFailed = true; showInitError(); };
        fallback.onload = function() { window.location.reload(); };
        document.head.appendChild(fallback);
    }
}, { once: true });
function showInitError() {
    var splash = document.getElementById('loginSplash');
    if (splash) {
        splash.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:24px;text-align:center;color:#fff">' +
            '<div style="font-size:40px;margin-bottom:12px">⚠️</div>' +
            '<div style="font-size:18px;font-weight:bold;margin-bottom:8px">Gagal Memuat Aplikasi</div>' +
            '<div style="font-size:13px;opacity:0.85;max-width:320px">Koneksi internet ke server library (Supabase) gagal. Periksa koneksi internet kamu lalu refresh halaman.</div>' +
            '<button onclick="window.location.reload()" style="margin-top:16px;padding:10px 24px;border-radius:20px;border:none;background:#fff;color:#e60012;font-weight:bold;cursor:pointer">Coba Lagi</button>' +
            '</div>';
        splash.style.display = 'flex';
    }
}
