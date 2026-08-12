const rawUrl = import.meta.env.VITE_API_URL;
export const API_BASE_URL = rawUrl
  ? (rawUrl.startsWith('http://') || rawUrl.startsWith('https://') ? rawUrl : `https://${rawUrl}`)
  : 'http://localhost:8000';
