# Persistence Isolation

## Goals

- Ensure complete data separation between user accounts
- Clear persisted data on logout and before initializing a new session
- Namespace storage keys with user ID to avoid collisions
- Validate storage on startup for residual data
- Maintain backward compatibility with existing stored formats

## Storage Cleanup

- On logout: clear `localStorage`, `sessionStorage`, and attempt to delete IndexedDB databases
- Before login initializes a new user: perform the same cleanup
- Implementation: `src/utils/persistence.ts` exports `clearAllPersistence()`

## Namespaced Keys

- Format: `bdms:<userId>:<key>`
- Helper: `nsKey(userId, key)`
- Components and hooks use namespaced keys when a user is present; legacy keys are migrated on first access

## Startup Validation

- On app mount: remove non-namespaced residual keys when no user is present
- After restoring a user: remove keys not matching the current user namespace
- Implementation: `validateStorageIsolation(currentUserId)`

## Backward Compatibility

- When loading persisted values, code checks both namespaced and legacy keys
- If a legacy key is found, its value is migrated to the namespaced key and the legacy key is removed

## IndexedDB

- If `indexedDB.databases()` is supported, each database is deleted
- If unsupported, no-op; the app does not currently use IndexedDB

## Tests

- Vitest suite validates cleanup, namespacing, and isolation
- Location: `src/__tests__/persistence.test.ts`

## Integration Notes

- User ID is tracked via `setCurrentUserId` and read via `getCurrentUserId`
- UI preferences and persisted states should use namespaced keys when available
- Non-session-wide keys like `user` remain non-namespaced for session bootstrap

