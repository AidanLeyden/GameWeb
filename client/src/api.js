const API_BASE =
  import.meta.env.VITE_API_BASE ||
  (location.hostname === 'localhost' ? '' : 'https://your-server-project.vercel.app');

export async function fetchRecommendations(params) {
  const searchParams = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0)) return;
    if (Array.isArray(v)) searchParams.set(k, v.join(','));
    else searchParams.set(k, String(v));
  });
  const res = await fetch(`${API_BASE}/api/recommendations?${searchParams.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch recommendations');
  return (await res.json()).items || [];
}



