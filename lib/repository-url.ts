export function normalizeRepositoryUrl(value: string): string | null {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== 'https:' || url.hostname !== 'github.com' || url.username || url.password || url.port) return null;
    const parts = url.pathname.replace(/\/+$/, '').split('/').filter(Boolean);
    if (parts.length !== 2 || !parts.every(part => /^[\w.-]+$/.test(part))) return null;
    return `https://github.com/${parts[0]}/${parts[1].replace(/\.git$/, '')}`.toLowerCase();
  } catch { return null; }
}
