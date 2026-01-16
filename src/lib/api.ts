// API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  console.error("VITE_API_URL environment variable is not set");
}

type ImportResult = {
  success: boolean;
  imported: number;
  failed: number;
  errors: string[];
};

// Get auth token from localStorage
function getAuthToken(): string | null {
  return localStorage.getItem("fc-admin-token");
}

// Generic fetch wrapper with authentication
async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = getAuthToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options?.headers,
  };

  // Add Authorization header if token exists
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized - clear token and redirect to login
  if (response.status === 401) {
    localStorage.removeItem("fc-admin-token");
    localStorage.removeItem("fc-admin-user");
    window.location.href = "/login";
    throw new Error("Session expired. Please log in again.");
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.error?.message || error.message || `HTTP ${response.status}`);
  }

  return response.json();
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
export async function importUsers(data: Record<string, string>[], userType: string): Promise<ImportResult> {
  return apiFetch("/admin/import/users", {
    method: "POST",
    body: JSON.stringify({ data, userType }),
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

// CRUD operations
export async function getUsers(params?: { type?: string; page?: number; limit?: number }) {
  const query = new URLSearchParams();
  if (params?.type) query.set("type", params.type);
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  return apiFetch(`/admin/users?${query}`);
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

export async function getFPOs(params?: { page?: number; limit?: number }) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  return apiFetch(`/admin/fpos?${query}`);
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
  const token = getAuthToken();
  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/admin/export/${dataType}?format=${format}`, { headers });
  if (response.status === 401) {
    localStorage.removeItem("fc-admin-token");
    localStorage.removeItem("fc-admin-user");
    window.location.href = "/login";
    throw new Error("Session expired. Please log in again.");
  }
  if (!response.ok) throw new Error("Export failed");
  return response.blob();
}

// Location Sync from India Data Portal
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
    districts: string;
    blocks: string;
    villages: string;
  };
};

export type SyncResult = {
  message: string;
  created: number;
  updated: number;
  skipped: number;
  totalProcessed?: number;
  errors: string[];
};

export async function getLocationSyncStatus(): Promise<{ success: boolean; data: LocationSyncStatus }> {
  return apiFetch("/admin/location-sync/status");
}

export async function syncDistricts(): Promise<{ success: boolean; data: SyncResult }> {
  return apiFetch("/admin/location-sync/districts", { method: "POST" });
}

export async function syncBlocks(): Promise<{ success: boolean; data: SyncResult }> {
  return apiFetch("/admin/location-sync/blocks", { method: "POST" });
}

export async function syncVillages(options?: { limit?: number; state?: string }): Promise<{ success: boolean; data: SyncResult }> {
  const params = new URLSearchParams();
  if (options?.limit) params.set("limit", String(options.limit));
  if (options?.state) params.set("state", options.state);
  const query = params.toString() ? `?${params}` : "";
  return apiFetch(`/admin/location-sync/villages${query}`, { method: "POST" });
}

// Countries
export async function getCountries(params?: { activeOnly?: boolean }) {
  const query = new URLSearchParams();
  if (params?.activeOnly) query.set("active", "true");
  const queryStr = query.toString() ? `?${query}` : "";
  return apiFetch(`/admin/locations/countries${queryStr}`);
}
