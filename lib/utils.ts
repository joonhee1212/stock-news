export function timeAgo(unixTimestamp: number): string {
  const seconds = Math.floor(Date.now() / 1000) - unixTimestamp;
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 86400 * 2) return "yesterday";
  return `${Math.floor(seconds / 86400)}d ago`;
}
