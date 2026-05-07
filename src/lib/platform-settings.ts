export interface PlatformSettings {
  hotlinePhone: string;
  hotlineLabel: string;
  zaloPhone: string;
  zaloUrl: string;
  supportHours: string;
}

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  hotlinePhone: "1900 123 456",
  hotlineLabel: "Hotline kỹ thuật",
  zaloPhone: "0901 234 567",
  zaloUrl: "https://zalo.me/0901234567",
  supportHours: "Thứ 2 - Chủ nhật, 8:00 - 22:00",
};

const KEY = "platform_settings_v1";

export function getPlatformSettings(): PlatformSettings {
  if (typeof window === "undefined") return DEFAULT_PLATFORM_SETTINGS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_PLATFORM_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PLATFORM_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_PLATFORM_SETTINGS;
  }
}

export function savePlatformSettings(settings: PlatformSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {}
}