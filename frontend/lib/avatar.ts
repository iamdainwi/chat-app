// Curated flat solid colors for user avatars (no gradients)
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
  const parts = clean.split(/[\s-_]+/);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

