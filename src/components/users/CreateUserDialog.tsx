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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { LocationSelector } from "@/components/LocationSelector";
import { FPOSelector } from "@/components/FPOSelector";
import type { CreateUserForm, Country, State } from "@/types/user.types";

type CreateUserDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: CreateUserForm;
  onFormChange: (data: CreateUserForm) => void;
  onSubmit: () => void;
  saving: boolean;
  countries: Country[];
  adminStates: State[];
  loadingCountries: boolean;
  loadingAdminStates: boolean;
  onLoadCountries: () => void;
  onLoadAdminStates: (countryCode: string) => void;
};

export function CreateUserDialog({
  open,
  onOpenChange,
  formData,
  onFormChange,
  onSubmit,
  saving,
  countries,
  adminStates,
  loadingCountries,
  loadingAdminStates,
  onLoadCountries,
  onLoadAdminStates,
}: CreateUserDialogProps) {
  // Load countries when admin type is selected
  if (formData.type === "admin" && countries.length === 0 && !loadingCountries) {
    onLoadCountries();
  }

  // Load states when country is selected for state_admin
  const handleCountryChange = (countryId: string) => {
    onFormChange({ ...formData, adminCountryId: countryId, adminStateId: undefined });
    const country = countries.find((c) => c.id === countryId);
    if (country && formData.adminRole === "state_admin") {
      onLoadAdminStates(country.code);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create User</DialogTitle>
          <DialogDescription>Add a new user to the system</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
              placeholder="Enter name"
            />
          </div>
          <div className="space-y-2">
            <Label>Name (Local)</Label>
            <Input
              value={formData.nameLocal}
              onChange={(e) => onFormChange({ ...formData, nameLocal: e.target.value })}
              placeholder="Enter local name"
            />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input
              value={formData.phone}
              onChange={(e) => onFormChange({ ...formData, phone: e.target.value })}
              placeholder="Enter phone number"
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => onFormChange({ ...formData, email: e.target.value })}
              placeholder="Enter email"
            />
          </div>
          <div className="space-y-2">
            <Label>Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(val) => onFormChange({ ...formData, type: val as CreateUserForm["type"] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="farmer">Farmer</SelectItem>
                <SelectItem value="partner">Partner</SelectItem>
                <SelectItem value="provider">Provider</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.type === "farmer" && (
            <>
              <FPOSelector
                value={formData.fpoId}
                onChange={(val) => onFormChange({ ...formData, fpoId: val })}
                label="Assign to FPO (optional)"
              />
              {formData.fpoId && (
                <div className="space-y-2">
                  <Label>Role in FPO</Label>
                  <Select
                    value={formData.fpoRole}
                    onValueChange={(val) => onFormChange({ ...formData, fpoRole: val })}
                  >
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
              )}
            </>
          )}

          {formData.type === "admin" && (
            <>
              <div className="space-y-2">
                <Label>Admin Role *</Label>
                <Select
                  value={formData.adminRole || ""}
                  onValueChange={(val) =>
                    onFormChange({
                      ...formData,
                      adminRole: val as CreateUserForm["adminRole"],
                      adminCountryId: undefined,
                      adminStateId: undefined,
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
                    onValueChange={handleCountryChange}
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
            Create User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
