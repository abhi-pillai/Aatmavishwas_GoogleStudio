# Security Specification: Firestore Rules for Aatmavishwas

## 1. Data Invariants
1. **User Identity Invariant**: A user profile at `/users/{userId}` can only be created or updated if `request.auth.uid == userId`.
2. **PII Isolation Invariant**: Direct access to `/users/{userId}` is strictly restricted to the account owner (`request.auth.uid == userId`). No unauthorized reading or listing of user profiles.
3. **Username Integrity Invariant**: Usernames in `/usernames/{username}` must be lowercase, alphanumeric with underscores (`^[a-zA-Z0-9_]{3,30}$`).
4. **No Username Hijacking**: A username mapping can only be created if it doesn't already exist and belongs to `request.auth.uid`. Existing username records cannot be overwritten by other users.
5. **Session Ownership Invariant**: Practice sessions in `/users/{userId}/sessions/{sessionId}` are owned by `userId` and cannot be accessed, read, or modified by any other user.
6. **No List Injections**: List operations on `/users/{userId}/sessions` enforce that the querying client is authenticated and matches `userId`.
7. **Document ID Format Guard**: All IDs must strictly match safe string limits (`isValidId`) to prevent ID poisoning and Denial-of-Wallet injection.

## 2. The "Dirty Dozen" Payloads
1. **Payload 1 (Impersonation Write)**: An unauthenticated user attempts to create `/users/attacker-uid`. Expected: PERMISSION_DENIED.
2. **Payload 2 (Cross-User Profile Read)**: User `userA` attempts to read `/users/userB`. Expected: PERMISSION_DENIED.
3. **Payload 3 (Cross-User Profile Update)**: User `userA` attempts to edit `email` on `/users/userB`. Expected: PERMISSION_DENIED.
4. **Payload 4 (Unbounded Document ID)**: An attacker creates `/users/{id}` where `id` is a 2KB junk string. Expected: PERMISSION_DENIED.
5. **Payload 5 (Username Overwrite / Squatting)**: User `userB` attempts to overwrite `/usernames/john_doe` created by `userA`. Expected: PERMISSION_DENIED.
6. **Payload 6 (Shadow Field Injection)**: User creates `/users/{userId}` containing arbitrary keys `isAdmin: true` or `role: "admin"`. Expected: PERMISSION_DENIED.
7. **Payload 7 (Unauthenticated Username List)**: Unauthenticated visitor attempts to list all records from `/usernames`. Expected: PERMISSION_DENIED.
8. **Payload 8 (Invalid Username Format)**: User attempts to register `/usernames/../../evil`. Expected: PERMISSION_DENIED.
9. **Payload 9 (Cross-User Session Theft)**: User `userA` queries `/users/userB/sessions`. Expected: PERMISSION_DENIED.
10. **Payload 10 (Session Spoofing)**: User `userA` tries to inject a high-score session with `userId: "userB"`. Expected: PERMISSION_DENIED.
11. **Payload 11 (Orphaned Session Write)**: Unauthenticated client creates `/users/anon/sessions/s1`. Expected: PERMISSION_DENIED.
12. **Payload 12 (Self-Assigned Role Elevation)**: Authenticated user updates their own profile to add a `role` field. Expected: PERMISSION_DENIED.
