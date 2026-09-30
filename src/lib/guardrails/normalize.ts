const LEET_MAP: Record<string, string> = {
  '@': 'a',
  '4': 'a',
  '8': 'b',
  '(': 'c',
  '<': 'c',
  '3': 'e',
  '6': 'g',
  '#': 'h',
  '1': 'i',
  '!': 'i',
  '|': 'i',
  '0': 'o',
  '5': 's',
  '$': 's',
  '7': 't',
  '+': 't',
};

export function normalizeForModeration(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\s\-_.*]+/g, '')
    .split('')
    .map((char) => LEET_MAP[char] ?? char)
    .join('');
}

export function tokenizeForModeration(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}
