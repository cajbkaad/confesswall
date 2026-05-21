export function normalizeXHandle(input: string) {
  return input
    .trim()
    .replace(/^https?:\/\/(www\.)?(x|twitter)\.com\//i, "")
    .replace(/^@/, "")
    .split(/[/?#]/)[0]
    .toLowerCase();
}

export function displayXHandle(normalized: string) {
  return `@${normalized}`;
}

export function xProfileUrl(normalized: string) {
  return `https://x.com/${normalized}`;
}

export function normalizeTokenSymbol(input: string) {
  const trimmed = input.trim();
  return trimmed.startsWith("$") ? trimmed.toUpperCase() : `$${trimmed.toUpperCase()}`;
}
