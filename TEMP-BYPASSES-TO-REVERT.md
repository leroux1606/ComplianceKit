# TEMPORARY BYPASSES - MUST REVERT BEFORE PRODUCTION

⚠️ **IMPORTANT**: These bypasses were added for debugging and MUST be reverted before going to production!

## Files Modified:

### 1. `lib/actions/scan.ts` (Line ~26-33)
**What was bypassed**: Monthly scan limit check
**Location**: In `triggerScan()` function
**Search for**: `TEMPORARILY DISABLED FOR DEBUGGING`
**Action needed**: Uncomment the `checkPlanLimit("scans")` code block

```typescript
// CURRENTLY BYPASSED:
// const limitCheck = await checkPlanLimit("scans");
// if (!limitCheck.allowed) { ... }

// SHOULD BE:
const limitCheck = await checkPlanLimit("scans");
if (!limitCheck.allowed) {
  return { 
    error: `You've reached your monthly scan limit of ${limitCheck.limit}. Please upgrade to run more scans.`,
    limitReached: true
  };
}
```

### 2. `lib/actions/website.ts` (Line ~104-110)
**What was bypassed**: Website limit check
**Location**: In `createWebsite()` function
**Search for**: `TEMPORARILY DISABLED FOR DEBUGGING`
**Action needed**: Uncomment the `checkPlanLimit("websites")` code block

```typescript
// CURRENTLY BYPASSED:
// const limitCheck = await checkPlanLimit("websites");
// if (!limitCheck.allowed) { ... }

// SHOULD BE:
const limitCheck = await checkPlanLimit("websites");
if (!limitCheck.allowed) {
  return { 
    error: `You've reached your plan limit of ${limitCheck.limit} website${limitCheck.limit !== 1 ? 's' : ''}. Please upgrade to add more.`,
    limitReached: true
  };
}
```

## How to Revert:

1. Search for "TEMPORARILY DISABLED FOR DEBUGGING" in the codebase
2. Uncomment the limit check code blocks
3. Test that limits are working correctly
4. Delete this file

## Date Added: 2026-02-16
## Reason: Debugging compliance score calculation issue
