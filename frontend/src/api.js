let rawUrl = import.meta.env.VITE_API_URL;

if (rawUrl) {
  // Render's Blueprint 'host' property provides the internal hostname (e.g. skillgraph-backend-xxxx)
  // For the browser to access it, we must append the public Render domain if it's missing.
  if (!rawUrl.includes('.') && !rawUrl.includes('localhost')) {
    rawUrl = `${rawUrl}.onrender.com`;
  }
  
  if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
    rawUrl = `https://${rawUrl}`;
  }
}

export const API_BASE_URL = rawUrl || 'http://localhost:8000';
