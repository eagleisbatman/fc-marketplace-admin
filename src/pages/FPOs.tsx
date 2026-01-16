import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Building2,
  MapPin,
  Search,
  Users,
  Loader2,
  AlertCircle,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  UserPlus,
  UserMinus,
  RefreshCw,
} from "lucide-react";
import {
  getFPOs,
  createFPO,
  updateFPO,
  deleteFPO,
  updateFPOLocation,
  getFPOMembers,
  addFPOMember,
  removeFPOMember,
  updateFPOMemberRole,
  getUsers,
} from "@/lib/api";
import { LocationSelector, LocationValue } from "@/components/LocationSelector";
import { toast } from "sonner";

type FPO = {
  id: string;
  name: string;
  nameLocal?: string;
  registrationNumber?: string;
  phone?: string;
  email?: string;
  address?: string;
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
  _count?: {
    members: number;
  };
};

type FPOMember = {
  id: string;
  role: string;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    nameLocal?: string;
    phone?: string;
    type: string;
    village?: {
      name: string;
      block: {
        district: {
          name: string;
        };
      };
    };
  };
};

type FarmerUser = {
  id: string;
  name: string;
  phone?: string;
  village?: {
    name: string;
    block: {
      district: {
        name: string;
      };
    };
  };
};

type CreateFPOForm = {
  name: string;
  nameLocal: string;
  registrationNumber: string;
  phone: string;
  email: string;
  address: string;
  location: LocationValue;
};

const initialFormState: CreateFPOForm = {
  name: "",
  nameLocal: "",
  registrationNumber: "",
  phone: "",
  email: "",
  address: "",
  location: {},
};

export function FPOs() {
  const [search, setSearch] = useState("");
  const [fpos, setFpos] = useState<FPO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Expanded FPO for member view
  const [expandedFpoId, setExpandedFpoId] = useState<string | null>(null);
  const [membersLoading, setMembersLoading] = useState(false);
  const [members, setMembers] = useState<FPOMember[]>([]);

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [removeMemberDialogOpen, setRemoveMemberDialogOpen] = useState(false);
  const [changeRoleDialogOpen, setChangeRoleDialogOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState<CreateFPOForm>(initialFormState);
  const [editingFpo, setEditingFpo] = useState<FPO | null>(null);
  const [deletingFpo, setDeletingFpo] = useState<FPO | null>(null);
  const [locationEditFpo, setLocationEditFpo] = useState<FPO | null>(null);
  const [locationValue, setLocationValue] = useState<LocationValue>({});
  const [selectedFpoForMember, setSelectedFpoForMember] = useState<FPO | null>(null);
  const [removingMember, setRemovingMember] = useState<FPOMember | null>(null);
  const [changingRoleMember, setChangingRoleMember] = useState<FPOMember | null>(null);
  const [newMemberRole, setNewMemberRole] = useState("member");

  // Available farmers for adding to FPO
  const [availableFarmers, setAvailableFarmers] = useState<FarmerUser[]>([]);
  const [farmersLoading, setFarmersLoading] = useState(false);
  const [selectedFarmerId, setSelectedFarmerId] = useState<string>("");
  const [farmerSearch, setFarmerSearch] = useState("");

  // Loading states
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadFPOs();
  }, []);

  const loadFPOs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getFPOs({ limit: 100 }) as { success: boolean; data?: { fpos: FPO[] } };
      if (response.success && response.data) {
        setFpos(response.data.fpos || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load FPOs");
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async (fpoId: string) => {
    try {
      setMembersLoading(true);
      const response = await getFPOMembers(fpoId, { limit: 100 }) as {
        success: boolean;
        data?: { members: FPOMember[] };
      };
      if (response.success && response.data) {
        setMembers(response.data.members || []);
      }
    } catch (err) {
      console.error("Failed to load members:", err);
      toast.error("Failed to load FPO members");
    } finally {
      setMembersLoading(false);
    }
  };

  const loadAvailableFarmers = async () => {
    try {
      setFarmersLoading(true);
      const response = await getUsers({ type: "farmer", limit: 200 }) as {
        success: boolean;
        data?: { users: FarmerUser[] };
      };
      if (response.success && response.data) {
        setAvailableFarmers(response.data.users || []);
      }
    } catch (err) {
      console.error("Failed to load farmers:", err);
    } finally {
      setFarmersLoading(false);
    }
  };

  const toggleExpand = async (fpoId: string) => {
    if (expandedFpoId === fpoId) {
      setExpandedFpoId(null);
      setMembers([]);
    } else {
      setExpandedFpoId(fpoId);
      await loadMembers(fpoId);
    }
  };

  const filteredFPOs = fpos.filter(
    (fpo) =>
      fpo.name.toLowerCase().includes(search.toLowerCase()) ||
      (fpo.registrationNumber?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  const fposWithoutLocation = fpos.filter((f) => !f.village).length;

  // Filtered available farmers (exclude those already members)
  const filteredFarmers = availableFarmers.filter((farmer) => {
    // Filter out farmers already in the FPO
    const isMember = members.some((m) => m.user.id === farmer.id);
    if (isMember) return false;

    // Apply search filter
    if (!farmerSearch) return true;
    const searchLower = farmerSearch.toLowerCase();
    return (
      farmer.name.toLowerCase().includes(searchLower) ||
      (farmer.phone?.includes(searchLower) ?? false)
    );
  });

  // Create FPO handler
  const handleCreateFPO = async () => {
    if (!formData.name) {
      toast.error("Name is required");
      return;
    }

    try {
      setSaving(true);
      await createFPO({
        name: formData.name,
        nameLocal: formData.nameLocal || undefined,
        registrationNumber: formData.registrationNumber || undefined,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        address: formData.address || undefined,
        villageId: formData.location.villageId,
      });
      toast.success("FPO created successfully");
      setCreateDialogOpen(false);
      setFormData(initialFormState);
      loadFPOs();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create FPO");
    } finally {
      setSaving(false);
    }
  };

  // Edit FPO handler
  const handleEditFPO = async () => {
    if (!editingFpo) return;

    try {
      setSaving(true);
      await updateFPO(editingFpo.id, {
        name: formData.name,
        nameLocal: formData.nameLocal || null,
        registrationNumber: formData.registrationNumber || null,
        phone: formData.phone || null,
        email: formData.email || null,
        address: formData.address || null,
      });
      toast.success("FPO updated successfully");
      setEditDialogOpen(false);
      setEditingFpo(null);
      setFormData(initialFormState);
      loadFPOs();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update FPO");
    } finally {
      setSaving(false);
    }
  };

  // Delete FPO handler
  const handleDeleteFPO = async () => {
    if (!deletingFpo) return;

    try {
      setSaving(true);
      await deleteFPO(deletingFpo.id);
      toast.success("FPO deleted successfully");
      setDeleteDialogOpen(false);
      setDeletingFpo(null);
      loadFPOs();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete FPO");
    } finally {
      setSaving(false);
    }
  };

  // Update location handler
  const handleUpdateLocation = async () => {
    if (!locationEditFpo || !locationValue.villageId) return;

    try {
      setSaving(true);
      await updateFPOLocation(locationEditFpo.id, locationValue.villageId);
      toast.success("Location updated successfully");
      setLocationDialogOpen(false);
      setLocationEditFpo(null);
      setLocationValue({});
      loadFPOs();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update location");
    } finally {
      setSaving(false);
    }
  };

  // Add member handler
  const handleAddMember = async () => {
    if (!selectedFpoForMember || !selectedFarmerId) return;

    try {
      setSaving(true);
      await addFPOMember(selectedFpoForMember.id, selectedFarmerId, newMemberRole);
      toast.success("Member added successfully");
      setAddMemberDialogOpen(false);
      setSelectedFarmerId("");
      setNewMemberRole("member");
      setFarmerSearch("");
      await loadMembers(selectedFpoForMember.id);
      loadFPOs(); // Refresh member count
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add member");
    } finally {
      setSaving(false);
    }
  };

  // Remove member handler
  const handleRemoveMember = async () => {
    if (!selectedFpoForMember || !removingMember) return;

    try {
      setSaving(true);
      await removeFPOMember(selectedFpoForMember.id, removingMember.user.id);
      toast.success("Member removed successfully");
      setRemoveMemberDialogOpen(false);
      setRemovingMember(null);
      await loadMembers(selectedFpoForMember.id);
      loadFPOs(); // Refresh member count
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove member");
    } finally {
      setSaving(false);
    }
  };

  // Change member role handler
  const handleChangeRole = async () => {
    if (!selectedFpoForMember || !changingRoleMember) return;

    try {
      setSaving(true);
      await updateFPOMemberRole(selectedFpoForMember.id, changingRoleMember.user.id, newMemberRole);
      toast.success("Role updated successfully");
      setChangeRoleDialogOpen(false);
      setChangingRoleMember(null);
      setNewMemberRole("member");
      await loadMembers(selectedFpoForMember.id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setSaving(false);
    }
  };

  // Open edit dialog
  const openEditDialog = (fpo: FPO) => {
    setEditingFpo(fpo);
    setFormData({
      name: fpo.name,
      nameLocal: fpo.nameLocal || "",
      registrationNumber: fpo.registrationNumber || "",
      phone: fpo.phone || "",
      email: fpo.email || "",
      address: fpo.address || "",
      location: {},
    });
    setEditDialogOpen(true);
  };

  // Open location dialog
  const openLocationDialog = (fpo: FPO) => {
    setLocationEditFpo(fpo);
    if (fpo.village) {
      setLocationValue({
        stateCode: fpo.village.block.district.state.code,
        districtId: fpo.village.block.district.id,
        blockId: fpo.village.block.id,
        villageId: fpo.village.id,
      });
    } else {
      setLocationValue({});
    }
    setLocationDialogOpen(true);
  };

  // Open add member dialog
  const openAddMemberDialog = (fpo: FPO) => {
    setSelectedFpoForMember(fpo);
    setSelectedFarmerId("");
    setNewMemberRole("member");
    setFarmerSearch("");
    loadAvailableFarmers();
    setAddMemberDialogOpen(true);
  };

  const getFpoLocation = (fpo: FPO) => {
    if (!fpo.village) return null;
    return `${fpo.village.name}, ${fpo.village.block.district.name}`;
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
          <h1 className="text-3xl font-bold">FPOs</h1>
          <p className="text-muted-foreground">
            Manage Farmer Producer Organizations
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create FPO
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {fposWithoutLocation > 0 && (
        <Card className="border-orange-500 bg-orange-500/10">
          <CardContent className="flex items-center gap-4 py-4">
            <MapPin className="h-8 w-8 text-orange-500" />
            <div>
              <h3 className="font-medium">
                {fposWithoutLocation} FPOs without location
              </h3>
              <p className="text-sm text-muted-foreground">
                Assign locations to FPOs after import
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            FPO List ({fpos.length} total)
          </CardTitle>
          <CardDescription>
            {fpos.length === 0
              ? "No FPOs found. Create your first FPO or upload via CSV."
              : "Click on an FPO row to view and manage members"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or registration number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" onClick={loadFPOs}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {fpos.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No FPOs in the database yet.</p>
              <p className="text-sm mt-2">Create an FPO or go to CSV Upload to import FPOs.</p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Registration #</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFPOs.map((fpo) => (
                    <Collapsible
                      key={fpo.id}
                      open={expandedFpoId === fpo.id}
                      onOpenChange={() => toggleExpand(fpo.id)}
                      asChild
                    >
                      <>
                        <TableRow className="cursor-pointer hover:bg-muted/50">
                          <TableCell>
                            <CollapsibleTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                {expandedFpoId === fpo.id ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </Button>
                            </CollapsibleTrigger>
                          </TableCell>
                          <TableCell className="font-medium">
                            {fpo.name}
                            {fpo.nameLocal && (
                              <span className="block text-sm text-muted-foreground">
                                {fpo.nameLocal}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {fpo.registrationNumber ? (
                              <code className="text-xs bg-muted px-2 py-1 rounded">
                                {fpo.registrationNumber}
                              </code>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              <Users className="mr-1 h-3 w-3" />
                              {fpo._count?.members ?? 0}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {getFpoLocation(fpo) ? (
                              <span className="text-sm">{getFpoLocation(fpo)}</span>
                            ) : (
                              <Badge variant="outline" className="text-orange-500 border-orange-500">
                                Not Set
                              </Badge>
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
                                <DropdownMenuItem onClick={() => openEditDialog(fpo)}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openLocationDialog(fpo)}>
                                  <MapPin className="mr-2 h-4 w-4" />
                                  {fpo.village ? "Change Location" : "Assign Location"}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openAddMemberDialog(fpo)}>
                                  <UserPlus className="mr-2 h-4 w-4" />
                                  Add Member
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setDeletingFpo(fpo);
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
                        <CollapsibleContent asChild>
                          <TableRow className="bg-muted/30">
                            <TableCell colSpan={6} className="p-0">
                              <div className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="font-medium text-sm">
                                    Members ({members.length})
                                  </h4>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openAddMemberDialog(fpo)}
                                  >
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Add Member
                                  </Button>
                                </div>

                                {membersLoading ? (
                                  <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                  </div>
                                ) : members.length === 0 ? (
                                  <div className="text-center py-6 text-muted-foreground text-sm">
                                    No members yet. Add farmers to this FPO.
                                  </div>
                                ) : (
                                  <div className="border rounded-lg overflow-hidden">
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>Name</TableHead>
                                          <TableHead>Phone</TableHead>
                                          <TableHead>Role</TableHead>
                                          <TableHead>Joined</TableHead>
                                          <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {members.map((member) => (
                                          <TableRow key={member.id}>
                                            <TableCell>
                                              {member.user.name}
                                              {member.user.nameLocal && (
                                                <span className="block text-xs text-muted-foreground">
                                                  {member.user.nameLocal}
                                                </span>
                                              )}
                                            </TableCell>
                                            <TableCell>{member.user.phone || "-"}</TableCell>
                                            <TableCell>
                                              <Badge
                                                variant={
                                                  member.role === "admin"
                                                    ? "default"
                                                    : member.role === "manager"
                                                    ? "secondary"
                                                    : "outline"
                                                }
                                              >
                                                {member.role}
                                              </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                              {new Date(member.joinedAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                              <div className="flex justify-end gap-1">
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() => {
                                                    setSelectedFpoForMember(fpo);
                                                    setChangingRoleMember(member);
                                                    setNewMemberRole(member.role);
                                                    setChangeRoleDialogOpen(true);
                                                  }}
                                                >
                                                  Change Role
                                                </Button>
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  className="text-destructive hover:text-destructive"
                                                  onClick={() => {
                                                    setSelectedFpoForMember(fpo);
                                                    setRemovingMember(member);
                                                    setRemoveMemberDialogOpen(true);
                                                  }}
                                                >
                                                  <UserMinus className="h-4 w-4" />
                                                </Button>
                                              </div>
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        </CollapsibleContent>
                      </>
                    </Collapsible>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create FPO Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create FPO</DialogTitle>
            <DialogDescription>Add a new Farmer Producer Organization</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter FPO name"
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
              <Label>Registration Number</Label>
              <Input
                value={formData.registrationNumber}
                onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                placeholder="Enter registration number"
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
              <Label>Address</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter address"
              />
            </div>

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
            <Button onClick={handleCreateFPO} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create FPO
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit FPO Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
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
              <Label>Registration Number</Label>
              <Input
                value={formData.registrationNumber}
                onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
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
            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditFPO} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete FPO Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete FPO</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {deletingFpo?.name}? This will also remove all member associations.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteFPO} disabled={saving}>
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
              {locationEditFpo?.village ? "Change Location" : "Assign Location"}
            </DialogTitle>
            <DialogDescription>
              Set location for {locationEditFpo?.name}
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

      {/* Add Member Dialog */}
      <Dialog open={addMemberDialogOpen} onOpenChange={setAddMemberDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Member</DialogTitle>
            <DialogDescription>
              Add a farmer to {selectedFpoForMember?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Search Farmer</Label>
              <Input
                value={farmerSearch}
                onChange={(e) => setFarmerSearch(e.target.value)}
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
                <Select value={selectedFarmerId} onValueChange={setSelectedFarmerId}>
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
              <Select value={newMemberRole} onValueChange={setNewMemberRole}>
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
            <Button variant="outline" onClick={() => setAddMemberDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMember} disabled={saving || !selectedFarmerId}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Dialog */}
      <Dialog open={removeMemberDialogOpen} onOpenChange={setRemoveMemberDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {removingMember?.user.name} from {selectedFpoForMember?.name}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveMemberDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemoveMember} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog open={changeRoleDialogOpen} onOpenChange={setChangeRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Role</DialogTitle>
            <DialogDescription>
              Update role for {changingRoleMember?.user.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>New Role</Label>
              <Select value={newMemberRole} onValueChange={setNewMemberRole}>
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
            <Button variant="outline" onClick={() => setChangeRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangeRole} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
