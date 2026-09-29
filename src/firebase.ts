import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export interface UserProfileData {
  uid: string;
  displayName: string;
  homeCity: string;
  preferredCurrency: 'INR' | 'USD' | 'EUR';
  travelStyle: 'Budget' | 'Standard' | 'Premium';
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface SavedTripRecord {
  tripId: string;
  ownerId: string;
  origin: string;
  destination: string;
  startDate: string;
  endDate: string;
  travellers: number;
  tripType: 'Solo' | 'Family' | 'Friends' | 'Couple' | 'Business';
  totalBudget: number;
  savedHotels: string[];
  savedRestaurants: string[];
  savedPlaces: string[];
  itinerarySummary: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

function sanitizeId(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128) || 'item_1';
}

function clampString(val: string, max: number, fallback = 'N/A'): string {
  const trimmed = (val || '').trim();
  if (!trimmed) return fallback;
  return trimmed.slice(0, max);
}

function clampStringArray(arr: string[]): string[] {
  return (arr || [])
    .slice(0, 10)
    .map((item) => clampString(String(item), 200, 'Item'));
}

export async function signInWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  await ensureUserProfile(result.user);
  return result.user;
}

export async function logOutUser(): Promise<void> {
  await signOut(auth);
}

export async function ensureUserProfile(user: User): Promise<UserProfileData> {
  const uid = sanitizeId(user.uid);
  const path = `users/${uid}`;
  const userRef = doc(db, 'users', uid);

  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserProfileData;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }

  const newProfile = {
    uid,
    displayName: clampString(user.displayName || 'Traveller', 100, 'Traveller'),
    homeCity: 'Hyderabad',
    preferredCurrency: 'INR' as const,
    travelStyle: 'Standard' as const,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(userRef, newProfile);
    return newProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateUserProfileData(
  uid: string,
  updates: Pick<UserProfileData, 'displayName' | 'homeCity' | 'preferredCurrency' | 'travelStyle'>
): Promise<void> {
  const safeUid = sanitizeId(uid);
  const path = `users/${safeUid}`;
  const userRef = doc(db, 'users', safeUid);

  try {
    await updateDoc(userRef, {
      displayName: clampString(updates.displayName, 100, 'Traveller'),
      homeCity: clampString(updates.homeCity, 100, 'Hyderabad'),
      preferredCurrency: ['INR', 'USD', 'EUR'].includes(updates.preferredCurrency)
        ? updates.preferredCurrency
        : 'INR',
      travelStyle: ['Budget', 'Standard', 'Premium'].includes(updates.travelStyle)
        ? updates.travelStyle
        : 'Standard',
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function saveTripToFirestore(
  user: User,
  tripData: Omit<SavedTripRecord, 'ownerId' | 'createdAt' | 'updatedAt'>
): Promise<void> {
  await ensureUserProfile(user);
  const tripId = sanitizeId(tripData.tripId);
  const ownerId = sanitizeId(user.uid);
  const path = `trips/${tripId}`;
  const tripRef = doc(db, 'trips', tripId);

  let existsAlready = false;
  try {
    const snap = await getDoc(tripRef);
    existsAlready = snap.exists();
  } catch {
    existsAlready = false;
  }

  const validTripType = ['Solo', 'Family', 'Friends', 'Couple', 'Business'].includes(
    tripData.tripType
  )
    ? tripData.tripType
    : 'Couple';

  if (!existsAlready) {
    try {
      await setDoc(tripRef, {
        tripId,
        ownerId,
        origin: clampString(tripData.origin, 100, 'Hyderabad'),
        destination: clampString(tripData.destination, 100, 'Goa'),
        startDate: clampString(tripData.startDate, 30, '2026-10-15'),
        endDate: clampString(tripData.endDate, 30, '2026-10-18'),
        travellers: Math.max(1, Math.min(50, Math.round(tripData.travellers || 2))),
        tripType: validTripType,
        totalBudget: Math.max(0, Math.min(100000000, Math.round(tripData.totalBudget || 25000))),
        savedHotels: clampStringArray(tripData.savedHotels),
        savedRestaurants: clampStringArray(tripData.savedRestaurants),
        savedPlaces: clampStringArray(tripData.savedPlaces),
        itinerarySummary: clampString(tripData.itinerarySummary, 5000, 'Custom Trip Itinerary'),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  } else {
    try {
      await updateDoc(tripRef, {
        origin: clampString(tripData.origin, 100, 'Hyderabad'),
        destination: clampString(tripData.destination, 100, 'Goa'),
        startDate: clampString(tripData.startDate, 30, '2026-10-15'),
        endDate: clampString(tripData.endDate, 30, '2026-10-18'),
        travellers: Math.max(1, Math.min(50, Math.round(tripData.travellers || 2))),
        tripType: validTripType,
        totalBudget: Math.max(0, Math.min(100000000, Math.round(tripData.totalBudget || 25000))),
        savedHotels: clampStringArray(tripData.savedHotels),
        savedRestaurants: clampStringArray(tripData.savedRestaurants),
        savedPlaces: clampStringArray(tripData.savedPlaces),
        itinerarySummary: clampString(tripData.itinerarySummary, 5000, 'Custom Trip Itinerary'),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }
}

export async function deleteTripFromFirestore(tripId: string): Promise<void> {
  const safeId = sanitizeId(tripId);
  const path = `trips/${safeId}`;
  try {
    await deleteDoc(doc(db, 'trips', safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export { onAuthStateChanged, collection, query, where, onSnapshot };
export type { User };
