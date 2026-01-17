import { useState, useEffect, useCallback, useRef } from "react";
import {
  getFPOs,
  createFPO,
  updateFPO,
  deleteFPO,
  updateFPOLocation,
  getFPOMembers,
  addFPOMember,
  removeFPOMember,
  updateFPOMemberRole,
  getUsers,
  getFpoDocuments,
  addFpoDocument,
  deleteFpoDocument,
} from "@/lib/api";
import type { FpoDocument } from "@/lib/api";
import { useAdmin } from "@/contexts/AdminContext";
import { toast } from "sonner";
import type {
  FPO,
  FPOMember,
  FarmerUser,
  CreateFPOForm,
  FPOFilters,
  FPOPagination,
  DocumentForm,
} from "@/types/fpo.types";

export function useFPOs() {
  const { selectedCountry } = useAdmin();

  // FPO list state
  const [fpos, setFpos] = useState<FPO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [pagination, setPagination] = useState<FPOPagination>({
    currentPage: 1,
    pageSize: 50,
    totalFpos: 0,
    totalPages: 0,
  });

  // Filters state
  const [filters, setFilters] = useState<FPOFilters>({
    search: "",
    location: {},
    hasLocation: "all",
  });

  // Expanded FPO state
  const [expandedFpoId, setExpandedFpoId] = useState<string | null>(null);
  const [membersLoading, setMembersLoading] = useState(false);
  const [members, setMembers] = useState<FPOMember[]>([]);

  // Ref to track the current expanded FPO to prevent race conditions
  const currentExpandedFpoRef = useRef<string | null>(null);

  // Documents state
  const [documents, setDocuments] = useState<FpoDocument[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);

  // Available farmers for adding to FPO
  const [availableFarmers, setAvailableFarmers] = useState<FarmerUser[]>([]);
  const [farmersLoading, setFarmersLoading] = useState(false);

  // Load FPOs
  const loadFPOs = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);
      const params: {
        page: number;
        limit: number;
        search?: string;
        countryCode?: string;
        stateCode?: string;
        districtId?: string;
        blockId?: string;
        villageId?: string;
        hasLocation?: boolean;
      } = {
        page: pagination.currentPage,
        limit: pagination.pageSize,
      };

      if (filters.search) params.search = filters.search;
      if (selectedCountry?.code) params.countryCode = selectedCountry.code;
      if (filters.location.stateCode) params.stateCode = filters.location.stateCode;
      if (filters.location.districtId) params.districtId = filters.location.districtId;
      if (filters.location.blockId) params.blockId = filters.location.blockId;
      if (filters.location.villageId) params.villageId = filters.location.villageId;
      if (filters.hasLocation === "yes") params.hasLocation = true;
      if (filters.hasLocation === "no") params.hasLocation = false;

      const response = (await getFPOs(params, signal)) as {
        success: boolean;
        data?: {
          fpos: FPO[];
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
        setFpos(response.data.fpos || []);
        setPagination((prev) => ({
          ...prev,
          totalFpos: response.data?.pagination?.total || 0,
          totalPages: response.data?.pagination?.pages || 1,
        }));
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Failed to load FPOs");
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [pagination.currentPage, pagination.pageSize, filters, selectedCountry?.code]);

  // Load members for an FPO
  const loadMembers = useCallback(async (fpoId: string) => {
    try {
      setMembersLoading(true);
      const response = (await getFPOMembers(fpoId, { limit: 100 })) as {
        success: boolean;
        data?: { members: FPOMember[] };
      };
      // Only update state if this FPO is still the expanded one (race condition fix)
      if (currentExpandedFpoRef.current === fpoId && response.success && response.data) {
        setMembers(response.data.members || []);
      }
    } catch (err) {
      console.error("Failed to load members:", err);
      if (currentExpandedFpoRef.current === fpoId) {
        toast.error("Failed to load FPO members");
      }
    } finally {
      if (currentExpandedFpoRef.current === fpoId) {
        setMembersLoading(false);
      }
    }
  }, []);

  // Load documents for an FPO
  const loadDocuments = useCallback(async (fpoId: string) => {
    try {
      setDocumentsLoading(true);
      const response = await getFpoDocuments(fpoId);
      // Only update state if this FPO is still the expanded one (race condition fix)
      if (currentExpandedFpoRef.current === fpoId && response.success && response.data) {
        setDocuments(response.data);
      }
    } catch (err) {
      console.error("Failed to load documents:", err);
      if (currentExpandedFpoRef.current === fpoId) {
        toast.error("Failed to load FPO documents");
      }
    } finally {
      if (currentExpandedFpoRef.current === fpoId) {
        setDocumentsLoading(false);
      }
    }
  }, []);

  // Load available farmers
  const loadAvailableFarmers = useCallback(async () => {
    try {
      setFarmersLoading(true);
      const response = (await getUsers({ type: "farmer", limit: 200 })) as {
        success: boolean;
        data?: { users: FarmerUser[] };
      };
      if (response.success && response.data) {
        setAvailableFarmers(response.data.users || []);
      }
    } catch (err) {
      console.error("Failed to load farmers:", err);
    } finally {
      setFarmersLoading(false);
    }
  }, []);

  // Toggle expand FPO
  const toggleExpand = useCallback(
    async (fpoId: string) => {
      if (expandedFpoId === fpoId) {
        // Collapsing the current FPO
        currentExpandedFpoRef.current = null;
        setExpandedFpoId(null);
        setMembers([]);
        setDocuments([]);
      } else {
        // Expanding a new FPO - update ref BEFORE state to prevent race conditions
        currentExpandedFpoRef.current = fpoId;
        setExpandedFpoId(fpoId);
        // Clear previous data immediately
        setMembers([]);
        setDocuments([]);
        // Load new data
        await Promise.all([loadMembers(fpoId), loadDocuments(fpoId)]);
      }
    },
    [expandedFpoId, loadMembers, loadDocuments]
  );

  // Create FPO
  const handleCreateFPO = useCallback(
    async (formData: CreateFPOForm): Promise<boolean> => {
      if (!formData.name) {
        toast.error("Name is required");
        return false;
      }

      try {
        await createFPO({
          name: formData.name,
          nameLocal: formData.nameLocal || undefined,
          registrationNumber: formData.registrationNumber || undefined,
          phone: formData.phone || undefined,
          email: formData.email || undefined,
          address: formData.address || undefined,
          villageId: formData.location.villageId,
        });
        toast.success("FPO created successfully");
        return true;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to create FPO");
        return false;
      }
    },
    []
  );

  // Update FPO
  const handleUpdateFPO = useCallback(
    async (fpoId: string, formData: CreateFPOForm): Promise<boolean> => {
      try {
        await updateFPO(fpoId, {
          name: formData.name,
          nameLocal: formData.nameLocal || null,
          registrationNumber: formData.registrationNumber || null,
          phone: formData.phone || null,
          email: formData.email || null,
          address: formData.address || null,
        });
        toast.success("FPO updated successfully");
        return true;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to update FPO");
        return false;
      }
    },
    []
  );

  // Delete FPO
  const handleDeleteFPO = useCallback(async (fpoId: string): Promise<boolean> => {
    try {
      await deleteFPO(fpoId);
      toast.success("FPO deleted successfully");
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete FPO");
      return false;
    }
  }, []);

  // Update FPO location
  const handleUpdateLocation = useCallback(
    async (fpoId: string, villageId: string): Promise<boolean> => {
      try {
        await updateFPOLocation(fpoId, villageId);
        toast.success("Location updated successfully");
        return true;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to update location");
        return false;
      }
    },
    []
  );

  // Add member to FPO
  const handleAddMember = useCallback(
    async (fpoId: string, userId: string, role: string): Promise<boolean> => {
      try {
        await addFPOMember(fpoId, userId, role);
        toast.success("Member added successfully");
        return true;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to add member");
        return false;
      }
    },
    []
  );

  // Remove member from FPO
  const handleRemoveMember = useCallback(
    async (fpoId: string, userId: string): Promise<boolean> => {
      try {
        await removeFPOMember(fpoId, userId);
        toast.success("Member removed successfully");
        return true;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to remove member");
        return false;
      }
    },
    []
  );

  // Change member role
  const handleChangeRole = useCallback(
    async (fpoId: string, userId: string, newRole: string): Promise<boolean> => {
      try {
        await updateFPOMemberRole(fpoId, userId, newRole);
        toast.success("Role updated successfully");
        return true;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to update role");
        return false;
      }
    },
    []
  );

  // Add document
  const handleAddDocument = useCallback(
    async (fpoId: string, documentData: DocumentForm): Promise<boolean> => {
      if (!documentData.name || !documentData.fileUrl) {
        toast.error("Name and File URL are required");
        return false;
      }

      try {
        await addFpoDocument(fpoId, {
          name: documentData.name,
          type: documentData.type,
          description: documentData.description || undefined,
          fileUrl: documentData.fileUrl,
        });
        toast.success("Document added successfully");
        return true;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to add document");
        return false;
      }
    },
    []
  );

  // Delete document
  const handleDeleteDocument = useCallback(
    async (fpoId: string, documentId: string): Promise<boolean> => {
      try {
        await deleteFpoDocument(fpoId, documentId);
        toast.success("Document deleted successfully");
        return true;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to delete document");
        return false;
      }
    },
    []
  );

  // Pagination handlers
  const setCurrentPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
    currentExpandedFpoRef.current = null;
    setExpandedFpoId(null);
  }, []);

  const setPageSize = useCallback((size: number) => {
    setPagination((prev) => ({ ...prev, pageSize: size, currentPage: 1 }));
    currentExpandedFpoRef.current = null;
    setExpandedFpoId(null);
  }, []);

  // Filter handlers
  const updateFilters = useCallback((newFilters: Partial<FPOFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: "",
      location: {},
      hasLocation: "all",
    });
  }, []);

  // Check if any advanced filters are active
  const hasActiveFilters = Boolean(
    filters.location.stateCode ||
    filters.location.districtId ||
    filters.location.blockId ||
    filters.location.villageId ||
    filters.hasLocation !== "all"
  );

  // Load FPOs when dependencies change
  useEffect(() => {
    const controller = new AbortController();
    loadFPOs(controller.signal);
    return () => controller.abort();
  }, [loadFPOs]);

  // Clear all state when country changes
  useEffect(() => {
    setFpos([]);
    setMembers([]);
    setDocuments([]);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    currentExpandedFpoRef.current = null;
    setExpandedFpoId(null);
    setFilters({
      search: "",
      location: {},
      hasLocation: "all",
    });
  }, [selectedCountry?.id]);

  // Wrapped setter that also updates the ref (for external use)
  const setExpandedFpoIdWithRef = useCallback((id: string | null) => {
    currentExpandedFpoRef.current = id;
    setExpandedFpoId(id);
    if (id === null) {
      setMembers([]);
      setDocuments([]);
    }
  }, []);

  return {
    // Data
    fpos,
    loading,
    error,
    pagination,
    filters,
    hasActiveFilters,
    expandedFpoId,
    members,
    membersLoading,
    documents,
    documentsLoading,
    availableFarmers,
    farmersLoading,

    // Actions
    loadFPOs,
    loadMembers,
    loadDocuments,
    loadAvailableFarmers,
    toggleExpand,
    handleCreateFPO,
    handleUpdateFPO,
    handleDeleteFPO,
    handleUpdateLocation,
    handleAddMember,
    handleRemoveMember,
    handleChangeRole,
    handleAddDocument,
    handleDeleteDocument,
    setCurrentPage,
    setPageSize,
    updateFilters,
    clearFilters,
    setExpandedFpoId: setExpandedFpoIdWithRef,
  };
}
