const ADJECTIVES = ['swift', 'bright', 'brave', 'calm', 'dark', 'fast', 'free', 'glad', 'keen', 'bold'];
const NOUNS = ['fox', 'owl', 'elk', 'bee', 'bat', 'cod', 'emu', 'hen', 'jay', 'koi'];

export function randomSubdomain(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `${adj}-${noun}-${num}`;
}

export function extractSubdomain(host: string, domain: string): string | null {
  const baseDomain = domain.split(':')[0];
  const hostName = host.split(':')[0];
  if (hostName.endsWith(`.${baseDomain}`)) {
    return hostName.slice(0, hostName.length - baseDomain.length - 1) || null;
  }
  return null;
}

const SUBDOMAIN_RE = /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/;
const RESERVED = new Set(['www', 'api', 'mail', 'ftp', 'admin', 'app', 'blog', 'dev', 'cdn', 'status']);

export function validateSubdomain(sub: string): string | null {
  if (!SUBDOMAIN_RE.test(sub)) return 'Subdomain must be 3–63 characters: lowercase letters, numbers, hyphens (no leading/trailing hyphens)';
  if (RESERVED.has(sub)) return `"${sub}" is a reserved name`;
  return null;
}
