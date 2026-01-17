import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import type { User, CreateUserForm, Country, State } from "@/types/user.types";

type EditUserDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  formData: CreateUserForm;
  onFormChange: (data: CreateUserForm) => void;
  onSubmit: () => void;
  saving: boolean;
  countries: Country[];
  adminStates: State[];
  loadingCountries: boolean;
  loadingAdminStates: boolean;
};

export function EditUserDialog({
  open,
  onOpenChange,
  user,
  formData,
  onFormChange,
  onSubmit,
  saving,
  countries,
  adminStates,
  loadingCountries,
  loadingAdminStates,
}: EditUserDialogProps) {
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>Update user information</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>User Type:</span>
            <Badge
              variant={
                user.type === "farmer"
                  ? "default"
                  : user.type === "partner"
                  ? "secondary"
                  : user.type === "admin"
                  ? "destructive"
                  : "outline"
              }
            >
              {user.type}
            </Badge>
          </div>

          <div className="space-y-2">
            <Label>Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Name (Local)</Label>
            <Input
              value={formData.nameLocal}
              onChange={(e) => onFormChange({ ...formData, nameLocal: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input
              value={formData.phone}
              onChange={(e) => onFormChange({ ...formData, phone: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => onFormChange({ ...formData, email: e.target.value })}
            />
          </div>

          {user.type === "admin" && (
            <>
              <div className="pt-2 border-t">
                <Label className="text-sm font-medium">Admin Settings</Label>
              </div>
              <div className="space-y-2">
                <Label>Admin Role *</Label>
                <Select
                  value={formData.adminRole || ""}
                  onValueChange={(val) =>
                    onFormChange({
                      ...formData,
                      adminRole: val as CreateUserForm["adminRole"],
                      adminCountryId: val === "super_admin" ? undefined : formData.adminCountryId,
                      adminStateId: val !== "state_admin" ? undefined : formData.adminStateId,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select admin role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super_admin">Super Admin (Full Access)</SelectItem>
                    <SelectItem value="country_admin">Country Admin</SelectItem>
                    <SelectItem value="state_admin">State Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(formData.adminRole === "country_admin" || formData.adminRole === "state_admin") && (
                <div className="space-y-2">
                  <Label>Country *</Label>
                  <Select
                    value={formData.adminCountryId || ""}
                    onValueChange={(val) =>
                      onFormChange({
                        ...formData,
                        adminCountryId: val,
                        adminStateId: undefined,
                      })
                    }
                    disabled={loadingCountries}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingCountries ? "Loading..." : "Select country"} />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.id} value={country.id}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.adminRole === "state_admin" && formData.adminCountryId && (
                <div className="space-y-2">
                  <Label>State *</Label>
                  <Select
                    value={formData.adminStateId || ""}
                    onValueChange={(val) => onFormChange({ ...formData, adminStateId: val })}
                    disabled={loadingAdminStates}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingAdminStates ? "Loading..." : "Select state"} />
                    </SelectTrigger>
                    <SelectContent>
                      {adminStates.map((state) => (
                        <SelectItem key={state.id} value={state.id}>
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </>
          )}
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
