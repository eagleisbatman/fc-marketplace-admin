import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  MapPin,
  Users as UsersIcon,
  Loader2,
  AlertCircle,
  Plus,
  Building2,
  Trash2,
} from "lucide-react";
import { useUsers } from "@/hooks/useUsers";
import {
  UserTable,
  UserFilters,
  UserPagination,
  CreateUserDialog,
  EditUserDialog,
  DeleteUserDialog,
  LocationDialog,
  BulkAssignFpoDialog,
  BulkAssignLocationDialog,
  BulkDeleteDialog,
} from "@/components/users";
import type { User, CreateUserForm } from "@/types/user.types";
import type { LocationValue } from "@/components/LocationSelector";

const defaultFormState: CreateUserForm = {
  name: "",
  nameLocal: "",
  phone: "",
  email: "",
  type: "farmer",
  fpoId: undefined,
  fpoRole: "member",
  location: {},
  adminRole: undefined,
  adminCountryId: undefined,
  adminStateId: undefined,
};

export function Users() {
  const {
    users,
    loading,
    error,
    pagination,
    filters,
    selectedUsers,
    countries,
    adminStates,
    loadingCountries,
    loadingAdminStates,
    loadUsers,
    loadCountries,
    loadAdminStates,
    handleCreateUser,
    handleUpdateUser,
    handleDeleteUser,
    handleUpdateLocation,
    handleBulkAssignFpo,
    handleBulkAssignLocation,
    handleBulkDelete,
    toggleUserSelection,
    toggleAllSelection,
    clearSelection,
    setCurrentPage,
    setPageSize,
    updateFilters,
    clearFilters,
    setAdminStates,
  } = useUsers();

  // Dialog states
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [bulkFpoDialogOpen, setBulkFpoDialogOpen] = useState(false);
  const [bulkLocationDialogOpen, setBulkLocationDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState<CreateUserForm>(defaultFormState);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [locationEditUser, setLocationEditUser] = useState<User | null>(null);
  const [locationValue, setLocationValue] = useState<LocationValue>({});
  const [bulkFpoId, setBulkFpoId] = useState<string | undefined>();
  const [bulkFpoRole, setBulkFpoRole] = useState("member");
  const [bulkLocation, setBulkLocation] = useState<LocationValue>({});

  // Loading state
  const [saving, setSaving] = useState(false);

  // Load states when editing a state_admin
  useEffect(() => {
    if (editingUser?.type === "admin" && editingUser?.adminRole === "state_admin" && editingUser?.adminCountry) {
      loadAdminStates(editingUser.adminCountry.code);
    }
  }, [editingUser, loadAdminStates]);

  // Filter users by search
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      !filters.search ||
      user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      (user.phone?.includes(filters.search) ?? false) ||
      (user.email?.toLowerCase().includes(filters.search.toLowerCase()) ?? false);
    return matchesSearch;
  });

  const usersWithoutLocation = users.filter((u) => !u.village).length;

  // Handlers
  const handleOpenEditDialog = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      nameLocal: user.nameLocal || "",
      phone: user.phone || "",
      email: user.email || "",
      type: user.type,
      location: {},
      adminRole: user.adminRole,
      adminCountryId: user.adminCountry?.id,
      adminStateId: user.adminState?.id,
    });
    if (countries.length === 0 && user.type === "admin") {
      loadCountries();
    }
    setEditDialogOpen(true);
  };

  const handleOpenLocationDialog = (user: User) => {
    setLocationEditUser(user);
    if (user.village) {
      setLocationValue({
        stateCode: user.village.block.district.state.code,
        districtId: user.village.block.district.id,
        blockId: user.village.block.id,
        villageId: user.village.id,
      });
    } else {
      setLocationValue({});
    }
    setLocationDialogOpen(true);
  };

  const handleOpenDeleteDialog = (user: User) => {
    setDeletingUser(user);
    setDeleteDialogOpen(true);
  };

  const handleSubmitCreate = async () => {
    setSaving(true);
    const success = await handleCreateUser(formData);
    setSaving(false);
    if (success) {
      setCreateDialogOpen(false);
      setFormData(defaultFormState);
      setAdminStates([]);
      loadUsers();
    }
  };

  const handleSubmitEdit = async () => {
    if (!editingUser) return;
    setSaving(true);
    const success = await handleUpdateUser(editingUser.id, formData, editingUser.type);
    setSaving(false);
    if (success) {
      setEditDialogOpen(false);
      setEditingUser(null);
      setFormData(defaultFormState);
      setAdminStates([]);
      loadUsers();
    }
  };

  const handleSubmitDelete = async () => {
    if (!deletingUser) return;
    setSaving(true);
    const success = await handleDeleteUser(deletingUser.id);
    setSaving(false);
    if (success) {
      setDeleteDialogOpen(false);
      setDeletingUser(null);
      loadUsers();
    }
  };

  const handleSubmitLocation = async () => {
    if (!locationEditUser || !locationValue.villageId) return;
    setSaving(true);
    const success = await handleUpdateLocation(locationEditUser.id, locationValue.villageId);
    setSaving(false);
    if (success) {
      setLocationDialogOpen(false);
      setLocationEditUser(null);
      setLocationValue({});
      loadUsers();
    }
  };

  const handleSubmitBulkFpo = async () => {
    if (!bulkFpoId || selectedUsers.size === 0) return;
    setSaving(true);
    const success = await handleBulkAssignFpo(Array.from(selectedUsers), bulkFpoId, bulkFpoRole);
    setSaving(false);
    if (success) {
      setBulkFpoDialogOpen(false);
      setBulkFpoId(undefined);
      setBulkFpoRole("member");
      clearSelection();
      loadUsers();
    }
  };

  const handleSubmitBulkLocation = async () => {
    if (!bulkLocation.villageId || selectedUsers.size === 0) return;
    setSaving(true);
    const success = await handleBulkAssignLocation(Array.from(selectedUsers), bulkLocation.villageId);
    setSaving(false);
    if (success) {
      setBulkLocationDialogOpen(false);
      setBulkLocation({});
      clearSelection();
      loadUsers();
    }
  };

  const handleSubmitBulkDelete = async () => {
    setSaving(true);
    const success = await handleBulkDelete(Array.from(selectedUsers));
    setSaving(false);
    if (success) {
      setBulkDeleteDialogOpen(false);
      clearSelection();
      loadUsers();
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground">Manage user accounts and assign locations</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create User
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Location Warning */}
      {usersWithoutLocation > 0 && (
        <Card className="border-orange-500 bg-orange-500/10">
          <CardContent className="flex items-center gap-4 py-4">
            <MapPin className="h-8 w-8 text-orange-500" />
            <div>
              <h3 className="font-medium">{usersWithoutLocation} users without location</h3>
              <p className="text-sm text-muted-foreground">
                Assign locations to enable location-based features
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5" />
            User List ({pagination.totalUsers.toLocaleString()} total)
          </CardTitle>
          <CardDescription>
            Select users to perform bulk actions or click actions menu for individual operations.
            {filters.search && ` Filtering ${filteredUsers.length} on this page.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <UserFilters
            filters={filters}
            showAdvancedFilters={showAdvancedFilters}
            onShowAdvancedFiltersChange={setShowAdvancedFilters}
            onFiltersChange={updateFilters}
            onClearFilters={clearFilters}
            onRefresh={() => loadUsers()}
            loading={loading}
          />

          {/* Bulk Actions Bar */}
          {selectedUsers.size > 0 && (
            <div className="flex items-center gap-2 p-3 mb-4 bg-muted rounded-lg">
              <span className="text-sm font-medium">{selectedUsers.size} selected</span>
              <div className="flex-1" />
              <Button variant="outline" size="sm" onClick={() => setBulkFpoDialogOpen(true)}>
                <Building2 className="mr-2 h-4 w-4" />
                Assign to FPO
              </Button>
              <Button variant="outline" size="sm" onClick={() => setBulkLocationDialogOpen(true)}>
                <MapPin className="mr-2 h-4 w-4" />
                Assign Location
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBulkDeleteDialogOpen(true)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
              <Button variant="ghost" size="sm" onClick={clearSelection}>
                Clear
              </Button>
            </div>
          )}

          {/* Table */}
          <UserTable
            users={filteredUsers}
            selectedUsers={selectedUsers}
            onToggleSelection={toggleUserSelection}
            onToggleAll={() => toggleAllSelection(filteredUsers.map((u) => u.id))}
            onEdit={handleOpenEditDialog}
            onEditLocation={handleOpenLocationDialog}
            onDelete={handleOpenDeleteDialog}
          />

          {/* Pagination */}
          <UserPagination
            pagination={pagination}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateUserDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        formData={formData}
        onFormChange={setFormData}
        onSubmit={handleSubmitCreate}
        saving={saving}
        countries={countries}
        adminStates={adminStates}
        loadingCountries={loadingCountries}
        loadingAdminStates={loadingAdminStates}
        onLoadCountries={loadCountries}
        onLoadAdminStates={loadAdminStates}
      />

      <EditUserDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        user={editingUser}
        formData={formData}
        onFormChange={setFormData}
        onSubmit={handleSubmitEdit}
        saving={saving}
        countries={countries}
        adminStates={adminStates}
        loadingCountries={loadingCountries}
        loadingAdminStates={loadingAdminStates}
      />

      <DeleteUserDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        user={deletingUser}
        onConfirm={handleSubmitDelete}
        saving={saving}
      />

      <LocationDialog
        open={locationDialogOpen}
        onOpenChange={setLocationDialogOpen}
        user={locationEditUser}
        locationValue={locationValue}
        onLocationChange={setLocationValue}
        onSave={handleSubmitLocation}
        saving={saving}
      />

      <BulkAssignFpoDialog
        open={bulkFpoDialogOpen}
        onOpenChange={setBulkFpoDialogOpen}
        selectedCount={selectedUsers.size}
        fpoId={bulkFpoId}
        fpoRole={bulkFpoRole}
        onFpoChange={setBulkFpoId}
        onRoleChange={setBulkFpoRole}
        onAssign={handleSubmitBulkFpo}
        saving={saving}
      />

      <BulkAssignLocationDialog
        open={bulkLocationDialogOpen}
        onOpenChange={setBulkLocationDialogOpen}
        selectedCount={selectedUsers.size}
        locationValue={bulkLocation}
        onLocationChange={setBulkLocation}
        onAssign={handleSubmitBulkLocation}
        saving={saving}
      />

      <BulkDeleteDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        selectedCount={selectedUsers.size}
        onConfirm={handleSubmitBulkDelete}
        saving={saving}
      />
    </div>
  );
}
