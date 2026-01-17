import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { LocationSelector } from "@/components/LocationSelector";
import type { LocationValue } from "@/components/LocationSelector";
import { useAdmin } from "@/contexts/AdminContext";
import type { FPO, FPOMember, FarmerUser, DocumentForm } from "@/types/fpo.types";
import type { FpoDocument } from "@/lib/api";

// Delete FPO Dialog
type DeleteFPODialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fpo: FPO | null;
  onConfirm: () => void;
  saving: boolean;
};

export function DeleteFPODialog({
  open,
  onOpenChange,
  fpo,
  onConfirm,
  saving,
}: DeleteFPODialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete FPO</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {fpo?.name}? This will also remove
            all member associations.
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

// Location Dialog
type LocationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fpo: FPO | null;
  locationValue: LocationValue;
  onLocationChange: (value: LocationValue) => void;
  onSave: () => void;
  saving: boolean;
};

export function LocationDialog({
  open,
  onOpenChange,
  fpo,
  locationValue,
  onLocationChange,
  onSave,
  saving,
}: LocationDialogProps) {
  const { selectedCountry } = useAdmin();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {fpo?.village ? "Change Location" : "Assign Location"}
          </DialogTitle>
          <DialogDescription>Set location for {fpo?.name}</DialogDescription>
        </DialogHeader>
        <LocationSelector value={locationValue} onChange={onLocationChange} countryFilter={selectedCountry?.code} />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={onSave}
            disabled={saving || !locationValue.villageId}
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Location
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Add Member Dialog
type AddMemberDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fpo: FPO | null;
  farmers: FarmerUser[];
  farmersLoading: boolean;
  selectedFarmerId: string;
  onFarmerSelect: (farmerId: string) => void;
  farmerSearch: string;
  onFarmerSearchChange: (search: string) => void;
  role: string;
  onRoleChange: (role: string) => void;
  onSubmit: () => void;
  saving: boolean;
  members: FPOMember[];
};

export function AddMemberDialog({
  open,
  onOpenChange,
  fpo,
  farmers,
  farmersLoading,
  selectedFarmerId,
  onFarmerSelect,
  farmerSearch,
  onFarmerSearchChange,
  role,
  onRoleChange,
  onSubmit,
  saving,
  members,
}: AddMemberDialogProps) {
  // Filter out farmers already in the FPO
  const filteredFarmers = farmers.filter((farmer) => {
    const isMember = members.some((m) => m.user.id === farmer.id);
    if (isMember) return false;

    if (!farmerSearch) return true;
    const searchLower = farmerSearch.toLowerCase();
    return (
      farmer.name.toLowerCase().includes(searchLower) ||
      (farmer.phone?.includes(searchLower) ?? false)
    );
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Member</DialogTitle>
          <DialogDescription>Add a farmer to {fpo?.name}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Search Farmer</Label>
            <Input
              value={farmerSearch}
              onChange={(e) => onFarmerSearchChange(e.target.value)}
              placeholder="Search by name or phone..."
            />
          </div>
          <div className="space-y-2">
            <Label>Select Farmer</Label>
            {farmersLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Select value={selectedFarmerId} onValueChange={onFarmerSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a farmer" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {filteredFarmers.length === 0 ? (
                    <div className="py-4 text-center text-sm text-muted-foreground">
                      No farmers available
                    </div>
                  ) : (
                    filteredFarmers.slice(0, 50).map((farmer) => (
                      <SelectItem key={farmer.id} value={farmer.id}>
                        <div className="flex flex-col">
                          <span>{farmer.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {farmer.phone || "No phone"}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={onRoleChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={saving || !selectedFarmerId}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Member
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Remove Member Dialog
type RemoveMemberDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fpo: FPO | null;
  member: FPOMember | null;
  onConfirm: () => void;
  saving: boolean;
};

export function RemoveMemberDialog({
  open,
  onOpenChange,
  fpo,
  member,
  onConfirm,
  saving,
}: RemoveMemberDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Member</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove {member?.user.name} from {fpo?.name}
            ?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Remove
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Change Role Dialog
type ChangeRoleDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: FPOMember | null;
  role: string;
  onRoleChange: (role: string) => void;
  onSubmit: () => void;
  saving: boolean;
};

export function ChangeRoleDialog({
  open,
  onOpenChange,
  member,
  role,
  onRoleChange,
  onSubmit,
  saving,
}: ChangeRoleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Role</DialogTitle>
          <DialogDescription>
            Update role for {member?.user.name}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>New Role</Label>
            <Select value={role} onValueChange={onRoleChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Add Document Dialog
type AddDocumentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fpo: FPO | null;
  formData: DocumentForm;
  onFormChange: (data: DocumentForm) => void;
  onSubmit: () => void;
  saving: boolean;
};

export function AddDocumentDialog({
  open,
  onOpenChange,
  fpo,
  formData,
  onFormChange,
  onSubmit,
  saving,
}: AddDocumentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Document</DialogTitle>
          <DialogDescription>Upload a document for {fpo?.name}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Document Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) =>
                onFormChange({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Registration Certificate 2024"
            />
          </div>
          <div className="space-y-2">
            <Label>Document Type</Label>
            <Select
              value={formData.type}
              onValueChange={(val) => onFormChange({ ...formData, type: val })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="registration">
                  Registration Certificate
                </SelectItem>
                <SelectItem value="license">License</SelectItem>
                <SelectItem value="tax">Tax Document</SelectItem>
                <SelectItem value="audit">Audit Report</SelectItem>
                <SelectItem value="agreement">Agreement</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                onFormChange({ ...formData, description: e.target.value })
              }
              placeholder="Brief description of the document"
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label>File URL *</Label>
            <Input
              value={formData.fileUrl}
              onChange={(e) =>
                onFormChange({ ...formData, fileUrl: e.target.value })
              }
              placeholder="https://storage.example.com/doc.pdf"
            />
            <p className="text-xs text-muted-foreground">
              Enter the URL where the document is hosted (e.g., Google Drive,
              Dropbox, S3)
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={saving || !formData.name || !formData.fileUrl}
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Document
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Delete Document Dialog
type DeleteDocumentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: FpoDocument | null;
  onConfirm: () => void;
  saving: boolean;
};

export function DeleteDocumentDialog({
  open,
  onOpenChange,
  document,
  onConfirm,
  saving,
}: DeleteDocumentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Document</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{document?.name}"? This action
            cannot be undone.
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
