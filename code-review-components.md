# Code Review: FC Marketplace Admin Dashboard Components

**Review Date:** January 17, 2026
**Reviewer:** Code Review Agent
**Files Reviewed:**
- `/Users/eagleisbatman/digitalgreen_projects/fc_marketplace/admin/src/components/LocationSelector.tsx`
- `/Users/eagleisbatman/digitalgreen_projects/fc_marketplace/admin/src/components/FPOSelector.tsx`
- `/Users/eagleisbatman/digitalgreen_projects/fc_marketplace/admin/src/components/CountrySelectorModal.tsx`

---

## Table of Contents

1. [LocationSelector.tsx](#1-locationselectortsx)
2. [FPOSelector.tsx](#2-fposelectortsx)
3. [CountrySelectorModal.tsx](#3-countryselectormodaltsx)
4. [Summary and Recommendations](#4-summary-and-recommendations)

---

## 1. LocationSelector.tsx

### Overview
A cascading location selector component that allows users to select Country > State > District > Block > Village in a hierarchical manner. Includes search functionality for large lists.

### Critical Issues

**None identified.**

### Major Issues

#### M1. Missing Error State UI Feedback
**Lines 127-195**
When API calls fail, errors are only logged to console. Users receive no visual feedback about failures.

```typescript
// Current behavior - silent failure
catch (err) {
  console.error("Failed to load countries:", err);
}
```

**Recommendation:** Add error state management and display error messages to users.

```typescript
const [error, setError] = useState<string | null>(null);
// In catch block: setError("Failed to load countries. Please try again.");
```

#### M2. Missing Effect Cleanup / Race Condition Potential
**Lines 86-125**
Multiple useEffect hooks make async calls without cleanup. If the component unmounts or dependencies change rapidly, stale data could be set.

```typescript
useEffect(() => {
  if (value?.stateCode) {
    loadDistricts(value.stateCode); // No abort controller
  }
}, [value?.stateCode]);
```

**Recommendation:** Implement AbortController for API cancellation:

```typescript
useEffect(() => {
  const controller = new AbortController();
  if (value?.stateCode) {
    loadDistricts(value.stateCode, controller.signal);
  }
  return () => controller.abort();
}, [value?.stateCode]);
```

#### M3. Missing ESLint Dependencies Warning
**Lines 86-98**
The `loadCountries` and `loadStates` functions are called inside useEffect but not listed in the dependency array. This can lead to stale closures if these functions reference external state.

```typescript
useEffect(() => {
  if (showCountry) {
    loadCountries(); // loadCountries not in deps
  }
}, [showCountry]); // Missing dependency
```

**Recommendation:** Either use `useCallback` for the load functions or move them inside the effect.

### Minor Issues

#### m1. Type Assertions Instead of Proper API Types
**Lines 130, 144, 158, 172, 186**
Using `as` type assertions for API responses is a code smell. This bypasses TypeScript's type checking.

```typescript
const response = await getStates(countryCode) as { success: boolean; data?: State[] };
```

**Recommendation:** Define proper return types in the API layer and let TypeScript infer them.

#### m2. Duplicate Type Definitions
**Lines 14-39**
Types like `Country`, `State`, `District`, `Block`, `Village` are defined locally. These should likely be shared types from a central location.

**Recommendation:** Move types to a shared types file (e.g., `@/types/location.ts`).

#### m3. Magic Number for MAX_VISIBLE_ITEMS
**Line 83**
`MAX_VISIBLE_ITEMS = 50` is defined as a const inside the component but would be better as a configurable prop or at module level.

**Recommendation:** Move to module level constant or make it a prop with default value.

#### m4. Search Input Missing aria-label
**Lines 347-353, 399-405, 451-457**
Search inputs inside SelectContent lack proper accessibility labels.

```typescript
<Input
  placeholder="Search districts..."
  // Missing: aria-label="Search districts"
/>
```

### Suggestions

#### S1. Consider Using React Query / TanStack Query
The component manages its own loading, error, and data states. TanStack Query would provide:
- Automatic caching
- Request deduplication
- Built-in loading/error states
- Background refetching

#### S2. Memoization for Filtered Lists
**Lines 211-226**
The filtering and slicing operations run on every render. Consider `useMemo`:

```typescript
const displayDistricts = useMemo(
  () => filteredDistricts.slice(0, MAX_VISIBLE_ITEMS),
  [filteredDistricts]
);
```

#### S3. Extract Common Select Pattern
The District, Block, and Village selectors share nearly identical structure. Consider extracting a `SearchableSelect` component to reduce duplication.

---

## 2. FPOSelector.tsx

### Overview
A selector component for FPOs (Farmer Producer Organizations) with search functionality. Includes two variants: full-featured `FPOSelector` and simplified `FPOSelectorSimple`.

### Critical Issues

**None identified.**

### Major Issues

#### M1. Code Duplication Between FPOSelector and FPOSelectorSimple
**Lines 45-208 vs 211-303**
Both components duplicate significant logic including:
- State management for fpos, search, loading
- The `loadFPOs` function
- Filtering logic

**Recommendation:** Extract shared logic into a custom hook:

```typescript
function useFPOData() {
  const [fpos, setFpos] = useState<FPO[]>([]);
  const [loading, setLoading] = useState(false);
  // ... shared logic
  return { fpos, loading, loadFPOs };
}
```

#### M2. Missing Error State UI
**Lines 87-100, 230-242**
Similar to LocationSelector, errors are logged but not displayed to users.

#### M3. No Cleanup for Async Operations
**Lines 62-64, 226-228**
useEffect with async call lacks cleanup mechanism.

```typescript
useEffect(() => {
  loadFPOs(); // No abort controller, no cleanup
}, []);
```

### Minor Issues

#### m1. Inconsistent Filtering Logic Between Variants
**Lines 69-83 vs 244-250**
`FPOSelector` filters on `name`, `nameLocal`, and `registrationNumber`, while `FPOSelectorSimple` only filters on `name` and `registrationNumber`. This inconsistency could confuse users.

#### m2. Type Assertion for API Response
**Lines 90, 233**
Same issue as LocationSelector - using `as` for type assertion.

```typescript
const response = await getFPOs({ limit: 200 }) as { success: boolean; data?: { fpos: FPO[] } };
```

#### m3. Hardcoded API Limit
**Lines 90, 233**
The limit of 200 is hardcoded. For large FPO lists, this may be insufficient.

```typescript
const response = await getFPOs({ limit: 200 })
```

**Recommendation:** Make this configurable or implement pagination/infinite scroll.

#### m4. Missing Type for Omit Usage
**Line 218**
The `Omit` utility is used correctly, but a named type would improve readability:

```typescript
type FPOSelectorSimpleProps = Omit<FPOSelectorProps, "onCreateNew" | "allowCreate">;
```

#### m5. Potential Null Reference in formatFpoLocation
**Lines 112-115**
The function assumes `fpo.village.block.district` exists if `fpo.village` exists. This could throw if the data structure is incomplete.

```typescript
const formatFpoLocation = (fpo: FPO) => {
  if (!fpo.village) return null;
  return `${fpo.village.name}, ${fpo.village.block.district.name}`;
  // Could throw if block or district is undefined
};
```

**Recommendation:** Add optional chaining:

```typescript
return `${fpo.village.name}, ${fpo.village?.block?.district?.name ?? 'Unknown'}`;
```

### Suggestions

#### S1. Consider Virtualization for Large Lists
With potentially hundreds of FPOs, consider using `react-virtual` or similar for better performance.

#### S2. Add Loading Skeleton
Instead of just showing a spinner, a skeleton loader would provide better UX.

#### S3. Support Controlled Search
Allow parent component to control the search value for use cases like pre-filtering.

---

## 3. CountrySelectorModal.tsx

### Overview
A modal dialog for selecting a country, typically shown when an admin first accesses the system. Uses context for state management.

### Critical Issues

**None identified.**

### Major Issues

**None identified.**

### Minor Issues

#### m1. Missing Keyboard Navigation for Country Selection
**Lines 66-86**
The country buttons are clickable but lack keyboard navigation support (arrow keys, etc.).

```typescript
<button
  key={country.id}
  onClick={() => setSelectedId(country.id)}
  // Missing: onKeyDown for arrow key navigation
```

**Recommendation:** Add keyboard navigation handler:

```typescript
onKeyDown={(e) => {
  if (e.key === 'ArrowDown') {
    // Move to next country
  } else if (e.key === 'ArrowUp') {
    // Move to previous country
  }
}}
```

#### m2. Missing Role and ARIA Attributes for Country List
**Lines 64-87**
The country selection grid should be marked as a listbox or radiogroup for screen readers.

```typescript
<div className="grid gap-2">
  // Should have: role="listbox" aria-label="Country selection"
```

Each button should have:
```typescript
role="option"
aria-selected={selectedId === country.id}
```

#### m3. No Error Handling for Missing Country in handleContinue
**Lines 24-29**
If `countries.find()` returns undefined (edge case), nothing happens. Should provide feedback.

```typescript
const handleContinue = () => {
  const country = countries.find((c) => c.id === selectedId);
  if (country) {
    setSelectedCountry(country);
  }
  // What if country is undefined? Silent failure
};
```

#### m4. Unused Import
**Line 1**
`useState` is imported but `useEffect` might be useful for focus management. Verify if all imports are necessary.

### Suggestions

#### S1. Auto-Focus First Country or Continue Button
For better accessibility, consider auto-focusing the first country option or the continue button after the modal opens.

```typescript
useEffect(() => {
  if (needsCountrySelection && countries.length > 0) {
    // Focus first country button
  }
}, [needsCountrySelection, countries]);
```

#### S2. Add Animation for Modal Entrance
Consider adding smooth entrance animation for better UX.

#### S3. Persist Selection Preference
Consider storing the last selected country in localStorage for returning users.

#### S4. Add Country Search for Many Countries
If the number of countries grows, consider adding a search/filter feature similar to the other selectors.

---

## 4. Summary and Recommendations

### Overall Code Quality Assessment

| Aspect | LocationSelector | FPOSelector | CountrySelectorModal |
|--------|------------------|-------------|---------------------|
| TypeScript Usage | Good | Good | Good |
| React Patterns | Good | Moderate | Good |
| Error Handling | Needs Work | Needs Work | Adequate |
| Accessibility | Needs Work | Needs Work | Needs Work |
| Reusability | Good | Moderate | Good |

### Priority Recommendations

1. **High Priority:**
   - Add user-facing error states for API failures across all components
   - Implement AbortController for async cleanup in useEffects
   - Fix accessibility issues (ARIA labels, keyboard navigation)

2. **Medium Priority:**
   - Extract shared FPO loading logic into a custom hook
   - Move type definitions to shared location
   - Replace type assertions with proper API typing

3. **Low Priority:**
   - Consider TanStack Query for data fetching
   - Add virtualization for large lists
   - Implement loading skeletons

### Positive Observations

- Clean component structure and separation of concerns
- Good use of TypeScript for prop definitions
- Thoughtful handling of large lists with search and pagination
- Consistent UI patterns across components
- Good use of composition (Label, Select, etc.)
- Proper use of controlled components

### Security Notes

- No security issues identified
- Components do not handle sensitive data directly
- API calls use proper abstraction layer
