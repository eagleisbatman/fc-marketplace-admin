import { useState, useEffect, useCallback } from "react";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getBrands,
  getServiceProviders,
  getUnits,
  getCurrencies,
} from "@/lib/api";
import { toast } from "sonner";
import type {
  Product,
  Category,
  Brand,
  ServiceProvider,
  Unit,
  Currency,
  ProductFormData,
  ProductsResponse,
  ProductFilters,
  ProductPagination,
} from "@/types/product.types";

export function useProducts() {
  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Reference data
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [refDataLoading, setRefDataLoading] = useState(true);

  // Filters state
  const [filters, setFilters] = useState<ProductFilters>({
    search: "",
    categoryId: "",
    brandId: "",
    providerId: "",
  });

  // Pagination state
  const [pagination, setPagination] = useState<ProductPagination>({
    currentPage: 1,
    pageSize: 50,
    totalProducts: 0,
    totalPages: 0,
  });

  // Load reference data
  const loadReferenceData = useCallback(async () => {
    try {
      setRefDataLoading(true);
      const [catRes, brandRes, provRes, unitRes, currRes] = await Promise.all([
        getCategories() as Promise<{ success: boolean; data?: Category[] }>,
        getBrands({ limit: 500 }) as Promise<{
          success: boolean;
          data?: { brands: Brand[] };
        }>,
        getServiceProviders({ limit: 500 }) as Promise<{
          success: boolean;
          data?: { providers: ServiceProvider[] };
        }>,
        getUnits() as Promise<{ success: boolean; data?: Unit[] }>,
        getCurrencies() as Promise<{ success: boolean; data?: Currency[] }>,
      ]);

      if (catRes.success && catRes.data) setCategories(catRes.data);
      if (brandRes.success && brandRes.data) setBrands(brandRes.data.brands);
      if (provRes.success && provRes.data) setProviders(provRes.data.providers);
      if (unitRes.success && unitRes.data) setUnits(unitRes.data);
      if (currRes.success && currRes.data) setCurrencies(currRes.data);
    } catch (err) {
      console.error("Failed to load reference data:", err);
      toast.error("Failed to load reference data");
    } finally {
      setRefDataLoading(false);
    }
  }, []);

  // Load products
  const loadProducts = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      const response = (await getProducts({
        page: pagination.currentPage,
        limit: pagination.pageSize,
        search: filters.search || undefined,
        categoryId: filters.categoryId || undefined,
        brandId: filters.brandId || undefined,
        providerId: filters.providerId || undefined,
      }, signal)) as ProductsResponse;

      if (signal?.aborted) return;

      if (response.success && response.data) {
        setProducts(response.data.products);
        setPagination((prev) => ({
          ...prev,
          totalProducts: response.data?.pagination.total || 0,
          totalPages: response.data?.pagination.pages || 0,
        }));
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      console.error("Failed to load products:", err);
      toast.error("Failed to load products");
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [pagination.currentPage, pagination.pageSize, filters]);

  // Create product
  const handleCreateProduct = useCallback(
    async (formData: ProductFormData): Promise<boolean> => {
      if (
        !formData.skuCode ||
        !formData.name ||
        !formData.categoryId ||
        !formData.providerId ||
        !formData.unitId ||
        !formData.mrp ||
        !formData.currencyId
      ) {
        toast.error("Please fill all required fields");
        return false;
      }

      try {
        const response = (await createProduct({
          skuCode: formData.skuCode,
          name: formData.name,
          nameLocal: formData.nameLocal || undefined,
          description: formData.description || undefined,
          descriptionLocal: formData.descriptionLocal || undefined,
          categoryId: formData.categoryId,
          brandId: formData.brandId || undefined,
          providerId: formData.providerId,
          variety: formData.variety || undefined,
          unitId: formData.unitId,
          packSize: formData.packSize || undefined,
          mrp: parseFloat(formData.mrp),
          sellingPrice: formData.sellingPrice
            ? parseFloat(formData.sellingPrice)
            : undefined,
          discountPercent: formData.discountPercent
            ? parseFloat(formData.discountPercent)
            : undefined,
          currencyId: formData.currencyId,
          imageUrl: formData.imageUrl || undefined,
          stockStatus: formData.stockStatus,
        })) as { success: boolean };

        if (response.success) {
          toast.success("Product created successfully");
          return true;
        }
        return false;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to create product"
        );
        return false;
      }
    },
    []
  );

  // Update product
  const handleUpdateProduct = useCallback(
    async (productId: string, formData: ProductFormData): Promise<boolean> => {
      if (!formData.skuCode || !formData.name) {
        toast.error("Please fill all required fields");
        return false;
      }

      try {
        const response = (await updateProduct(productId, {
          skuCode: formData.skuCode,
          name: formData.name,
          nameLocal: formData.nameLocal || null,
          description: formData.description || null,
          descriptionLocal: formData.descriptionLocal || null,
          categoryId: formData.categoryId,
          brandId: formData.brandId || null,
          providerId: formData.providerId,
          variety: formData.variety || null,
          unitId: formData.unitId,
          packSize: formData.packSize || null,
          mrp: parseFloat(formData.mrp),
          sellingPrice: formData.sellingPrice
            ? parseFloat(formData.sellingPrice)
            : null,
          discountPercent: formData.discountPercent
            ? parseFloat(formData.discountPercent)
            : null,
          currencyId: formData.currencyId,
          imageUrl: formData.imageUrl || null,
          stockStatus: formData.stockStatus,
        })) as { success: boolean };

        if (response.success) {
          toast.success("Product updated successfully");
          return true;
        }
        return false;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to update product"
        );
        return false;
      }
    },
    []
  );

  // Delete product
  const handleDeleteProduct = useCallback(
    async (productId: string): Promise<boolean> => {
      try {
        const response = (await deleteProduct(productId)) as {
          success: boolean;
        };

        if (response.success) {
          toast.success("Product deleted successfully");
          return true;
        }
        return false;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to delete product"
        );
        return false;
      }
    },
    []
  );

  // Pagination handlers
  const setCurrentPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  }, []);

  const setPageSize = useCallback((size: number) => {
    setPagination((prev) => ({ ...prev, pageSize: size, currentPage: 1 }));
  }, []);

  // Filter handlers
  const updateFilters = useCallback((newFilters: Partial<ProductFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: "",
      categoryId: "",
      brandId: "",
      providerId: "",
    });
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, []);

  // Check if any filters are active
  const hasActiveFilters = Boolean(
    filters.categoryId || filters.brandId || filters.providerId
  );

  // Load reference data on mount
  useEffect(() => {
    loadReferenceData();
  }, [loadReferenceData]);

  // Load products when dependencies change
  useEffect(() => {
    if (!refDataLoading) {
      const controller = new AbortController();
      loadProducts(controller.signal);
      return () => controller.abort();
    }
  }, [loadProducts, refDataLoading]);

  return {
    // Data
    products,
    loading,
    refDataLoading,
    pagination,
    filters,
    hasActiveFilters,

    // Reference data
    categories,
    brands,
    providers,
    units,
    currencies,

    // Actions
    loadProducts,
    handleCreateProduct,
    handleUpdateProduct,
    handleDeleteProduct,
    setCurrentPage,
    setPageSize,
    updateFilters,
    clearFilters,
  };
}
