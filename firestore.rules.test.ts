/**
 * Firestore Security Rules Test Suite for TravelMate AI
 * Verifies all "Dirty Dozen" adversarial payloads return PERMISSION_DENIED.
 */

export interface TestCase {
  id: number;
  name: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  path: string;
  auth: { uid: string; email_verified: boolean } | null;
  payload?: Record<string, unknown>;
  expectedResult: 'PERMISSION_DENIED' | 'ALLOWED';
}

export const dirtyDozenTests: TestCase[] = [
  {
    id: 1,
    name: 'Unauthenticated Write to Trips',
    operation: 'create',
    path: '/trips/trip_1',
    auth: null,
    payload: { tripId: 'trip_1', ownerId: 'user_1' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Unverified Email Write to Users',
    operation: 'create',
    path: '/users/user_1',
    auth: { uid: 'user_1', email_verified: false },
    payload: { uid: 'user_1', displayName: 'Traveller' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Identity Spoofing on UserProfile',
    operation: 'create',
    path: '/users/user_1',
    auth: { uid: 'user_1', email_verified: true },
    payload: { uid: 'user_2', displayName: 'Spoofed' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Identity Spoofing on SavedTrip',
    operation: 'create',
    path: '/trips/trip_1',
    auth: { uid: 'user_1', email_verified: true },
    payload: { tripId: 'trip_1', ownerId: 'user_2' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Shadow Field Injection on Create',
    operation: 'create',
    path: '/users/user_1',
    auth: { uid: 'user_1', email_verified: true },
    payload: {
      uid: 'user_1',
      displayName: 'Alice',
      homeCity: 'Hyderabad',
      preferredCurrency: 'INR',
      travelStyle: 'Standard',
      isAdmin: true,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Shadow Field Injection on Update',
    operation: 'update',
    path: '/trips/trip_1',
    auth: { uid: 'user_1', email_verified: true },
    payload: { isVerified: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Immortal Field Mutation (ownerId)',
    operation: 'update',
    path: '/trips/trip_1',
    auth: { uid: 'user_1', email_verified: true },
    payload: { ownerId: 'user_999' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Client Timestamp Forgery',
    operation: 'create',
    path: '/users/user_1',
    auth: { uid: 'user_1', email_verified: true },
    payload: { createdAt: '2020-01-01T00:00:00Z' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'ID Poisoning via Invalid Characters',
    operation: 'create',
    path: '/trips/trip$invalid!id',
    auth: { uid: 'user_1', email_verified: true },
    payload: { tripId: 'trip$invalid!id', ownerId: 'user_1' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Denial-of-Wallet Oversized Array',
    operation: 'create',
    path: '/trips/trip_1',
    auth: { uid: 'user_1', email_verified: true },
    payload: {
      savedPlaces: new Array(25).fill('Place'),
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Cross-Tenant Profile Read',
    operation: 'get',
    path: '/users/user_1',
    auth: { uid: 'user_2', email_verified: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Unfiltered List Query on Trips',
    operation: 'list',
    path: '/trips',
    auth: { uid: 'user_2', email_verified: true },
    expectedResult: 'PERMISSION_DENIED',
  },
];
