import { renderHook, waitFor, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock Firebase modules FIRST before any imports
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({ currentUser: null })),
  onAuthStateChanged: vi.fn()
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  arrayUnion: vi.fn(),
  arrayRemove: vi.fn()
}));

vi.mock('../../lib/firebase/config', () => ({
  app: { name: '[DEFAULT]', options: {}, automaticDataCollectionEnabled: false },
  auth: { currentUser: null },
  firestore: {},
  storage: {},
  analytics: null
}));

import * as firestoreModule from '../../lib/firebase/firestore';
import { useFavorites } from '../useFavorites';
import * as authHook from '../useAuth';

// Mock the useAuth hook
vi.mock('../useAuth');

// Mock Firestore functions
vi.mock('../../lib/firebase/firestore', async () => {
  const actual = await vi.importActual('../../lib/firebase/firestore');
  return {
    ...actual,
    createUserProfile: vi.fn(),
    cleanupDuplicateFavorites: vi.fn(),
    getUserFavoriteEvents: vi.fn(),
    addEventToFavorites: vi.fn(),
    removeEventFromFavorites: vi.fn()
  };
});

// Mock getCachedEvents
vi.mock('../../services/events', () => ({
  getCachedEvents: vi.fn(() => [
    { id: 1, rawDate: new Date('2025-12-01') },
    { id: 2, rawDate: new Date('2025-12-02') }
  ])
}));

describe('useFavorites Integration Tests', () => {
  const mockUser = {
    uid: 'test-user-123',
    email: 'test@example.com',
    displayName: 'Test User',
    emailVerified: false,
    isAnonymous: false,
    metadata: {},
    providerData: [],
    refreshToken: '',
    tenantId: null,
    delete: async () => {},
    getIdToken: async () => '',
    getIdTokenResult: async () => ({} as any), // eslint-disable-line @typescript-eslint/no-explicit-any
    reload: async () => {},
    toJSON: () => ({} as any), // eslint-disable-line @typescript-eslint/no-explicit-any
    phoneNumber: null,
    photoURL: null,
    providerId: 'firebase'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mocks
    vi.mocked(firestoreModule.createUserProfile).mockResolvedValue({
      uid: mockUser.uid,
      email: mockUser.email,
      displayName: mockUser.displayName,
      favoriteEvents: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    vi.mocked(firestoreModule.cleanupDuplicateFavorites).mockResolvedValue();
    vi.mocked(firestoreModule.getUserFavoriteEvents).mockResolvedValue([]);
    vi.mocked(firestoreModule.addEventToFavorites).mockResolvedValue();
    vi.mocked(firestoreModule.removeEventFromFavorites).mockResolvedValue();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads user favorites from Firestore on mount', async () => {
    // Mock authenticated user
    vi.mocked(authHook.useAuth).mockReturnValue({
      user: mockUser,
      loading: false
    });

    // Mock Firestore returning some favorites
    vi.mocked(firestoreModule.getUserFavoriteEvents).mockResolvedValue([1, 2, 3]);

    const { result } = renderHook(() => useFavorites());

    // Wait for the async loading to complete
    await waitFor(() => {
      expect(result.current.favoritesLoading).toBe(false);
    });

    // Verify the integration: hook called Firestore and got favorites
    expect(firestoreModule.createUserProfile).toHaveBeenCalledWith(mockUser);
    expect(firestoreModule.cleanupDuplicateFavorites).toHaveBeenCalledWith(mockUser.uid);
    expect(firestoreModule.getUserFavoriteEvents).toHaveBeenCalledWith(mockUser.uid);
    expect(result.current.favorites).toEqual([1, 2, 3]);
  });

  it('adds a favorite and syncs with Firestore', async () => {
    vi.mocked(authHook.useAuth).mockReturnValue({
      user: mockUser,
      loading: false
    });

    // Start with no favorites
    vi.mocked(firestoreModule.getUserFavoriteEvents).mockResolvedValue([]);

    const { result } = renderHook(() => useFavorites());

    await waitFor(() => {
      expect(result.current.favoritesLoading).toBe(false);
    });

    // Mock Firestore returning updated list after adding
    vi.mocked(firestoreModule.getUserFavoriteEvents).mockResolvedValue([42]);

    // Add a favorite
    await act(async () => {
      await result.current.addFavorite(42);
    });

    // Verify integration: hook called Firestore to add favorite
    expect(firestoreModule.addEventToFavorites).toHaveBeenCalledWith(mockUser.uid, 42);
    
    // Verify the hook reloaded favorites from Firestore
    // Wait for state update
    await waitFor(() => {
      expect(result.current.favorites).toEqual([42]);
    });
    expect(firestoreModule.getUserFavoriteEvents).toHaveBeenCalledTimes(2);
    expect(result.current.favorites).toEqual([42]);
  });

  it('removes a favorite and syncs with Firestore', async () => {
    vi.mocked(authHook.useAuth).mockReturnValue({
      user: mockUser,
      loading: false
    });

    // Start with one favorite
    vi.mocked(firestoreModule.getUserFavoriteEvents).mockResolvedValue([42]);

    const { result } = renderHook(() => useFavorites());

    await waitFor(() => {
      expect(result.current.favoritesLoading).toBe(false);
    });

    expect(result.current.favorites).toEqual([42]);

    // Mock Firestore returning empty list after removal
    vi.mocked(firestoreModule.getUserFavoriteEvents).mockResolvedValue([]);

    // Remove the favorite
    await act(async () => {
      await result.current.removeFavorite(42);
    });

    // Verify integration: hook called Firestore to remove favorite
    expect(firestoreModule.removeEventFromFavorites).toHaveBeenCalledWith(mockUser.uid, 42);
    
    // Verify the hook reloaded favorites from Firestore
    // Wait for state update
    await waitFor(() => {
      expect(result.current.favorites).toEqual([]);
    });
    expect(firestoreModule.getUserFavoriteEvents).toHaveBeenCalledTimes(2);
    expect(result.current.favorites).toEqual([]);
  });

  it('handles Firestore errors gracefully', async () => {
    vi.mocked(authHook.useAuth).mockReturnValue({
      user: mockUser,
      loading: false
    });

    // Mock Firestore throwing an error
    vi.mocked(firestoreModule.getUserFavoriteEvents).mockRejectedValue(
      new Error('Firestore connection failed')
    );

    const { result } = renderHook(() => useFavorites());

    await waitFor(() => {
      expect(result.current.favoritesLoading).toBe(false);
    });

    // Verify error is captured
    expect(result.current.error).toBe('Firestore connection failed');
    expect(result.current.favorites).toEqual([]);
  });

  it('prevents duplicate favorites', async () => {
    vi.mocked(authHook.useAuth).mockReturnValue({
      user: mockUser,
      loading: false
    });

    // Start with favorite already added
    vi.mocked(firestoreModule.getUserFavoriteEvents).mockResolvedValue([42]);

    const { result } = renderHook(() => useFavorites());

    await waitFor(() => {
      expect(result.current.favoritesLoading).toBe(false);
    });

    // Try to add the same favorite again
    const success = await result.current.addFavorite(42);

    // Should return true but not call Firestore since it's already favorited
    expect(success).toBe(true);
    expect(firestoreModule.addEventToFavorites).not.toHaveBeenCalled();
  });
});
