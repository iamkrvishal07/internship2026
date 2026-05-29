const DEFAULT_AVATAR_BASE = "https://api.dicebear.com/7.x";

export const getDefaultAvatar = (seed: string | number) =>
  `${DEFAULT_AVATAR_BASE}/avataaars/svg?seed=${seed}`;

export const getDefaultGroupAvatar = (name: string) =>
  `${DEFAULT_AVATAR_BASE}/initials/svg?seed=${encodeURIComponent(name)}`;

export const PLACEHOLDER_AVATAR_URL = "https://placehold.co/120x120";

export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_MESSAGES_PAGE_SIZE = 50;
export const DEFAULT_PAGE_NUMBER = 1;

export const DEFAULT_DEBOUNCE_DELAY = 550;
export const SEARCH_DEBOUNCE_DELAY = 400;
export const TYPING_STOP_DELAY = 2000;

export const PENDING_RETRY_INTERVAL = 3000;

export const STALE_TIME_5_MIN = 1000 * 60 * 5;
export const STALE_TIME_1_MIN = 1000 * 60;
export const STALE_TIME_30_SEC = 1000 * 30;
export const STALE_TIME_1_HOUR = 1000 * 60 * 60;
export const STALE_TIME_1_DAY = 1000 * 60 * 60 * 24;

export const STREAMING_SHORT_THRESHOLD = 20;
export const STREAMING_CHAR_DELAY = 35;
export const STREAMING_WORD_DELAY = 80;

export const SIGNALR_SHORT_RETRY_MS = 2000;
export const SIGNALR_LONG_RETRY_MS = 10000;
export const SIGNALR_RETRY_THRESHOLD_MS = 60000;
