const GRADIENTS = [
  'from-blue-500 to-indigo-600',
  'from-emerald-400 to-teal-600',
  'from-violet-500 to-purple-700',
  'from-pink-500 to-rose-600',
  'from-amber-400 to-orange-600',
  'from-cyan-400 to-blue-600',
  'from-fuchsia-500 to-pink-600'
];

export function getAvatarGradient(name: string): string {
  if (!name) return GRADIENTS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADIENTS.length;
  return GRADIENTS[index];
}

export function getInitials(name: string): string {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}
