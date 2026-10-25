const AVATAR_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", 
  "#14b8a6", "#3b82f6", "#8b5cf6", "#ec4899",
];

export function getUserColor(username) {
  if (!username) return "#9ca3af";
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}