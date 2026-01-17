// API base URL from environment variable (e.g., https://fc-marketplace-backend.up.railway.app)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_URL = API_BASE_URL ? `${API_BASE_URL}/api/v1` : null;

if (!API_URL) {
  console.error("VITE_API_BASE_URL environment variable is not set");
}

type ImportResult = {
  success: boolean;
  imported: number;
  failed: number;
  errors: string[];
};

// Generic fetch wrapper with authentication
// Uses httpOnly cookies for secure token storage (credentials: 'include')
async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options?.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // Send httpOnly cookies with request
  });

  // Handle 401 Unauthorized - redirect to login
  if (response.status === 401) {
    // Clear any stored user data (but not tokens - they're in httpOnly cookies)
    sessionStorage.removeItem("fc-admin-user");
    window.location.href = "/login";
    throw new Error("Session expired. Please log in again.");
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.error?.message || error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// Logout - calls backend to clear httpOnly cookies
export async function logoutAdmin(): Promise<void> {
  await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  sessionStorage.removeItem("fc-admin-user");
}

// Auth endpoints
export type LoginResponse = {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      name: string;
      email: string;
      type: string;
      adminRole?: string;
      countryId?: string;
      countryCode?: string;
      countryName?: string;
      stateId?: string;
      stateCode?: string;
      stateName?: string;
    };
  };
};

export async function loginAdmin(email: string, password: string): Promise<LoginResponse> {
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

// Bulk import endpoints
export async function importUsers(
  data: Record<string, string>[],
  userType: string,
  fpoId?: string
): Promise<ImportResult> {
  return apiFetch("/admin/import/users", {
    method: "POST",
    body: JSON.stringify({ data, userType, fpoId }),
  });
}

export async function importFPOs(data: Record<string, string>[]): Promise<ImportResult> {
  return apiFetch("/admin/import/fpos", {
    method: "POST",
    body: JSON.stringify({ data }),
  });
}

export async function importServiceProviders(data: Record<string, string>[]): Promise<ImportResult> {
  return apiFetch("/admin/import/service-providers", {
    method: "POST",
    body: JSON.stringify({ data }),
  });
}

export async function importBrands(data: Record<string, string>[]): Promise<ImportResult> {
  return apiFetch("/admin/import/brands", {
    method: "POST",
    body: JSON.stringify({ data }),
  });
}

export async function importProducts(data: Record<string, string>[]): Promise<ImportResult> {
  return apiFetch("/admin/import/products", {
    method: "POST",
    body: JSON.stringify({ data }),
  });
}

export async function importLocations(
  data: Record<string, string>[],
  locationType: "districts" | "blocks" | "villages"
): Promise<ImportResult> {
  return apiFetch(`/admin/import/locations/${locationType}`, {
    method: "POST",
    body: JSON.stringify({ data }),
  });
}

// CRUD operations - Users
export async function getUsers(params?: {
  type?: string;
  page?: number;
  limit?: number;
  // Country filter (for multi-country support)
  countryCode?: string;
  // Advanced filters
  stateCode?: string;
  districtId?: string;
  blockId?: string;
  villageId?: string;
  createdAfter?: string;
  createdBefore?: string;
  hasLocation?: boolean;
}, signal?: AbortSignal) {
  const query = new URLSearchParams();
  if (params?.type) query.set("type", params.type);
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  // Country filter
  if (params?.countryCode) query.set("countryCode", params.countryCode);
  // Advanced filters
  if (params?.stateCode) query.set("stateCode", params.stateCode);
  if (params?.districtId) query.set("districtId", params.districtId);
  if (params?.blockId) query.set("blockId", params.blockId);
  if (params?.villageId) query.set("villageId", params.villageId);
  if (params?.createdAfter) query.set("createdAfter", params.createdAfter);
  if (params?.createdBefore) query.set("createdBefore", params.createdBefore);
  if (params?.hasLocation !== undefined) query.set("hasLocation", String(params.hasLocation));
  return apiFetch(`/admin/users?${query}`, signal ? { signal } : undefined);
}

export async function getUser(id: string) {
  return apiFetch(`/admin/users/${id}`);
}

export async function createUser(data: {
  name: string;
  nameLocal?: string;
  phone?: string;
  email?: string;
  type: "farmer" | "partner" | "provider" | "admin";
  languageId?: string;
  villageId?: string;
  fpoId?: string;
  fpoRole?: string;
  // Admin-specific fields
  adminRole?: "super_admin" | "country_admin" | "state_admin";
  adminCountryId?: string;
  adminStateId?: string;
}) {
  return apiFetch("/admin/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateUser(id: string, data: Record<string, unknown>) {
  return apiFetch(`/admin/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteUser(id: string) {
  return apiFetch(`/admin/users/${id}`, { method: "DELETE" });
}

export async function bulkAssignUsers(params: {
  userIds: string[];
  fpoId?: string;
  fpoRole?: string;
  villageId?: string;
}) {
  return apiFetch("/admin/users/bulk-assign", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

// CRUD operations - FPOs
export async function getFPOs(params?: {
  page?: number;
  limit?: number;
  search?: string;
  // Country filter (for multi-country support)
  countryCode?: string;
  // Advanced filters
  stateCode?: string;
  districtId?: string;
  blockId?: string;
  villageId?: string;
  hasLocation?: boolean;
}) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.search) query.set("search", params.search);
  // Country filter
  if (params?.countryCode) query.set("countryCode", params.countryCode);
  // Advanced filters
  if (params?.stateCode) query.set("stateCode", params.stateCode);
  if (params?.districtId) query.set("districtId", params.districtId);
  if (params?.blockId) query.set("blockId", params.blockId);
  if (params?.villageId) query.set("villageId", params.villageId);
  if (params?.hasLocation !== undefined) query.set("hasLocation", String(params.hasLocation));
  return apiFetch(`/admin/fpos?${query}`);
}

export async function getFPO(id: string) {
  return apiFetch(`/admin/fpos/${id}`);
}

export async function createFPO(data: {
  name: string;
  nameLocal?: string;
  registrationNumber?: string;
  phone?: string;
  email?: string;
  address?: string;
  villageId?: string;
}) {
  return apiFetch("/admin/fpos", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateFPO(id: string, data: Record<string, unknown>) {
  return apiFetch(`/admin/fpos/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteFPO(id: string) {
  return apiFetch(`/admin/fpos/${id}`, { method: "DELETE" });
}

export async function getFPOMembers(fpoId: string, params?: { page?: number; limit?: number }) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  return apiFetch(`/admin/fpos/${fpoId}/members?${query}`);
}

export async function updateFPOMemberRole(fpoId: string, userId: string, role: string) {
  return apiFetch(`/admin/fpos/${fpoId}/members/${userId}`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}

export async function getServiceProviders(params?: { page?: number; limit?: number; countryCode?: string }) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.countryCode) query.set("countryCode", params.countryCode);
  return apiFetch(`/admin/service-providers?${query}`);
}

// Location data (for dropdowns)
export async function getStates(countryCode?: string) {
  const query = countryCode ? `?country=${countryCode}` : "";
  return apiFetch(`/admin/locations/states${query}`);
}

export async function getDistricts(stateCode: string) {
  return apiFetch(`/admin/locations/districts?state=${stateCode}`);
}

export async function getBlocks(districtId: string) {
  return apiFetch(`/admin/locations/blocks?district=${districtId}`);
}

export async function getVillages(blockId: string) {
  return apiFetch(`/admin/locations/villages?block=${blockId}`);
}

// Update location for entity
export async function updateUserLocation(userId: string, villageId: string) {
  return apiFetch(`/admin/users/${userId}/location`, {
    method: "PATCH",
    body: JSON.stringify({ villageId }),
  });
}

export async function updateFPOLocation(fpoId: string, villageId: string) {
  return apiFetch(`/admin/fpos/${fpoId}/location`, {
    method: "PATCH",
    body: JSON.stringify({ villageId }),
  });
}

// FPO membership
export async function addFPOMember(fpoId: string, userId: string, role: string) {
  return apiFetch(`/admin/fpos/${fpoId}/members`, {
    method: "POST",
    body: JSON.stringify({ userId, role }),
  });
}

export async function removeFPOMember(fpoId: string, userId: string) {
  return apiFetch(`/admin/fpos/${fpoId}/members/${userId}`, { method: "DELETE" });
}

// Export data
export async function exportData(dataType: string, format: "csv" | "json" = "csv") {
  const response = await fetch(`${API_URL}/admin/export/${dataType}?format=${format}`, {
    credentials: 'include', // Send httpOnly cookies with request
  });
  if (response.status === 401) {
    sessionStorage.removeItem("fc-admin-user");
    window.location.href = "/login";
    throw new Error("Session expired. Please log in again.");
  }
  if (!response.ok) throw new Error("Export failed");
  return response.blob();
}

// Location data status (pre-seeded from LGD)
export type LocationSyncStatus = {
  counts: {
    states: number;
    districts: number;
    blocks: number;
    villages: number;
  };
  withLgdCodes: {
    districts: number;
    blocks: number;
    villages: number;
  };
  sources: {
    data: string;
    method: string;
  };
};

export async function getLocationSyncStatus(): Promise<{ success: boolean; data: LocationSyncStatus }> {
  return apiFetch("/admin/location-sync/status");
}

// Countries
export async function getCountries(params?: { activeOnly?: boolean }) {
  const query = new URLSearchParams();
  if (params?.activeOnly) query.set("active", "true");
  const queryStr = query.toString() ? `?${query}` : "";
  return apiFetch(`/admin/locations/countries${queryStr}`);
}

// ============================================
// CRUD operations - Brands
// ============================================

export async function getBrands(params?: { page?: number; limit?: number; search?: string; countryCode?: string }) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.search) query.set("search", params.search);
  if (params?.countryCode) query.set("countryCode", params.countryCode);
  return apiFetch(`/admin/brands?${query}`);
}

export async function getBrand(id: string) {
  return apiFetch(`/admin/brands/${id}`);
}

export async function createBrand(data: {
  name: string;
  nameLocal?: string;
  logoUrl?: string;
  website?: string;
}) {
  return apiFetch("/admin/brands", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateBrand(id: string, data: {
  name?: string;
  nameLocal?: string;
  logoUrl?: string;
  website?: string;
  isActive?: boolean;
}) {
  return apiFetch(`/admin/brands/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteBrand(id: string) {
  return apiFetch(`/admin/brands/${id}`, { method: "DELETE" });
}

// ============================================
// CRUD operations - Products
// ============================================

export async function getProducts(params?: {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  brandId?: string;
  providerId?: string;
  countryCode?: string;
}) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.search) query.set("search", params.search);
  if (params?.categoryId) query.set("categoryId", params.categoryId);
  if (params?.brandId) query.set("brandId", params.brandId);
  if (params?.providerId) query.set("providerId", params.providerId);
  if (params?.countryCode) query.set("countryCode", params.countryCode);
  return apiFetch(`/admin/products?${query}`);
}

export async function getProduct(id: string) {
  return apiFetch(`/admin/products/${id}`);
}

export async function createProduct(data: {
  skuCode: string;
  name: string;
  nameLocal?: string;
  description?: string;
  descriptionLocal?: string;
  categoryId: string;
  brandId?: string;
  providerId: string;
  variety?: string;
  unitId: string;
  packSize?: string;
  mrp: number;
  sellingPrice?: number;
  discountPercent?: number;
  currencyId: string;
  imageUrl?: string;
  stockStatus?: string;
}) {
  return apiFetch("/admin/products", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateProduct(id: string, data: Record<string, unknown>) {
  return apiFetch(`/admin/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteProduct(id: string) {
  return apiFetch(`/admin/products/${id}`, { method: "DELETE" });
}

// ============================================
// Reference data (for dropdowns)
// ============================================

export async function getCategories() {
  return apiFetch("/admin/categories");
}

export async function getUnits() {
  return apiFetch("/admin/units");
}

export async function getCurrencies() {
  return apiFetch("/admin/currencies");
}

// ============================================
// FPO Documents
// ============================================

export type FpoDocument = {
  id: string;
  fpoId: string;
  name: string;
  type: string;
  description?: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
  uploadedBy?: string;
  uploader?: {
    id: string;
    name: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export async function getFpoDocuments(fpoId: string) {
  return apiFetch<{ success: boolean; data: FpoDocument[] }>(`/admin/fpos/${fpoId}/documents`);
}

export async function addFpoDocument(fpoId: string, data: {
  name: string;
  type: string;
  description?: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
}) {
  return apiFetch<{ success: boolean; data: FpoDocument }>(`/admin/fpos/${fpoId}/documents`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateFpoDocument(fpoId: string, docId: string, data: {
  name?: string;
  type?: string;
  description?: string;
  fileUrl?: string;
  isActive?: boolean;
}) {
  return apiFetch<{ success: boolean; data: FpoDocument }>(`/admin/fpos/${fpoId}/documents/${docId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteFpoDocument(fpoId: string, docId: string) {
  return apiFetch<{ success: boolean }>(`/admin/fpos/${fpoId}/documents/${docId}`, { method: "DELETE" });
}
