import { useState, useEffect, useCallback } from "react";
import { getBrands, createBrand, updateBrand, deleteBrand } from "@/lib/api";
import { toast } from "sonner";
import type {
  Brand,
  BrandsResponse,
  BrandFormData,
  BrandPagination,
} from "@/types/brand.types";

export function useBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalBrands, setTotalBrands] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const pagination: BrandPagination = {
    currentPage,
    pageSize,
    totalBrands,
    totalPages,
  };

  const loadBrands = useCallback(async () => {
    try {
      setLoading(true);
      const response = (await getBrands({
        page: currentPage,
        limit: pageSize,
        search: search || undefined,
      })) as BrandsResponse;

      if (response.success && response.data) {
        setBrands(response.data.brands);
        setTotalBrands(response.data.pagination.total);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (err) {
      console.error("Failed to load brands:", err);
      toast.error("Failed to load brands");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, search]);

  useEffect(() => {
    loadBrands();
  }, [loadBrands]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        loadBrands();
      } else {
        setCurrentPage(1);
      }
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleCreateBrand = useCallback(
    async (formData: BrandFormData): Promise<boolean> => {
      if (!formData.name.trim()) {
        toast.error("Name is required");
        return false;
      }

      try {
        const response = (await createBrand({
          name: formData.name,
          nameLocal: formData.nameLocal || undefined,
          logoUrl: formData.logoUrl || undefined,
          website: formData.website || undefined,
        })) as { success: boolean };

        if (response.success) {
          toast.success("Brand created successfully");
          return true;
        }
        return false;
      } catch (err) {
        console.error("Failed to create brand:", err);
        toast.error(
          err instanceof Error ? err.message : "Failed to create brand"
        );
        return false;
      }
    },
    []
  );

  const handleUpdateBrand = useCallback(
    async (brandId: string, formData: BrandFormData): Promise<boolean> => {
      if (!formData.name.trim()) {
        toast.error("Name is required");
        return false;
      }

      try {
        const response = (await updateBrand(brandId, {
          name: formData.name,
          nameLocal: formData.nameLocal || undefined,
          logoUrl: formData.logoUrl || undefined,
          website: formData.website || undefined,
        })) as { success: boolean };

        if (response.success) {
          toast.success("Brand updated successfully");
          return true;
        }
        return false;
      } catch (err) {
        console.error("Failed to update brand:", err);
        toast.error(
          err instanceof Error ? err.message : "Failed to update brand"
        );
        return false;
      }
    },
    []
  );

  const handleDeleteBrand = useCallback(
    async (brandId: string): Promise<boolean> => {
      try {
        const response = (await deleteBrand(brandId)) as { success: boolean };

        if (response.success) {
          toast.success("Brand deleted successfully");
          return true;
        }
        return false;
      } catch (err) {
        console.error("Failed to delete brand:", err);
        toast.error(
          err instanceof Error ? err.message : "Failed to delete brand"
        );
        return false;
      }
    },
    []
  );

  return {
    brands,
    loading,
    search,
    pagination,
    loadBrands,
    setSearch,
    setCurrentPage,
    setPageSize,
    handleCreateBrand,
    handleUpdateBrand,
    handleDeleteBrand,
  };
}
