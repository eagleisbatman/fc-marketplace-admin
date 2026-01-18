import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Building2,
  Users,
  UserCog,
  FileText,
  MapPin,
  Loader2,
  AlertCircle,
  Plus,
  Search,
  Pencil,
  Trash2,
  Phone,
  Mail,
  Upload,
  X,
} from "lucide-react";
import { getFPO, getFPOMembers } from "@/lib/api";
import type { FPO, FPOMember } from "@/types/fpo.types";
import { toast } from "sonner";

// Staff role options
const STAFF_ROLES = [
  { value: "ceo", label: "CEO" },
  { value: "secretary", label: "Secretary" },
  { value: "treasurer", label: "Treasurer" },
  { value: "data_officer", label: "Data Officer" },
];

// Document type options
const DOCUMENT_TYPES = [
  { value: "registration", label: "Registration Certificate" },
  { value: "annual_report", label: "Annual Report" },
  { value: "audit_report", label: "Audit Report" },
  { value: "license", label: "License" },
  { value: "other", label: "Other" },
];

type FPOStaff = {
  id: string;
  staffRole: string;
  user: {
    id: string;
    name: string;
    phone?: string;
  };
};

type FPODocument = {
  id: string;
  name: string;
  type: string;
  fileUrl: string;
  createdAt: string;
};

export function FPODetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [fpo, setFpo] = useState<FPO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tab data (setStaff and setDocuments will be used when API is connected)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [staff, _setStaff] = useState<FPOStaff[]>([]);
  const [members, setMembers] = useState<FPOMember[]>([]);
  const [associated, setAssociated] = useState<FPOMember[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [documents, _setDocuments] = useState<FPODocument[]>([]);

  // Loading states
  const [membersLoading, setMembersLoading] = useState(false);

  // Search states
  const [memberSearch, setMemberSearch] = useState("");
  const [associatedSearch, setAssociatedSearch] = useState("");

  // Dialog states
  const [addStaffOpen, setAddStaffOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [uploadDocOpen, setUploadDocOpen] = useState(false);

  useEffect(() => {
    if (id) {
      loadFPO();
      loadMembers();
    }
  }, [id]);

  const loadFPO = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = (await getFPO(id!)) as {
        success: boolean;
        data?: { fpo: FPO };
      };
      if (response.success && response.data) {
        setFpo(response.data.fpo);
      }
    } catch (err) {
      console.error("Failed to load FPO:", err);
      setError("Failed to load FPO details");
      toast.error("Failed to load FPO");
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async () => {
    try {
      setMembersLoading(true);
      const response = (await getFPOMembers(id!)) as {
        success: boolean;
        data?: { members: FPOMember[] };
      };
      if (response.success && response.data) {
        // Separate members and associated based on membershipType
        const allMembers = response.data.members;
        setMembers(allMembers.filter((m) => (m as any).membershipType !== "associated"));
        setAssociated(allMembers.filter((m) => (m as any).membershipType === "associated"));
      }
    } catch (err) {
      console.error("Failed to load members:", err);
    } finally {
      setMembersLoading(false);
    }
  };

  const formatLocation = (fpo: FPO): string => {
    if (!fpo.village) return "No location set";
    return `${fpo.village.name}, ${fpo.village.block.name}, ${fpo.village.block.district.name}, ${fpo.village.block.district.state.name}`;
  };

  const filteredMembers = memberSearch
    ? members.filter(
        (m) =>
          m.user.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
          m.user.phone?.includes(memberSearch)
      )
    : members;

  const filteredAssociated = associatedSearch
    ? associated.filter(
        (m) =>
          m.user.name.toLowerCase().includes(associatedSearch.toLowerCase()) ||
          m.user.phone?.includes(associatedSearch)
      )
    : associated;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !fpo) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate("/dashboard/fpos")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to FPOs
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "FPO not found"}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/fpos")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">{fpo.name}</h1>
              {fpo.nameLocal && (
                <p className="text-muted-foreground">{fpo.nameLocal}</p>
              )}
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="associated">Associated</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="coverage">Coverage</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>FPO Profile</CardTitle>
              <CardDescription>Basic information about this FPO</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Name</Label>
                  <p className="font-medium">{fpo.name}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Local Name</Label>
                  <p className="font-medium">{fpo.nameLocal || "—"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Registration Number</Label>
                  <p className="font-medium">{fpo.registrationNumber || "—"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Phone</Label>
                  <p className="font-medium flex items-center gap-2">
                    {fpo.phone ? (
                      <>
                        <Phone className="h-4 w-4" />
                        {fpo.phone}
                      </>
                    ) : (
                      "—"
                    )}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium flex items-center gap-2">
                    {fpo.email ? (
                      <>
                        <Mail className="h-4 w-4" />
                        {fpo.email}
                      </>
                    ) : (
                      "—"
                    )}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Address</Label>
                  <p className="font-medium">{fpo.address || "—"}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Operating Location
                  </Label>
                  <p className="font-medium">{formatLocation(fpo)}</p>
                </div>
              </div>

              <div className="border-t pt-4 grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-3xl font-bold text-primary">{members.length}</div>
                  <div className="text-sm text-muted-foreground">Members</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">{associated.length}</div>
                  <div className="text-sm text-muted-foreground">Associated</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">{staff.length}</div>
                  <div className="text-sm text-muted-foreground">Staff</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Staff Tab */}
        <TabsContent value="staff">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <UserCog className="h-5 w-5" />
                    FPO Staff
                  </CardTitle>
                  <CardDescription>
                    CEO, Secretary, Treasurer, Data Officer, and other staff members
                  </CardDescription>
                </div>
                <Button size="sm" onClick={() => setAddStaffOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Staff
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {staff.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <UserCog className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No staff assigned yet</p>
                  <p className="text-sm">Add CEO, Secretary, Treasurer, or other staff members</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staff.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {s.staffRole.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{s.user.name}</TableCell>
                        <TableCell>{s.user.phone || "—"}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {/* Placeholder for unassigned roles */}
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Quick assign:</p>
                <div className="flex flex-wrap gap-2">
                  {STAFF_ROLES.filter((r) => !staff.some((s) => s.staffRole === r.value)).map(
                    (role) => (
                      <Button key={role.value} variant="outline" size="sm">
                        <Plus className="mr-1 h-3 w-3" />
                        Add {role.label}
                      </Button>
                    )
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Members ({members.length})
                  </CardTitle>
                  <CardDescription>Official registered members of this FPO</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Excel
                  </Button>
                  <Button size="sm" onClick={() => setAddMemberOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Member
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or phone..."
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {membersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : filteredMembers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {memberSearch ? "No members found matching your search" : "No members yet"}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell>
                          <div className="font-medium">{m.user.name}</div>
                          {m.user.nameLocal && (
                            <div className="text-sm text-muted-foreground">
                              {m.user.nameLocal}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {m.user.phone ? (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {m.user.phone}
                            </span>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>{new Date(m.joinedAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="text-destructive">
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Associated Tab */}
        <TabsContent value="associated">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Associated Farmers ({associated.length})
                  </CardTitle>
                  <CardDescription>
                    Non-member farmers who route their interests through this FPO
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or phone..."
                    value={associatedSearch}
                    onChange={(e) => setAssociatedSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {filteredAssociated.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No associated farmers yet</p>
                  <p className="text-sm">
                    Farmers can associate with this FPO through the mobile app
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Associated Since</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssociated.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell>
                          <div className="font-medium">{m.user.name}</div>
                        </TableCell>
                        <TableCell>
                          {m.user.phone ? (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {m.user.phone}
                            </span>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>{new Date(m.joinedAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Documents ({documents.length})
                  </CardTitle>
                  <CardDescription>
                    Registration certificates, reports, and other documents
                  </CardDescription>
                </div>
                <Button size="sm" onClick={() => setUploadDocOpen(true)}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No documents uploaded yet</p>
                  <p className="text-sm">
                    Upload registration certificates, annual reports, or other documents
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">{doc.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {doc.type.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(doc.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon">
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Coverage Tab */}
        <TabsContent value="coverage">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Coverage Areas
                  </CardTitle>
                  <CardDescription>
                    Regions where this FPO operates and can serve farmers
                  </CardDescription>
                </div>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Coverage
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No coverage areas defined yet</p>
                <p className="text-sm">
                  Add states, districts, or blocks where this FPO operates
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Staff Dialog */}
      <Dialog open={addStaffOpen} onOpenChange={setAddStaffOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Staff Member</DialogTitle>
            <DialogDescription>
              Assign a staff role to this FPO
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Role *</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {STAFF_ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Custom Role...</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Person *</Label>
              <Input placeholder="Search by name or phone..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddStaffOpen(false)}>
              Cancel
            </Button>
            <Button>Add Staff</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Member</DialogTitle>
            <DialogDescription>
              Add a farmer as an official member of this FPO
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Search Farmer *</Label>
              <Input placeholder="Search by name or phone..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddMemberOpen(false)}>
              Cancel
            </Button>
            <Button>Add Member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Document Dialog */}
      <Dialog open={uploadDocOpen} onOpenChange={setUploadDocOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload a document for this FPO
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Document Name *</Label>
              <Input placeholder="e.g., Registration Certificate 2024" />
            </div>
            <div className="space-y-2">
              <Label>Type *</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>File URL *</Label>
              <Input placeholder="https://drive.google.com/..." />
              <p className="text-xs text-muted-foreground">
                Paste a Google Drive or other cloud storage link
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDocOpen(false)}>
              Cancel
            </Button>
            <Button>Upload</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
