import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import type { Brand, BrandFormData } from "@/types/brand.types";

// ============================================
// Brand Form Component (shared by Create/Edit)
// ============================================

type BrandFormProps = {
  formData: BrandFormData;
  onFormChange: (data: BrandFormData) => void;
  idPrefix?: string;
};

function BrandForm({ formData, onFormChange, idPrefix = "" }: BrandFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}name`}>Name *</Label>
        <Input
          id={`${idPrefix}name`}
          value={formData.name}
          onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
          placeholder="Enter brand name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}nameLocal`}>Local Name</Label>
        <Input
          id={`${idPrefix}nameLocal`}
          value={formData.nameLocal}
          onChange={(e) =>
            onFormChange({ ...formData, nameLocal: e.target.value })
          }
          placeholder="Enter local name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}website`}>Website</Label>
        <Input
          id={`${idPrefix}website`}
          value={formData.website}
          onChange={(e) =>
            onFormChange({ ...formData, website: e.target.value })
          }
          placeholder="https://example.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}logoUrl`}>Logo URL</Label>
        <Input
          id={`${idPrefix}logoUrl`}
          value={formData.logoUrl}
          onChange={(e) =>
            onFormChange({ ...formData, logoUrl: e.target.value })
          }
          placeholder="https://example.com/logo.png"
        />
      </div>
    </div>
  );
}

// ============================================
// Create Brand Dialog
// ============================================

type CreateBrandDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: BrandFormData;
  onFormChange: (data: BrandFormData) => void;
  onSubmit: () => void;
  saving: boolean;
};

export function CreateBrandDialog({
  open,
  onOpenChange,
  formData,
  onFormChange,
  onSubmit,
  saving,
}: CreateBrandDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Brand</DialogTitle>
          <DialogDescription>Add a new brand to the system</DialogDescription>
        </DialogHeader>
        <BrandForm formData={formData} onFormChange={onFormChange} />
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

// ============================================
// Edit Brand Dialog
// ============================================

type EditBrandDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: BrandFormData;
  onFormChange: (data: BrandFormData) => void;
  onSubmit: () => void;
  saving: boolean;
};

export function EditBrandDialog({
  open,
  onOpenChange,
  formData,
  onFormChange,
  onSubmit,
  saving,
}: EditBrandDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Brand</DialogTitle>
          <DialogDescription>Update brand details</DialogDescription>
        </DialogHeader>
        <BrandForm
          formData={formData}
          onFormChange={onFormChange}
          idPrefix="edit-"
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

// ============================================
// Delete Brand Dialog
// ============================================

type DeleteBrandDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand: Brand | null;
  onConfirm: () => void;
  saving: boolean;
};

export function DeleteBrandDialog({
  open,
  onOpenChange,
  brand,
  onConfirm,
  saving,
}: DeleteBrandDialogProps) {
  const hasProducts = (brand?._count?.products || 0) > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Brand</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{brand?.name}"?
            {hasProducts && (
              <span className="block mt-2 text-destructive">
                This brand has {brand?._count?.products} products associated
                with it. You must remove or reassign these products first.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={saving || hasProducts}
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
