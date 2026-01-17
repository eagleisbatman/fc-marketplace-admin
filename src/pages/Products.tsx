import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Package, Plus, Loader2 } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import {
  ProductTable,
  ProductFilters,
  ProductPagination,
  CreateProductDialog,
  EditProductDialog,
  DeleteProductDialog,
} from "@/components/products";
import type { Product, ProductFormData } from "@/types/product.types";
import { initialProductFormState } from "@/types/product.types";

export function Products() {
  const {
    products,
    loading,
    refDataLoading,
    pagination,
    filters,
    hasActiveFilters,
    categories,
    brands,
    providers,
    units,
    currencies,
    loadProducts,
    handleCreateProduct,
    handleUpdateProduct,
    handleDeleteProduct,
    setCurrentPage,
    setPageSize,
    updateFilters,
    clearFilters,
  } = useProducts();

  // Dialog states
  const [showFilters, setShowFilters] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Form state
  const [formData, setFormData] = useState<ProductFormData>(initialProductFormState);
  const [saving, setSaving] = useState(false);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pagination.currentPage === 1) {
        loadProducts();
      } else {
        setCurrentPage(1);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [filters.search]);

  // Reset form
  const resetForm = () => {
    setFormData({
      ...initialProductFormState,
      currencyId: currencies[0]?.id || "",
    });
  };

  // Handlers
  const handleOpenEditDialog = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      skuCode: product.skuCode,
      name: product.name,
      nameLocal: product.nameLocal || "",
      description: product.description || "",
      descriptionLocal: product.descriptionLocal || "",
      categoryId: product.categoryId,
      brandId: product.brandId || "",
      providerId: product.providerId,
      variety: product.variety || "",
      unitId: product.unitId,
      packSize: product.packSize || "",
      mrp: String(product.mrp),
      sellingPrice: product.sellingPrice ? String(product.sellingPrice) : "",
      discountPercent: product.discountPercent
        ? String(product.discountPercent)
        : "",
      currencyId: product.currencyId,
      imageUrl: product.imageUrl || "",
      stockStatus: product.stockStatus,
    });
    setEditDialogOpen(true);
  };

  const handleOpenDeleteDialog = (product: Product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const handleSubmitCreate = async () => {
    setSaving(true);
    const success = await handleCreateProduct(formData);
    setSaving(false);
    if (success) {
      setCreateDialogOpen(false);
      resetForm();
      loadProducts();
    }
  };

  const handleSubmitEdit = async () => {
    if (!selectedProduct) return;
    setSaving(true);
    const success = await handleUpdateProduct(selectedProduct.id, formData);
    setSaving(false);
    if (success) {
      setEditDialogOpen(false);
      setSelectedProduct(null);
      resetForm();
      loadProducts();
    }
  };

  const handleSubmitDelete = async () => {
    if (!selectedProduct) return;
    setSaving(true);
    const success = await handleDeleteProduct(selectedProduct.id);
    setSaving(false);
    if (success) {
      setDeleteDialogOpen(false);
      setSelectedProduct(null);
      loadProducts();
    }
  };

  if (refDataLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage product catalog ({pagination.totalProducts} total)
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Product
        </Button>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Product Catalog
          </CardTitle>
          <CardDescription>
            View and manage all products in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <ProductFilters
            filters={filters}
            showFilters={showFilters}
            hasActiveFilters={hasActiveFilters}
            loading={loading}
            categories={categories}
            brands={brands}
            providers={providers}
            onShowFiltersChange={setShowFilters}
            onFiltersChange={updateFilters}
            onClearFilters={clearFilters}
            onRefresh={loadProducts}
          />

          {/* Table */}
          <ProductTable
            products={products}
            loading={loading}
            hasFilters={Boolean(filters.search || hasActiveFilters)}
            onEdit={handleOpenEditDialog}
            onDelete={handleOpenDeleteDialog}
          />

          {/* Pagination */}
          <ProductPagination
            pagination={pagination}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateProductDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        formData={formData}
        onFormChange={setFormData}
        onSubmit={handleSubmitCreate}
        saving={saving}
        categories={categories}
        brands={brands}
        providers={providers}
        units={units}
        currencies={currencies}
      />

      <EditProductDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        product={selectedProduct}
        formData={formData}
        onFormChange={setFormData}
        onSubmit={handleSubmitEdit}
        saving={saving}
        categories={categories}
        brands={brands}
        providers={providers}
        units={units}
        currencies={currencies}
      />

      <DeleteProductDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        product={selectedProduct}
        onConfirm={handleSubmitDelete}
        saving={saving}
      />
    </div>
  );
}
