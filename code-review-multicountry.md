# Code Review: Multi-Country Super Admin Support

**Reviewer:** Claude Code Review
**Date:** 2026-01-17
**Files Reviewed:**
- `/Users/eagleisbatman/digitalgreen_projects/fc_marketplace/admin/src/contexts/AdminContext.tsx`
- `/Users/eagleisbatman/digitalgreen_projects/fc_marketplace/admin/src/components/Layout.tsx`
- `/Users/eagleisbatman/digitalgreen_projects/fc_marketplace/admin/src/App.tsx`
- `/Users/eagleisbatman/digitalgreen_projects/fc_marketplace/admin/src/lib/api.ts`
- `/Users/eagleisbatman/digitalgreen_projects/fc_marketplace/admin/src/components/CountrySelectorModal.tsx`
- `/Users/eagleisbatman/digitalgreen_projects/fc_marketplace/admin/src/pages/*.tsx`

---

## Executive Summary

The multi-country super admin implementation provides a functional foundation for country-based data filtering. The core architecture is sound with proper context separation, role-based logic, and localStorage persistence. However, there are several issues ranging from critical security concerns to minor UX improvements that should be addressed.

**Overall Assessment:** The implementation is approximately 75% complete. Critical issues should be resolved before production deployment.

---

## 1. Context Design and State Management

### Strengths
- Clean separation of concerns between `AuthContext` (authentication) and `AdminContext` (country selection)
- Proper use of React hooks (`useState`, `useEffect`, `useCallback`)
- Good TypeScript typing for `Country` and `AdminContextType`
- Country flags map provides nice UX enhancement

### Issues

#### **Major: Race Condition in useEffect Hooks**
**File:** `AdminContext.tsx`, lines 93-109 and 111-123

```typescript
// Restore selected country (line 93-109)
useEffect(() => {
  if (isAuthenticated && user?.role === "super_admin") {
    const storedCountry = localStorage.getItem("fc-admin-selected-country");
    // ...
  }
}, [isAuthenticated, user?.role]);

// Persist selected country (line 111-123)
useEffect(() => {
  if (selectedCountry && user?.role === "super_admin") {
    localStorage.setItem(...);
  }
}, [selectedCountry, user?.role]);
```

**Problem:** The restoration and persistence effects can race against each other. If `selectedCountry` is set before restoration runs, the persist effect may overwrite valid stored data.

**Recommendation:** Consolidate into a single effect with proper sequencing, or add a `hasRestoredFromStorage` state flag.

---

#### **Minor: Potential Memory Leak in Fetch**
**File:** `AdminContext.tsx`, lines 54-78

```typescript
useEffect(() => {
  if (isAuthenticated && user?.role === "super_admin" && token) {
    setIsLoadingCountries(true);
    fetch(`${API_URL}/admin/locations/countries`, { ... })
      .then(...)
      .catch(...)
      .finally(...);
  }
}, [isAuthenticated, user?.role, token]);
```

**Problem:** No cleanup function or AbortController. If the component unmounts during fetch, state updates will be attempted on an unmounted component.

**Recommendation:**
```typescript
useEffect(() => {
  const controller = new AbortController();
  // ... fetch with signal: controller.signal
  return () => controller.abort();
}, [...]);
```

---

#### **Suggestion: Missing Error State**
**File:** `AdminContext.tsx`

The context does not expose any error state for when the countries API call fails. This makes it difficult for the UI to provide meaningful feedback.

**Recommendation:** Add `countriesError: string | null` to the context type and expose it.

---

## 2. Role-Based Access Logic

### Strengths
- Correct role checking (`user?.role === "super_admin"`)
- Auto-assignment for `country_admin` and `state_admin` works correctly
- `needsCountrySelection` computed property is well-designed

### Issues

#### **Critical: No Country Validation for country_admin/state_admin**
**File:** `AdminContext.tsx`, lines 82-91

```typescript
useEffect(() => {
  if (isAuthenticated && user && user.role !== "super_admin" && user.countryId) {
    setSelectedCountryState({
      id: user.countryId,
      code: user.countryCode || "",
      name: user.countryName || "",
      flag: countryFlags[user.countryCode || ""] || "",
    });
  }
}, [isAuthenticated, user]);
```

**Problem:** If `countryId` exists but `countryCode` or `countryName` are missing/empty, the admin will have a partial country object. This could cause issues downstream.

**Recommendation:** Add validation:
```typescript
if (user.countryId && user.countryCode && user.countryName) {
  // safe to set
}
```

---

#### **Major: super_admin Can Operate Without Country Selection**
**File:** `App.tsx` and `CountrySelectorModal.tsx`

While the modal blocks navigation via `onPointerDownOutside` and `onEscapeKeyDown`, the actual pages still render behind the modal. If a super_admin somehow bypasses or closes the modal (e.g., browser dev tools), they can interact with pages that have no country filter set.

**Recommendation:** Add a guard in pages that require country context:
```typescript
if (!selectedCountry) {
  return <div>Please select a country to continue</div>;
}
```

Or wrap in `ProtectedRoute` to block rendering until country is selected.

---

## 3. LocalStorage Usage and Security

### Issues

#### **Critical: Sensitive Data in LocalStorage**
**File:** `AdminContext.tsx` (line 114-121) and `AuthContext.tsx` (lines 57-65)

```typescript
// AdminContext - storing country
localStorage.setItem("fc-admin-selected-country", JSON.stringify({
  id: selectedCountry.id,
  code: selectedCountry.code,
  name: selectedCountry.name,
}));

// AuthContext - storing user and token
localStorage.setItem("fc-admin-token", token);
localStorage.setItem("fc-admin-user", JSON.stringify(user));
```

**Problems:**
1. JWT tokens should be stored in `httpOnly` cookies, not localStorage (XSS vulnerability)
2. User data including `countryId`, `stateId`, role, etc. is stored client-side and can be tampered
3. The `fc-admin-selected-country` value can be modified to change the country filter client-side (though backend should enforce server-side)

**Severity:** This is a **critical security concern** for production. For admin panels, tokens in localStorage can be exfiltrated via XSS attacks.

**Recommendation:**
1. Move token storage to `httpOnly` cookies with `SameSite=Strict`
2. Consider using sessionStorage instead of localStorage for less persistence
3. Ensure backend validates country access on every request (defense in depth)

---

#### **Minor: No Expiration Check for Stored Data**
**File:** `AdminContext.tsx`, lines 93-109

The stored country is restored without any timestamp validation. If the backend removes access to a country, the frontend will still show it as selected until the user explicitly changes it.

**Recommendation:** Include a timestamp and validate against a maximum age, or refresh on every load.

---

## 4. Edge Cases

### Issues

#### **Major: No Countries Available Scenario**
**File:** `CountrySelectorModal.tsx`, lines 57-61

```typescript
) : countries.length === 0 ? (
  <div className="text-center py-8 text-muted-foreground">
    <p>No countries available.</p>
    <p className="text-sm mt-2">Please contact support.</p>
  </div>
)
```

**Problem:** The super_admin is stuck in a modal with no way to proceed. They cannot:
- Log out (button is behind the modal)
- Access any functionality
- Do anything except refresh the page

**Recommendation:** Add a logout button within the modal when no countries are available:
```typescript
<Button variant="outline" onClick={logout}>
  Log Out
</Button>
```

---

#### **Major: Country Switch Mid-Session Data Inconsistency**
**Files:** `Users.tsx`, `FPOs.tsx`

When a super_admin switches countries mid-session:
1. The pages reload data with the new `countryCode` (good)
2. But any unsaved form data, open dialogs, or selected items remain (bad)
3. The bulk selection state (`selectedUsers`) is not cleared

**Evidence:** In `Users.tsx`, line 231:
```typescript
useEffect(() => {
  loadUsers();
}, [userType, currentPage, pageSize, filterLocation, ..., selectedCountry]);
```

The `selectedUsers` state is not reset when `selectedCountry` changes.

**Recommendation:** Clear all selection and form states when `selectedCountry` changes:
```typescript
useEffect(() => {
  setSelectedUsers(new Set());
  setExpandedFpoId(null);
  // ... clear other state
}, [selectedCountry]);
```

---

#### **Minor: Stale Country Object After Update**
If the backend updates a country's name or code, the localStorage cache will retain old data until the user clears it or selects a different country.

**Recommendation:** Validate stored country against fetched countries list and update if discrepancies found.

---

## 5. Integration with Pages and API Calls

### Strengths
- `Users.tsx` and `FPOs.tsx` properly integrate `selectedCountry?.code` into API calls
- Dependency arrays include `selectedCountry` to trigger refetch on change
- API functions (`getUsers`, `getFPOs`, `getServiceProviders`) accept `countryCode` parameter

### Issues

#### **Critical: Inconsistent Country Filtering Across Pages**

| Page | Uses Country Filter | Status |
|------|-------------------|--------|
| Users.tsx | Yes (line 320-322) | Correct |
| FPOs.tsx | Yes (line 282-284) | Correct |
| Dashboard.tsx | No API calls | N/A |
| Providers.tsx | **No** | **Missing** |
| Brands.tsx | Not reviewed | Unknown |
| Products.tsx | Not reviewed | Unknown |
| Locations.tsx | **No** | **Missing** |
| Import.tsx | **No** | **Missing** |

**File:** `Providers.tsx`, lines 39-46
```typescript
const loadProviders = async () => {
  // ...
  const response = await getServiceProviders({ limit: 100 }) as ...
  // NO countryCode passed!
};
```

**Problem:** Service Providers page does not filter by selected country. A super_admin managing India could see providers from Kenya.

**Recommendation:** Add country filtering to all relevant pages:
```typescript
const { selectedCountry } = useAdmin();
// ...
const response = await getServiceProviders({
  limit: 100,
  countryCode: selectedCountry?.code
});
```

---

#### **Major: Locations Page Hardcoded to India**
**File:** `Locations.tsx`, lines 49-52 and 184-195

```typescript
<p className="text-muted-foreground">
  India location hierarchy (States -> Districts -> Blocks -> Villages)
</p>
// ...
<p>All 28 states and 8 union territories</p>
<p>765 districts with official LGD codes</p>
```

**Problem:** The Locations page is completely India-specific and does not adapt to the selected country. This is misleading for multi-country admins.

**Recommendation:**
1. Update the page to show country-specific data
2. Filter location sync status by selected country
3. Update copy to be country-agnostic or dynamic

---

#### **Major: Import Page Missing Country Context**
**File:** `Import.tsx`

The bulk import functionality does not pass country context to the import APIs. This means:
1. Imported data may not be associated with the correct country
2. Location imports (districts, blocks, villages) may create data for wrong countries

**Recommendation:**
1. Add `useAdmin` hook to Import page
2. Pass `countryCode` to import API calls
3. Validate country in backend import endpoints

---

## 6. API Layer Review

### Strengths
- `api.ts` has proper TypeScript types for filter parameters
- `countryCode` parameter is available on relevant endpoints
- Error handling redirects to login on 401

### Issues

#### **Minor: Missing Country Filter on Some API Functions**

| Function | Has countryCode param |
|----------|----------------------|
| getUsers | Yes |
| getFPOs | Yes |
| getServiceProviders | Yes |
| getBrands | **No** |
| getProducts | **No** |
| getCategories | **No** |

**Recommendation:** Add `countryCode` parameter to `getBrands`, `getProducts`, and consider for reference data endpoints.

---

#### **Suggestion: Type Safety for Country Code**
**File:** `api.ts`

Consider using a union type or enum for country codes:
```typescript
type CountryCode = 'IN' | 'KE' | 'NG' | 'ET' | 'TZ' | 'UG' | 'GH' | 'ZA' | 'BD' | 'NP';
```

This would catch typos at compile time.

---

## 7. UX/UI Considerations

### Issues

#### **Minor: Country Selector Only Shows Flag on Mobile**
**File:** `Layout.tsx`, lines 113-116

```typescript
<span className="text-base">{selectedCountry.flag}</span>
<span className="hidden sm:inline">{selectedCountry.name}</span>
```

On mobile, only the flag emoji is visible. While space-efficient, this may confuse users who don't recognize the flag.

**Recommendation:** Consider showing a short country code (`IN`, `KE`) instead of hiding entirely.

---

#### **Minor: No Loading State When Switching Countries**
When a super_admin switches countries, there's no visual feedback that data is reloading. The page continues showing old data until new data arrives.

**Recommendation:** Show a loading overlay or disable interactions during country switch transition.

---

#### **Suggestion: Confirmation Before Country Switch**
If a super_admin has unsaved changes (e.g., form filled but not submitted), switching countries will lose that data silently.

**Recommendation:** Add a confirmation dialog when switching countries if there are unsaved changes.

---

## Summary of Issues by Severity

### Critical (3)
1. Sensitive data (JWT token) stored in localStorage - XSS vulnerability
2. No country validation for country_admin/state_admin with partial data
3. Inconsistent country filtering - Providers, Locations, Import pages missing filter

### Major (5)
1. Race condition in useEffect hooks for country restoration/persistence
2. super_admin can operate without country selection if modal is bypassed
3. No escape from modal when no countries available
4. Country switch mid-session doesn't clear selection states
5. Import page doesn't pass country context to API

### Minor (5)
1. Potential memory leak - no AbortController in fetch
2. No error state exposed from AdminContext
3. No expiration check for stored country data
4. Locations page hardcoded to India
5. Missing countryCode on getBrands, getProducts API functions

### Suggestions (4)
1. Add logout button in CountrySelectorModal when no countries
2. Add type safety with CountryCode union type
3. Show country code on mobile instead of hiding
4. Add confirmation dialog before country switch with unsaved changes

---

## Recommended Priority Order

1. **Immediate (before deploy):**
   - Fix inconsistent country filtering across all pages
   - Add country guard in pages requiring country context
   - Address XSS vulnerability (move token to httpOnly cookies)

2. **Short-term (next sprint):**
   - Fix race condition in useEffect hooks
   - Add AbortController to prevent memory leaks
   - Clear state on country switch
   - Fix Import page country context

3. **Medium-term:**
   - Make Locations page country-aware
   - Add error handling/exposure in AdminContext
   - Improve UX with loading states and confirmations

---

## Files Requiring Changes

| File | Priority | Changes Needed |
|------|----------|----------------|
| `AdminContext.tsx` | High | Race condition fix, AbortController, error state |
| `Providers.tsx` | High | Add country filter |
| `Import.tsx` | High | Add country context to imports |
| `Locations.tsx` | Medium | Make country-aware |
| `CountrySelectorModal.tsx` | Medium | Add logout when no countries |
| `Layout.tsx` | Low | Mobile country display |
| `api.ts` | Medium | Add countryCode to more endpoints |
| `Users.tsx` | Medium | Clear state on country switch |
| `FPOs.tsx` | Medium | Clear state on country switch |
