/**
 * Text and input sanitization utilities to protect against XSS,
 * control character injection, and formatting manipulation.
 */

// Strip non-printable ASCII control characters except standard whitespace (space, tab, newline)
const CONTROL_CHARS_REGEX = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g;

// Strip unicode directional override characters (used in spoofing / visual trickery)
const BIDI_CHARS_REGEX = /[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g;

/**
 * Sanitizes in-game chat messages.
 * Strips dangerous controls, normalizes unicode, escapes HTML tags, and truncates length.
 */
export function sanitizeChatMessage(raw: unknown, maxLength: number = 300): string {
  if (typeof raw !== 'string') return '';

  return raw
    .normalize('NFKC')
    .replace(CONTROL_CHARS_REGEX, '')
    .replace(BIDI_CHARS_REGEX, '')
    .trim()
    .slice(0, maxLength)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Validates and normalizes room codes (alphanumeric, uppercase, 4-8 chars).
 */
export function sanitizeRoomCode(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  return raw
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 8);
}

/**
 * Sanitizes player display names.
 */
export function sanitizeDisplayName(raw: unknown, maxLength: number = 24): string {
  if (typeof raw !== 'string') return 'Player';

  const cleaned = raw
    .normalize('NFKC')
    .replace(CONTROL_CHARS_REGEX, '')
    .replace(BIDI_CHARS_REGEX, '')
    .trim()
    .slice(0, maxLength)
    .replace(/[<>&"']/g, '');

  return cleaned.length > 0 ? cleaned : 'Player';
}
