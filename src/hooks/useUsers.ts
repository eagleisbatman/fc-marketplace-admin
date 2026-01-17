import { useState, useEffect, useCallback } from "react";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  bulkAssignUsers,
  updateUserLocation,
  getCountries,
  getStates,
} from "@/lib/api";
import { useAdmin } from "@/contexts/AdminContext";
import { toast } from "sonner";
import type {
  User,
  Country,
  State,
  CreateUserForm,
  UserFilters,
  UserPagination,
} from "@/types/user.types";

export function useUsers() {
  const { selectedCountry } = useAdmin();

  // User list state
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [pagination, setPagination] = useState<UserPagination>({
    currentPage: 1,
    pageSize: 50,
    totalUsers: 0,
    totalPages: 0,
  });

  // Filters state
  const [filters, setFilters] = useState<UserFilters>({
    userType: "all",
    search: "",
    filterLocation: {},
    filterDateFrom: "",
    filterDateTo: "",
    filterHasLocation: "all",
  });

  // Selection state
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  // Reference data for admin creation
  const [countries, setCountries] = useState<Country[]>([]);
  const [adminStates, setAdminStates] = useState<State[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingAdminStates, setLoadingAdminStates] = useState(false);

  // Load users
  const loadUsers = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);

      const params: {
        type?: string;
        page: number;
        limit: number;
        countryCode?: string;
        stateCode?: string;
        districtId?: string;
        blockId?: string;
        villageId?: string;
        createdAfter?: string;
        createdBefore?: string;
        hasLocation?: boolean;
      } = {
        page: pagination.currentPage,
        limit: pagination.pageSize,
      };

      if (filters.userType !== "all") {
        params.type = filters.userType;
      }

      if (selectedCountry?.code) {
        params.countryCode = selectedCountry.code;
      }

      if (filters.filterLocation.stateCode) params.stateCode = filters.filterLocation.stateCode;
      if (filters.filterLocation.districtId) params.districtId = filters.filterLocation.districtId;
      if (filters.filterLocation.blockId) params.blockId = filters.filterLocation.blockId;
      if (filters.filterLocation.villageId) params.villageId = filters.filterLocation.villageId;
      if (filters.filterDateFrom) params.createdAfter = filters.filterDateFrom;
      if (filters.filterDateTo) params.createdBefore = filters.filterDateTo;
      if (filters.filterHasLocation === "yes") params.hasLocation = true;
      if (filters.filterHasLocation === "no") params.hasLocation = false;

      const response = await getUsers(params, signal) as {
        success: boolean;
        data?: {
          users: User[];
          pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
          };
        };
      };

      if (signal?.aborted) return;

      if (response.success && response.data) {
        setUsers(response.data.users || []);
        setPagination((prev) => ({
          ...prev,
          totalUsers: response.data?.pagination?.total || 0,
          totalPages: response.data?.pagination?.pages || 1,
        }));
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [pagination.currentPage, pagination.pageSize, filters, selectedCountry?.code]);

  // Load countries for admin creation
  const loadCountries = useCallback(async () => {
    try {
      setLoadingCountries(true);
      const response = await getCountries({ activeOnly: true }) as {
        success: boolean;
        data?: Country[];
      };
      if (response.success && response.data) {
        setCountries(response.data);
      }
    } catch (err) {
      console.error("Failed to load countries:", err);
    } finally {
      setLoadingCountries(false);
    }
  }, []);

  // Load states for admin creation
  const loadAdminStates = useCallback(async (countryCode: string) => {
    try {
      setLoadingAdminStates(true);
      const response = await getStates(countryCode) as {
        success: boolean;
        data?: State[];
      };
      if (response.success && response.data) {
        setAdminStates(response.data);
      }
    } catch (err) {
      console.error("Failed to load states:", err);
    } finally {
      setLoadingAdminStates(false);
    }
  }, []);

  // Create user
  const handleCreateUser = useCallback(async (formData: CreateUserForm): Promise<boolean> => {
    if (!formData.name) {
      toast.error("Name is required");
      return false;
    }

    if (formData.type === "admin") {
      if (!formData.adminRole) {
        toast.error("Admin role is required");
        return false;
      }
      if (formData.adminRole === "country_admin" && !formData.adminCountryId) {
        toast.error("Country is required for Country Admin");
        return false;
      }
      if (formData.adminRole === "state_admin" && !formData.adminStateId) {
        toast.error("State is required for State Admin");
        return false;
      }
    }

    try {
      await createUser({
        name: formData.name,
        nameLocal: formData.nameLocal || undefined,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        type: formData.type,
        villageId: formData.location.villageId,
        fpoId: formData.type === "farmer" ? formData.fpoId : undefined,
        fpoRole: formData.type === "farmer" ? formData.fpoRole : undefined,
        adminRole: formData.type === "admin" ? formData.adminRole : undefined,
        adminCountryId:
          formData.type === "admin" && formData.adminRole !== "super_admin"
            ? formData.adminCountryId
            : undefined,
        adminStateId:
          formData.type === "admin" && formData.adminRole === "state_admin"
            ? formData.adminStateId
            : undefined,
      });
      toast.success("User created successfully");
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create user");
      return false;
    }
  }, []);

  // Update user
  const handleUpdateUser = useCallback(async (userId: string, formData: CreateUserForm, userType: string): Promise<boolean> => {
    if (userType === "admin") {
      if (!formData.adminRole) {
        toast.error("Admin role is required");
        return false;
      }
      if (formData.adminRole === "country_admin" && !formData.adminCountryId) {
        toast.error("Country is required for Country Admin");
        return false;
      }
      if (formData.adminRole === "state_admin" && !formData.adminStateId) {
        toast.error("State is required for State Admin");
        return false;
      }
    }

    try {
      const updateData: Record<string, unknown> = {
        name: formData.name,
        nameLocal: formData.nameLocal || null,
        phone: formData.phone || null,
        email: formData.email || null,
      };

      if (userType === "admin") {
        updateData.adminRole = formData.adminRole;
        updateData.adminCountryId =
          formData.adminRole !== "super_admin" ? formData.adminCountryId : null;
        updateData.adminStateId =
          formData.adminRole === "state_admin" ? formData.adminStateId : null;
      }

      await updateUser(userId, updateData);
      toast.success("User updated successfully");
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update user");
      return false;
    }
  }, []);

  // Delete user
  const handleDeleteUser = useCallback(async (userId: string): Promise<boolean> => {
    try {
      await deleteUser(userId);
      toast.success("User deleted successfully");
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete user");
      return false;
    }
  }, []);

  // Update user location
  const handleUpdateLocation = useCallback(async (userId: string, villageId: string): Promise<boolean> => {
    try {
      await updateUserLocation(userId, villageId);
      toast.success("Location updated successfully");
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update location");
      return false;
    }
  }, []);

  // Bulk assign to FPO
  const handleBulkAssignFpo = useCallback(async (userIds: string[], fpoId: string, fpoRole: string): Promise<boolean> => {
    try {
      const result = await bulkAssignUsers({ userIds, fpoId, fpoRole }) as {
        success: boolean;
        data?: { updated: number; failed: number };
      };

      if (result.success && result.data) {
        toast.success(`${result.data.updated} users assigned to FPO`);
        if (result.data.failed > 0) {
          toast.warning(`${result.data.failed} users could not be assigned`);
        }
      }
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to assign users to FPO");
      return false;
    }
  }, []);

  // Bulk assign location
  const handleBulkAssignLocation = useCallback(async (userIds: string[], villageId: string): Promise<boolean> => {
    try {
      const result = await bulkAssignUsers({ userIds, villageId }) as {
        success: boolean;
        data?: { updated: number; failed: number };
      };

      if (result.success && result.data) {
        toast.success(`${result.data.updated} users location updated`);
        if (result.data.failed > 0) {
          toast.warning(`${result.data.failed} users could not be updated`);
        }
      }
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update locations");
      return false;
    }
  }, []);

  // Bulk delete
  const handleBulkDelete = useCallback(async (userIds: string[]): Promise<boolean> => {
    try {
      let successCount = 0;
      let failCount = 0;

      for (const userId of userIds) {
        try {
          await deleteUser(userId);
          successCount++;
        } catch {
          failCount++;
        }
      }

      toast.success(`${successCount} users deleted`);
      if (failCount > 0) {
        toast.warning(`${failCount} users could not be deleted`);
      }
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete users");
      return false;
    }
  }, []);

  // Selection handlers
  const toggleUserSelection = useCallback((userId: string) => {
    setSelectedUsers((prev) => {
      const newSelection = new Set(prev);
      if (newSelection.has(userId)) {
        newSelection.delete(userId);
      } else {
        newSelection.add(userId);
      }
      return newSelection;
    });
  }, []);

  const toggleAllSelection = useCallback((userIds: string[]) => {
    setSelectedUsers((prev) => {
      if (prev.size === userIds.length) {
        return new Set();
      }
      return new Set(userIds);
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedUsers(new Set());
  }, []);

  // Pagination handlers
  const setCurrentPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  }, []);

  const setPageSize = useCallback((size: number) => {
    setPagination((prev) => ({ ...prev, pageSize: size, currentPage: 1 }));
  }, []);

  // Filter handlers
  const updateFilters = useCallback((updates: Partial<UserFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      userType: "all",
      search: "",
      filterLocation: {},
      filterDateFrom: "",
      filterDateTo: "",
      filterHasLocation: "all",
    });
  }, []);

  // Effects
  useEffect(() => {
    const controller = new AbortController();
    loadUsers(controller.signal);
    return () => controller.abort();
  }, [loadUsers]);

  // Reset page on filter change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    setSelectedUsers(new Set());
  }, [filters.userType, filters.filterLocation, filters.filterDateFrom, filters.filterDateTo, filters.filterHasLocation]);

  // Clear selection on page change
  useEffect(() => {
    setSelectedUsers(new Set());
  }, [pagination.currentPage]);

  // Clear state on country change
  useEffect(() => {
    setUsers([]);
    setSelectedUsers(new Set());
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    setFilters({
      userType: "all",
      search: "",
      filterLocation: {},
      filterDateFrom: "",
      filterDateTo: "",
      filterHasLocation: "all",
    });
  }, [selectedCountry?.id]);

  return {
    // Data
    users,
    loading,
    error,
    pagination,
    filters,
    selectedUsers,
    countries,
    adminStates,
    loadingCountries,
    loadingAdminStates,

    // Actions
    loadUsers,
    loadCountries,
    loadAdminStates,
    handleCreateUser,
    handleUpdateUser,
    handleDeleteUser,
    handleUpdateLocation,
    handleBulkAssignFpo,
    handleBulkAssignLocation,
    handleBulkDelete,

    // Selection
    toggleUserSelection,
    toggleAllSelection,
    clearSelection,

    // Pagination
    setCurrentPage,
    setPageSize,

    // Filters
    updateFilters,
    clearFilters,
    setAdminStates,
  };
}
