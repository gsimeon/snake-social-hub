import '@testing-library/jest-dom';
import { vi, beforeEach } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock global fetch
// We use a simple vi.fn() that returns a successful empty json response by default
// Tests will override this implementation when needed
global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ success: true, data: [] }),
    ok: true,
  } as Response)
);

// Reset mocks before each test
beforeEach(() => {
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
  // Don't clear the store here automatically if we want persistence across some calls within a test, 
  // but usually for unit tests we want a clean slate. 
  // However, the api.ts uses a global variable `currentUser` which might be out of sync if we only clear LS.
  // The tests verify behaviour that depends on LS being consistent with correct logic.
  // Let's clear the store for isolation.
  localStorageMock.clear();

  (global.fetch as any).mockClear();
});
