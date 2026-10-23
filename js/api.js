// 공통: Supabase RPC 호출 (supabase-js 없이 fetch만 사용 → 로딩 가벼움)
window.uzRpc = async function (fn, args) {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.UZ_CONFIG;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify(args || {})
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = (data && (data.message || data.hint)) || res.statusText;
    throw new Error(msg);
  }
  return data;
};

// 기기 토큰: 한 폰당 한 번 (localStorage)
window.uzToken = function () {
  let t = null;
  try { t = localStorage.getItem("uz_token"); } catch (e) {}
  if (!t) {
    const a = new Uint8Array(16);
    crypto.getRandomValues(a);
    t = Array.from(a, b => b.toString(16).padStart(2, "0")).join("");
    try { localStorage.setItem("uz_token", t); } catch (e) {}
  }
  return t;
};
