import { vi } from 'vitest';

export const withFakeTimers = (
  fn: (args: { setTime: (time: string | Date) => void }) => void,
) => {
  vi.useFakeTimers();
  fn({ setTime: vi.setSystemTime });
  vi.useRealTimers();
};
