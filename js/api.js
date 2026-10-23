// 공통: Supabase RPC 호출 (supabase-js 없이 fetch만 사용 → 로딩 가벼움)
window.uzRpc = async function (fn, args) {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.UZ_CONFIG;
  const ctrl = new AbortController(); const timer = setTimeout(() => ctrl.abort(), 15000);
  let res, data;
  try {
    res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
      method: "POST", signal: ctrl.signal,
      headers: { "Content-Type": "application/json", "apikey": SUPABASE_ANON_KEY, "Authorization": `Bearer ${SUPABASE_ANON_KEY}` },
      body: JSON.stringify(args || {})
    });
    data = await res.json().catch(() => null);
  } catch (e) { throw new Error(e.name === 'AbortError' ? 'TIMEOUT' : 'NETWORK'); }
  finally { clearTimeout(timer); }
  if (!res.ok) throw new Error((data && (data.message || data.hint)) || res.statusText);
  if (data && typeof data === 'object' && !Array.isArray(data) && data.error) throw new Error(data.error);
  return data;
};

// 기기 토큰: 한 폰당 한 번. localStorage → 쿠키 → 메모리 순으로 저장(사파리 개인정보 모드 등 대비)
window.uzToken = function () {
  const KEY = 'uz_token';
  const readCookie = () => (document.cookie.match(new RegExp('(?:^|; )' + KEY + '=([0-9a-f]{32})')) || [])[1];
  let t = null;
  try { t = localStorage.getItem(KEY); } catch (e) {}
  if (!t) t = readCookie();
  if (!t) {
    const a = new Uint8Array(16);
    if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(a); else for (let i = 0; i < 16; i++) a[i] = Math.floor(Math.random() * 256);
    t = Array.from(a, b => b.toString(16).padStart(2, "0")).join("");
  }
  try { localStorage.setItem(KEY, t); } catch (e) {}
  try { document.cookie = KEY + '=' + t + '; max-age=31536000; path=/; SameSite=Lax'; } catch (e) {}
  window._uzToken = t;
  return t;
};
