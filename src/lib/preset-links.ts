import { navigationHref } from './navigation';

export const MAX_SHARE_LENGTH = 20000;

// Presets describe client-side state on an existing tool, not another document.
// Keep the versioned fragment compatible with previously shared result links.
export function calculatorPresetHref(path: string, mode: string, values: Record<string, string | number | undefined> = {}) {
  const params = new URLSearchParams({ share_version: '1', mode });
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && !['share_version', 'mode', 'verified_rate'].includes(key)) params.set(key, String(value));
  }
  const href = navigationHref(path).split(/[?#]/)[0] + '#calc=' + params.toString();
  if (href.length > MAX_SHARE_LENGTH) throw new Error('These inputs are too long for a reliable calculation link. Open the tool and enter them directly.');
  return href;
}
