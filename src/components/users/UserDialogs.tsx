import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import { FPOSelector } from "@/components/FPOSelector";
import type { User } from "@/types/user.types";

// Delete User Dialog
type DeleteUserDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onConfirm: () => void;
  saving: boolean;
};

export function DeleteUserDialog({
  open,
  onOpenChange,
  user,
  onConfirm,
  saving,
}: DeleteUserDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete User</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {user?.name}? This action cannot be undone.
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
  user: User | null;
  locationValue: LocationValue;
  onLocationChange: (value: LocationValue) => void;
  onSave: () => void;
  saving: boolean;
};

export function LocationDialog({
  open,
  onOpenChange,
  user,
  locationValue,
  onLocationChange,
  onSave,
  saving,
}: LocationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {user?.village ? "Change Location" : "Assign Location"}
          </DialogTitle>
          <DialogDescription>Set location for {user?.name}</DialogDescription>
        </DialogHeader>
        <LocationSelector value={locationValue} onChange={onLocationChange} />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={saving || !locationValue.villageId}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Location
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Bulk Assign FPO Dialog
type BulkAssignFpoDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  fpoId: string | undefined;
  fpoRole: string;
  onFpoChange: (fpoId: string | undefined) => void;
  onRoleChange: (role: string) => void;
  onAssign: () => void;
  saving: boolean;
};

export function BulkAssignFpoDialog({
  open,
  onOpenChange,
  selectedCount,
  fpoId,
  fpoRole,
  onFpoChange,
  onRoleChange,
  onAssign,
  saving,
}: BulkAssignFpoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign to FPO</DialogTitle>
          <DialogDescription>
            Assign {selectedCount} selected users to an FPO
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <FPOSelector value={fpoId} onChange={onFpoChange} />
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={fpoRole} onValueChange={onRoleChange}>
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
          <Button onClick={onAssign} disabled={saving || !fpoId}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Assign {selectedCount} Users
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Bulk Assign Location Dialog
type BulkAssignLocationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  locationValue: LocationValue;
  onLocationChange: (value: LocationValue) => void;
  onAssign: () => void;
  saving: boolean;
};

export function BulkAssignLocationDialog({
  open,
  onOpenChange,
  selectedCount,
  locationValue,
  onLocationChange,
  onAssign,
  saving,
}: BulkAssignLocationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Location</DialogTitle>
          <DialogDescription>
            Set location for {selectedCount} selected users
          </DialogDescription>
        </DialogHeader>
        <LocationSelector value={locationValue} onChange={onLocationChange} />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onAssign} disabled={saving || !locationValue.villageId}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Assign {selectedCount} Users
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Bulk Delete Dialog
type BulkDeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onConfirm: () => void;
  saving: boolean;
};

export function BulkDeleteDialog({
  open,
  onOpenChange,
  selectedCount,
  onConfirm,
  saving,
}: BulkDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Users</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {selectedCount} users? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete {selectedCount} Users
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
