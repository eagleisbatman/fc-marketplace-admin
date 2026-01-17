import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tag, Plus, Search, RefreshCw } from "lucide-react";
import { useBrands } from "@/hooks/useBrands";
import {
  BrandTable,
  BrandPagination,
  CreateBrandDialog,
  EditBrandDialog,
  DeleteBrandDialog,
} from "@/components/brands";
import type { Brand, BrandFormData } from "@/types/brand.types";
import { initialBrandFormState } from "@/types/brand.types";

export function Brands() {
  const {
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
  } = useBrands();

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

  // Form states
  const [formData, setFormData] = useState<BrandFormData>(initialBrandFormState);
  const [formLoading, setFormLoading] = useState(false);

  const resetForm = () => {
    setFormData(initialBrandFormState);
  };

  const openEditDialog = (brand: Brand) => {
    setSelectedBrand(brand);
    setFormData({
      name: brand.name,
      nameLocal: brand.nameLocal || "",
      logoUrl: brand.logoUrl || "",
      website: brand.website || "",
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (brand: Brand) => {
    setSelectedBrand(brand);
    setDeleteDialogOpen(true);
  };

  const handleSubmitCreate = async () => {
    setFormLoading(true);
    const success = await handleCreateBrand(formData);
    setFormLoading(false);
    if (success) {
      setCreateDialogOpen(false);
      resetForm();
      loadBrands();
    }
  };

  const handleSubmitEdit = async () => {
    if (!selectedBrand) return;
    setFormLoading(true);
    const success = await handleUpdateBrand(selectedBrand.id, formData);
    setFormLoading(false);
    if (success) {
      setEditDialogOpen(false);
      setSelectedBrand(null);
      resetForm();
      loadBrands();
    }
  };

  const handleSubmitDelete = async () => {
    if (!selectedBrand) return;
    setFormLoading(true);
    const success = await handleDeleteBrand(selectedBrand.id);
    setFormLoading(false);
    if (success) {
      setDeleteDialogOpen(false);
      setSelectedBrand(null);
      loadBrands();
    }
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Brands</h1>
          <p className="text-muted-foreground">
            Manage product brands ({pagination.totalBrands} total)
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Brand
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Brand List
          </CardTitle>
          <CardDescription>
            View and manage all brands in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Refresh */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search brands..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="icon" onClick={loadBrands}>
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>

          {/* Table */}
          <BrandTable
            brands={brands}
            loading={loading}
            hasSearch={Boolean(search)}
            onEdit={openEditDialog}
            onDelete={openDeleteDialog}
          />

          {/* Pagination */}
          <BrandPagination
            pagination={pagination}
            onPageChange={setCurrentPage}
            onPageSizeChange={handlePageSizeChange}
          />
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateBrandDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        formData={formData}
        onFormChange={setFormData}
        onSubmit={handleSubmitCreate}
        saving={formLoading}
      />

      <EditBrandDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        formData={formData}
        onFormChange={setFormData}
        onSubmit={handleSubmitEdit}
        saving={formLoading}
      />

      <DeleteBrandDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        brand={selectedBrand}
        onConfirm={handleSubmitDelete}
        saving={formLoading}
      />
    </div>
  );
}
