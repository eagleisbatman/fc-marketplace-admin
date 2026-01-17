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
import { LocationSelector } from "@/components/LocationSelector";
import type { CreateFPOForm } from "@/types/fpo.types";

type CreateFPODialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: CreateFPOForm;
  onFormChange: (data: CreateFPOForm) => void;
  onSubmit: () => void;
  saving: boolean;
};

export function CreateFPODialog({
  open,
  onOpenChange,
  formData,
  onFormChange,
  onSubmit,
  saving,
}: CreateFPODialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create FPO</DialogTitle>
          <DialogDescription>
            Add a new Farmer Producer Organization
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) =>
                onFormChange({ ...formData, name: e.target.value })
              }
              placeholder="Enter FPO name"
            />
          </div>
          <div className="space-y-2">
            <Label>Name (Local)</Label>
            <Input
              value={formData.nameLocal}
              onChange={(e) =>
                onFormChange({ ...formData, nameLocal: e.target.value })
              }
              placeholder="Enter local name"
            />
          </div>
          <div className="space-y-2">
            <Label>Registration Number</Label>
            <Input
              value={formData.registrationNumber}
              onChange={(e) =>
                onFormChange({ ...formData, registrationNumber: e.target.value })
              }
              placeholder="Enter registration number"
            />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input
              value={formData.phone}
              onChange={(e) =>
                onFormChange({ ...formData, phone: e.target.value })
              }
              placeholder="Enter phone number"
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
              placeholder="Enter email"
            />
          </div>
          <div className="space-y-2">
            <Label>Address</Label>
            <Input
              value={formData.address}
              onChange={(e) =>
                onFormChange({ ...formData, address: e.target.value })
              }
              placeholder="Enter address"
            />
          </div>

          <div className="pt-2 border-t">
            <Label className="text-sm font-medium">Location (optional)</Label>
            <LocationSelector
              value={formData.location}
              onChange={(val) => onFormChange({ ...formData, location: val })}
              className="mt-2"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create FPO
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
