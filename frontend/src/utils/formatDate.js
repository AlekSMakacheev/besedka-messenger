export const formatLastSeen = (lastSeenAt) => {
  if (!lastSeenAt) return "never";
  const now = new Date();
  const then = new Date(lastSeenAt);
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHours < 24) {
    if (diffHours === 1) return "1 hour ago";
    return `${diffHours} hours ago`;
  }
  if (diffDays === 1) return "yesterday";
  if (diffDays > 7) return `${diffDays} days ago`;
  return `on ${then.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}`;
};