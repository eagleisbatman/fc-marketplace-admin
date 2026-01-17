import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { ProductForm } from "./ProductForm";
import type {
  Product,
  ProductFormData,
  Category,
  Brand,
  ServiceProvider,
  Unit,
  Currency,
} from "@/types/product.types";

// Create Product Dialog
type CreateProductDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: ProductFormData;
  onFormChange: (data: ProductFormData) => void;
  onSubmit: () => void;
  saving: boolean;
  categories: Category[];
  brands: Brand[];
  providers: ServiceProvider[];
  units: Unit[];
  currencies: Currency[];
};

export function CreateProductDialog({
  open,
  onOpenChange,
  formData,
  onFormChange,
  onSubmit,
  saving,
  categories,
  brands,
  providers,
  units,
  currencies,
}: CreateProductDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Product</DialogTitle>
          <DialogDescription>Add a new product to the catalog</DialogDescription>
        </DialogHeader>
        <ProductForm
          formData={formData}
          onFormChange={onFormChange}
          categories={categories}
          brands={brands}
          providers={providers}
          units={units}
          currencies={currencies}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Edit Product Dialog
type EditProductDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  formData: ProductFormData;
  onFormChange: (data: ProductFormData) => void;
  onSubmit: () => void;
  saving: boolean;
  categories: Category[];
  brands: Brand[];
  providers: ServiceProvider[];
  units: Unit[];
  currencies: Currency[];
};

export function EditProductDialog({
  open,
  onOpenChange,
  product,
  formData,
  onFormChange,
  onSubmit,
  saving,
  categories,
  brands,
  providers,
  units,
  currencies,
}: EditProductDialogProps) {
  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>Update product details</DialogDescription>
        </DialogHeader>
        <ProductForm
          formData={formData}
          onFormChange={onFormChange}
          categories={categories}
          brands={brands}
          providers={providers}
          units={units}
          currencies={currencies}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Delete Product Dialog
type DeleteProductDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onConfirm: () => void;
  saving: boolean;
};

export function DeleteProductDialog({
  open,
  onOpenChange,
  product,
  onConfirm,
  saving,
}: DeleteProductDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Product</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{product?.name}" (SKU:{" "}
            {product?.skuCode})? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
