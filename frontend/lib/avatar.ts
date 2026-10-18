// Curated flat solid colors for user avatars (no gradients)
const SPECIFIC_COLORS: Record<string, string> = {
  'alex': 'bg-rose-600',
  'user-1945': 'bg-purple-600',
  'user-6431': 'bg-blue-600',
  'oliver': 'bg-emerald-600',
};

const SOLID_AVATAR_COLORS = [
  'bg-rose-600',
  'bg-purple-600',
  'bg-blue-600',
  'bg-emerald-600',
  'bg-amber-600',
  'bg-cyan-600',
  'bg-indigo-600',
  'bg-teal-600',
];

export function getAvatarColor(name: string): string {
  if (!name) return SOLID_AVATAR_COLORS[0];
  const lower = name.toLowerCase().trim();
  if (SPECIFIC_COLORS[lower]) {
    return SPECIFIC_COLORS[lower];
  }
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % SOLID_AVATAR_COLORS.length;
  return SOLID_AVATAR_COLORS[index];
}

export const getAvatarGradient = getAvatarColor;

export function getInitials(name: string): string {
  if (!name) return '??';
  const clean = name.trim();
  if (clean.toLowerCase() === 'alex') return 'AL';
  if (clean.toLowerCase() === 'user-1945') return 'US';
  if (clean.toLowerCase() === 'user-6431') return 'U6';
  if (clean.toLowerCase() === 'oliver') return 'OL';

  const parts = clean.split(/[\s-_]+/);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}
