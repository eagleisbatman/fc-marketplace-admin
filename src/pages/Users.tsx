import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin,
  Search,
  Users as UsersIcon,
  Loader2,
  AlertCircle,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Building2,
  RefreshCw,
} from "lucide-react";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  bulkAssignUsers,
  updateUserLocation,
} from "@/lib/api";
import { LocationSelector, LocationValue } from "@/components/LocationSelector";
import { FPOSelector } from "@/components/FPOSelector";
import { toast } from "sonner";

type User = {
  id: string;
  name: string;
  nameLocal?: string;
  phone?: string;
  email?: string;
  type: "farmer" | "partner" | "provider" | "admin";
  village?: {
    id: string;
    name: string;
    block: {
      id: string;
      name: string;
      district: {
        id: string;
        name: string;
        state: {
          id: string;
          code: string;
          name: string;
        };
      };
    };
  };
  fpoMemberships?: Array<{
    fpo: {
      id: string;
      name: string;
    };
    role: string;
  }>;
};

type CreateUserForm = {
  name: string;
  nameLocal: string;
  phone: string;
  email: string;
  type: "farmer" | "partner" | "provider" | "admin";
  fpoId?: string;
  fpoRole?: string;
  location: LocationValue;
};

const initialFormState: CreateUserForm = {
  name: "",
  nameLocal: "",
  phone: "",
  email: "",
  type: "farmer",
  fpoId: undefined,
  fpoRole: "member",
  location: {},
};

export function Users() {
  const [userType, setUserType] = useState("all");
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selection state
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [bulkFpoDialogOpen, setBulkFpoDialogOpen] = useState(false);
  const [bulkLocationDialogOpen, setBulkLocationDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState<CreateUserForm>(initialFormState);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [locationEditUser, setLocationEditUser] = useState<User | null>(null);
  const [locationValue, setLocationValue] = useState<LocationValue>({});
  const [bulkFpoId, setBulkFpoId] = useState<string | undefined>();
  const [bulkFpoRole, setBulkFpoRole] = useState("member");
  const [bulkLocation, setBulkLocation] = useState<LocationValue>({});

  // Loading states
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [userType]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: { type?: string; limit: number } = { limit: 200 };
      if (userType !== "all") {
        params.type = userType;
      }
      const response = await getUsers(params) as { success: boolean; data?: { users: User[] } };
      if (response.success && response.data) {
        setUsers(response.data.users || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      !search ||
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      (user.phone?.includes(search) ?? false) ||
      (user.email?.toLowerCase().includes(search.toLowerCase()) ?? false);
    return matchesSearch;
  });

  const usersWithoutLocation = users.filter((u) => !u.village).length;

  // Selection handlers
  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
  };

  const toggleAllSelection = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map((u) => u.id)));
    }
  };

  const clearSelection = () => {
    setSelectedUsers(new Set());
  };

  // Create user handler
  const handleCreateUser = async () => {
    if (!formData.name) {
      toast.error("Name is required");
      return;
    }

    try {
      setSaving(true);
      await createUser({
        name: formData.name,
        nameLocal: formData.nameLocal || undefined,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        type: formData.type,
        villageId: formData.location.villageId,
        fpoId: formData.type === "farmer" ? formData.fpoId : undefined,
        fpoRole: formData.type === "farmer" ? formData.fpoRole : undefined,
      });
      toast.success("User created successfully");
      setCreateDialogOpen(false);
      setFormData(initialFormState);
      loadUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setSaving(false);
    }
  };

  // Edit user handler
  const handleEditUser = async () => {
    if (!editingUser) return;

    try {
      setSaving(true);
      await updateUser(editingUser.id, {
        name: formData.name,
        nameLocal: formData.nameLocal || null,
        phone: formData.phone || null,
        email: formData.email || null,
      });
      toast.success("User updated successfully");
      setEditDialogOpen(false);
      setEditingUser(null);
      setFormData(initialFormState);
      loadUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  // Delete user handler
  const handleDeleteUser = async () => {
    if (!deletingUser) return;

    try {
      setSaving(true);
      await deleteUser(deletingUser.id);
      toast.success("User deleted successfully");
      setDeleteDialogOpen(false);
      setDeletingUser(null);
      loadUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setSaving(false);
    }
  };

  // Update location handler
  const handleUpdateLocation = async () => {
    if (!locationEditUser || !locationValue.villageId) return;

    try {
      setSaving(true);
      await updateUserLocation(locationEditUser.id, locationValue.villageId);
      toast.success("Location updated successfully");
      setLocationDialogOpen(false);
      setLocationEditUser(null);
      setLocationValue({});
      loadUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update location");
    } finally {
      setSaving(false);
    }
  };

  // Bulk assign to FPO handler
  const handleBulkAssignFpo = async () => {
    if (!bulkFpoId || selectedUsers.size === 0) return;

    try {
      setSaving(true);
      const result = await bulkAssignUsers({
        userIds: Array.from(selectedUsers),
        fpoId: bulkFpoId,
        fpoRole: bulkFpoRole,
      }) as { success: boolean; data?: { updated: number; failed: number } };

      if (result.success && result.data) {
        toast.success(`${result.data.updated} users assigned to FPO`);
        if (result.data.failed > 0) {
          toast.warning(`${result.data.failed} users could not be assigned`);
        }
      }
      setBulkFpoDialogOpen(false);
      setBulkFpoId(undefined);
      setBulkFpoRole("member");
      clearSelection();
      loadUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to assign users to FPO");
    } finally {
      setSaving(false);
    }
  };

  // Bulk assign location handler
  const handleBulkAssignLocation = async () => {
    if (!bulkLocation.villageId || selectedUsers.size === 0) return;

    try {
      setSaving(true);
      const result = await bulkAssignUsers({
        userIds: Array.from(selectedUsers),
        villageId: bulkLocation.villageId,
      }) as { success: boolean; data?: { updated: number; failed: number } };

      if (result.success && result.data) {
        toast.success(`${result.data.updated} users location updated`);
        if (result.data.failed > 0) {
          toast.warning(`${result.data.failed} users could not be updated`);
        }
      }
      setBulkLocationDialogOpen(false);
      setBulkLocation({});
      clearSelection();
      loadUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update locations");
    } finally {
      setSaving(false);
    }
  };

  // Bulk delete handler
  const handleBulkDelete = async () => {
    try {
      setSaving(true);
      let successCount = 0;
      let failCount = 0;

      for (const userId of selectedUsers) {
        try {
          await deleteUser(userId);
          successCount++;
        } catch {
          failCount++;
        }
      }

      toast.success(`${successCount} users deleted`);
      if (failCount > 0) {
        toast.warning(`${failCount} users could not be deleted`);
      }
      setBulkDeleteDialogOpen(false);
      clearSelection();
      loadUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete users");
    } finally {
      setSaving(false);
    }
  };

  // Open edit dialog
  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      nameLocal: user.nameLocal || "",
      phone: user.phone || "",
      email: user.email || "",
      type: user.type,
      location: {},
    });
    setEditDialogOpen(true);
  };

  // Open location dialog
  const openLocationDialog = (user: User) => {
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

  const getUserLocation = (user: User) => {
    if (!user.village) return null;
    return `${user.village.name}, ${user.village.block.district.name}`;
  };

  const getUserFpo = (user: User) => {
    if (!user.fpoMemberships || user.fpoMemberships.length === 0) return null;
    return user.fpoMemberships[0].fpo.name;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground">
            Manage user accounts and assign locations
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create User
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {usersWithoutLocation > 0 && (
        <Card className="border-orange-500 bg-orange-500/10">
          <CardContent className="flex items-center gap-4 py-4">
            <MapPin className="h-8 w-8 text-orange-500" />
            <div>
              <h3 className="font-medium">
                {usersWithoutLocation} users without location
              </h3>
              <p className="text-sm text-muted-foreground">
                Assign locations to enable location-based features
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5" />
            User List ({users.length} total)
          </CardTitle>
          <CardDescription>
            Select users to perform bulk actions or click actions menu for individual operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Tabs value={userType} onValueChange={setUserType}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="farmer">Farmers</TabsTrigger>
                <TabsTrigger value="partner">Partners</TabsTrigger>
                <TabsTrigger value="provider">Providers</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button variant="outline" onClick={loadUsers}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {/* Bulk Actions Bar */}
          {selectedUsers.size > 0 && (
            <div className="flex items-center gap-2 p-3 mb-4 bg-muted rounded-lg">
              <span className="text-sm font-medium">{selectedUsers.size} selected</span>
              <div className="flex-1" />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBulkFpoDialogOpen(true)}
              >
                <Building2 className="mr-2 h-4 w-4" />
                Assign to FPO
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBulkLocationDialogOpen(true)}
              >
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

          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                      onCheckedChange={toggleAllSelection}
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>FPO</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedUsers.has(user.id)}
                          onCheckedChange={() => toggleUserSelection(user.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {user.name}
                        {user.nameLocal && (
                          <span className="block text-sm text-muted-foreground">
                            {user.nameLocal}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{user.phone || "-"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.type === "farmer"
                              ? "default"
                              : user.type === "partner"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {user.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getUserLocation(user) ? (
                          <span className="text-sm">{getUserLocation(user)}</span>
                        ) : (
                          <Badge variant="outline" className="text-orange-500 border-orange-500">
                            Not Set
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {getUserFpo(user) ? (
                          <span className="text-sm">{getUserFpo(user)}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(user)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openLocationDialog(user)}>
                              <MapPin className="mr-2 h-4 w-4" />
                              {user.village ? "Change Location" : "Assign Location"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setDeletingUser(user);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
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
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter name"
              />
            </div>
            <div className="space-y-2">
              <Label>Name (Local)</Label>
              <Input
                value={formData.nameLocal}
                onChange={(e) => setFormData({ ...formData, nameLocal: e.target.value })}
                placeholder="Enter local name"
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email"
              />
            </div>
            <div className="space-y-2">
              <Label>Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(val) => setFormData({ ...formData, type: val as CreateUserForm["type"] })}
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
                  onChange={(val) => setFormData({ ...formData, fpoId: val })}
                  label="Assign to FPO (optional)"
                />
                {formData.fpoId && (
                  <div className="space-y-2">
                    <Label>Role in FPO</Label>
                    <Select
                      value={formData.fpoRole}
                      onValueChange={(val) => setFormData({ ...formData, fpoRole: val })}
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

            <div className="pt-2 border-t">
              <Label className="text-sm font-medium">Location (optional)</Label>
              <LocationSelector
                value={formData.location}
                onChange={(val) => setFormData({ ...formData, location: val })}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateUser} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Name (Local)</Label>
              <Input
                value={formData.nameLocal}
                onChange={(e) => setFormData({ ...formData, nameLocal: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditUser} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {deletingUser?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Location Dialog */}
      <Dialog open={locationDialogOpen} onOpenChange={setLocationDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {locationEditUser?.village ? "Change Location" : "Assign Location"}
            </DialogTitle>
            <DialogDescription>
              Set location for {locationEditUser?.name}
            </DialogDescription>
          </DialogHeader>
          <LocationSelector
            value={locationValue}
            onChange={setLocationValue}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setLocationDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateLocation}
              disabled={saving || !locationValue.villageId}
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Assign FPO Dialog */}
      <Dialog open={bulkFpoDialogOpen} onOpenChange={setBulkFpoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign to FPO</DialogTitle>
            <DialogDescription>
              Assign {selectedUsers.size} selected users to an FPO
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <FPOSelector
              value={bulkFpoId}
              onChange={setBulkFpoId}
            />
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={bulkFpoRole} onValueChange={setBulkFpoRole}>
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
            <Button variant="outline" onClick={() => setBulkFpoDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkAssignFpo} disabled={saving || !bulkFpoId}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Assign {selectedUsers.size} Users
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Assign Location Dialog */}
      <Dialog open={bulkLocationDialogOpen} onOpenChange={setBulkLocationDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Location</DialogTitle>
            <DialogDescription>
              Set location for {selectedUsers.size} selected users
            </DialogDescription>
          </DialogHeader>
          <LocationSelector
            value={bulkLocation}
            onChange={setBulkLocation}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkLocationDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleBulkAssignLocation}
              disabled={saving || !bulkLocation.villageId}
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Assign {selectedUsers.size} Users
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Dialog */}
      <Dialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Users</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedUsers.size} users? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBulkDelete} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete {selectedUsers.size} Users
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
