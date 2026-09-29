# TravelMate AI — Firestore Security Specification (Phase 0 TDD)

## 1. Data Invariants

1. **Global Default Deny**: Any path not explicitly matched under `/users/{userId}` or `/trips/{tripId}` is unconditionally denied (`allow read, write: if false;`).
2. **Verified Authentication Gate**: All writes (`create`, `update`, `delete`) require an authenticated user with a verified email (`request.auth != null && request.auth.token.email_verified == true`).
3. **Path Variable Hardening**: Every document ID (`userId`, `tripId`) in single-document operations (`get`, `create`, `update`, `delete`) must satisfy `isValidId(id)` (`id is string && id.size() >= 1 && id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\-]+$')`).
4. **UserProfile Ownership & Isolation**:
   - A `UserProfile` at `/users/{userId}` can only be read (`get`), created, or updated by the user whose `request.auth.uid == userId`.
   - `list` and `delete` on `/users/{userId}` are denied to prevent user enumeration.
   - `incoming().uid` must equal `request.auth.uid` and `userId`.
   - `createdAt` must equal `request.time` on create and remain immutable on update (`incoming().createdAt == existing().createdAt`).
   - `updatedAt` must equal `request.time` on both create and update.
5. **SavedTrip Ownership,Relational Consistency & Query Enforcement**:
   - A `SavedTrip` at `/trips/{tripId}` requires `exists(/databases/$(database)/documents/users/$(request.auth.uid))` on creation so orphaned trips cannot be created without a user profile.
   - `incoming().ownerId == request.auth.uid` and `incoming().tripId == tripId`.
   - `allow get, delete` requires `existing().ownerId == request.auth.uid`.
   - `allow list` enforces `resource.data.ownerId == request.auth.uid` directly in the rule (no client-side query trust).
   - Bounded arrays `savedHotels`, `savedRestaurants`, and `savedPlaces` must have `size() <= 10` and validate the first element (`size() == 0 || (list[0] is string && list[0].size() <= 200)`).

---

## 2. The "Dirty Dozen" Adversarial Payloads

1. **Unauthenticated Write**: `auth = null`, attempting `create` on `/trips/trip_1`. -> `PERMISSION_DENIED`
2. **Unverified Email Write**: `auth = { uid: 'user_1', token: { email_verified: false } }`, attempting `create` on `/users/user_1`. -> `PERMISSION_DENIED`
3. **Identity Spoofing on UserProfile**: Authenticated as `user_1`, attempting `create` on `/users/user_1` with `uid: 'user_2'`. -> `PERMISSION_DENIED`
4. **Identity Spoofing on SavedTrip**: Authenticated as `user_1`, attempting `create` on `/trips/trip_1` with `ownerId: 'user_2'`. -> `PERMISSION_DENIED`
5. **Shadow / Ghost Field Injection on Create**: Sending valid `UserProfile` fields plus `isAdmin: true`. -> `PERMISSION_DENIED` (blocked by `keys().hasOnly(...)`)
6. **Shadow / Ghost Field Injection on Update**: Updating `SavedTrip` with an unauthorized field `isVerified: true`. -> `PERMISSION_DENIED` (blocked by `affectedKeys().hasOnly(...)`)
7. **Immortal Field Mutation (`createdAt` / `ownerId`)**: Attempting to change `ownerId` or `createdAt` during an `update` on `/trips/trip_1`. -> `PERMISSION_DENIED`
8. **Client Timestamp Forgery**: Setting `createdAt` or `updatedAt` to a past/future timestamp instead of `request.time`. -> `PERMISSION_DENIED`
9. **ID Poisoning / Oversized Path ID**: Using a document ID containing invalid characters or >128 chars. -> `PERMISSION_DENIED`
10. **Denial-of-Wallet Oversized String / Array**: Sending `itinerarySummary` with 10,000 chars or `savedPlaces` with 50 items. -> `PERMISSION_DENIED`
11. **Cross-Tenant PII / Profile Read**: Authenticated as `user_2`, attempting `get` on `/users/user_1`. -> `PERMISSION_DENIED`
12. **Unfiltered Collection Scraping (`list` on `/trips`)**: Authenticated as `user_1`, attempting `list` on `/trips` without filtering `ownerId == 'user_1'`. -> `PERMISSION_DENIED`
