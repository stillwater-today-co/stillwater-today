import { vi } from 'vitest';

// Mock Firebase config to prevent analytics initialization
vi.mock('./src/lib/firebase/config', () => ({
  app: {},
  auth: {},
  firestore: {},
  storage: {},
  analytics: null
}));

// Mock Firebase Analytics
vi.mock('firebase/analytics', () => ({
  getAnalytics: vi.fn(),
  isSupported: vi.fn(() => Promise.resolve(false))
}));

// Provide minimal window/document for jsdom
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}
