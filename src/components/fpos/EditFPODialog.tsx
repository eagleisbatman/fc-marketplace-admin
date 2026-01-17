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
import type { FPO, CreateFPOForm } from "@/types/fpo.types";

type EditFPODialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fpo: FPO | null;
  formData: CreateFPOForm;
  onFormChange: (data: CreateFPOForm) => void;
  onSubmit: () => void;
  saving: boolean;
};

export function EditFPODialog({
  open,
  onOpenChange,
  fpo,
  formData,
  onFormChange,
  onSubmit,
  saving,
}: EditFPODialogProps) {
  if (!fpo) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit FPO</DialogTitle>
          <DialogDescription>Update FPO information</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) =>
                onFormChange({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Name (Local)</Label>
            <Input
              value={formData.nameLocal}
              onChange={(e) =>
                onFormChange({ ...formData, nameLocal: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Registration Number</Label>
            <Input
              value={formData.registrationNumber}
              onChange={(e) =>
                onFormChange({
                  ...formData,
                  registrationNumber: e.target.value,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input
              value={formData.phone}
              onChange={(e) =>
                onFormChange({ ...formData, phone: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) =>
                onFormChange({ ...formData, email: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Address</Label>
            <Input
              value={formData.address}
              onChange={(e) =>
                onFormChange({ ...formData, address: e.target.value })
              }
            />
          </div>
        </div>
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
