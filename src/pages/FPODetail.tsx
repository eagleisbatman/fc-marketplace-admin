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
  ExternalLink,
} from "lucide-react";
import {
  getFPO,
  getFPOMembers,
  getFpoStaff,
  addFpoStaff,
  removeFpoStaff,
  getFpoDocuments,
  addFpoDocument,
  deleteFpoDocument,
  getFpoCoverage,
  addFpoCoverage,
  deleteFpoCoverage,
  addFPOMember,
  removeFPOMember,
  getUsers,
  importUsers,
  updateFPO,
  createUser,
  type FpoStaff,
  type FpoDocument,
  type CoverageArea,
} from "@/lib/api";
import type { FPO, FPOMember } from "@/types/fpo.types";
import { toast } from "sonner";
import { CoverageSelector, type CoverageValue } from "@/components/CoverageSelector";
import { parseCSV, parseExcel, downloadTemplateExcel } from "@/components/import/importHelpers";

// Staff role options
const STAFF_ROLES = [
  { value: "ceo", label: "CEO" },
  { value: "secretary", label: "Secretary" },
  { value: "treasurer", label: "Treasurer" },
  { value: "data_officer", label: "Data Officer" },
];

// Document type options
const DOCUMENT_TYPES = [
  { value: "registration_certificate", label: "Registration Certificate" },
  { value: "annual_report", label: "Annual Report" },
  { value: "audit_report", label: "Audit Report" },
  { value: "member_list", label: "Member List" },
  { value: "other", label: "Other" },
];

export function FPODetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [fpo, setFpo] = useState<FPO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tab data
  const [staff, setStaff] = useState<FpoStaff[]>([]);
  const [members, setMembers] = useState<FPOMember[]>([]);
  const [associated, setAssociated] = useState<FPOMember[]>([]);
  const [documents, setDocuments] = useState<FpoDocument[]>([]);
  const [coverage, setCoverage] = useState<CoverageArea[]>([]);

  // Loading states
  const [staffLoading, setStaffLoading] = useState(false);
  const [membersLoading, setMembersLoading] = useState(false);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [coverageLoading, setCoverageLoading] = useState(false);

  // Search states
  const [memberSearch, setMemberSearch] = useState("");
  const [associatedSearch, setAssociatedSearch] = useState("");

  // Dialog states
  const [addStaffOpen, setAddStaffOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [uploadDocOpen, setUploadDocOpen] = useState(false);
  const [addCoverageOpen, setAddCoverageOpen] = useState(false);
  const [uploadFarmersOpen, setUploadFarmersOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  // Upload farmers state
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadData, setUploadData] = useState<Record<string, string>[]>([]);
  const [uploadPreview, setUploadPreview] = useState<Record<string, string>[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ imported: number; failed: number; errors: string[] } | null>(null);

  // Form states
  const [staffForm, setStaffForm] = useState({ userId: "", staffRole: "", userSearch: "" });
  const [memberForm, setMemberForm] = useState({ userId: "", userSearch: "", membershipType: "member" as "member" | "associated" });
  const [docForm, setDocForm] = useState({ name: "", type: "registration_certificate", description: "", fileUrl: "" });
  const [coverageForm, setCoverageForm] = useState<CoverageValue>({});
  const [editForm, setEditForm] = useState({
    name: "",
    nameLocal: "",
    registrationNumber: "",
    phone: "",
    email: "",
    address: "",
  });

  // User search results
  const [userSearchResults, setUserSearchResults] = useState<Array<{ id: string; name: string; phone?: string; type?: string }>>([]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);

  // Create user mode for staff dialog
  const [staffCreateMode, setStaffCreateMode] = useState(false);
  const [createUserForm, setCreateUserForm] = useState({
    name: "",
    nameLocal: "",
    phone: "",
    email: "",
  });
  const [creatingUser, setCreatingUser] = useState(false);

  // Saving states
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      loadFPO();
      loadStaff();
      loadMembers();
      loadDocuments();
      loadCoverage();
    }
  }, [id]);

  const loadFPO = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = (await getFPO(id!)) as {
        success: boolean;
        data?: FPO;
      };
      if (response.success && response.data) {
        setFpo(response.data);
      }
    } catch (err) {
      console.error("Failed to load FPO:", err);
      setError("Failed to load FPO details");
      toast.error("Failed to load FPO");
    } finally {
      setLoading(false);
    }
  };

  const loadStaff = async () => {
    try {
      setStaffLoading(true);
      const response = await getFpoStaff(id!);
      if (response.success && response.data) {
        setStaff(response.data.staff);
      }
    } catch (err) {
      console.error("Failed to load staff:", err);
    } finally {
      setStaffLoading(false);
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
        const allMembers = response.data.members;
        setMembers(allMembers.filter((m: FPOMember & { membershipType?: string }) => m.membershipType !== "associated"));
        setAssociated(allMembers.filter((m: FPOMember & { membershipType?: string }) => m.membershipType === "associated"));
      }
    } catch (err) {
      console.error("Failed to load members:", err);
    } finally {
      setMembersLoading(false);
    }
  };

  const loadDocuments = async () => {
    try {
      setDocumentsLoading(true);
      const response = await getFpoDocuments(id!);
      if (response.success && response.data) {
        setDocuments(response.data);
      }
    } catch (err) {
      console.error("Failed to load documents:", err);
    } finally {
      setDocumentsLoading(false);
    }
  };

  const loadCoverage = async () => {
    try {
      setCoverageLoading(true);
      const response = await getFpoCoverage(id!);
      if (response.success && response.data) {
        setCoverage(response.data.coverage);
      }
    } catch (err) {
      console.error("Failed to load coverage:", err);
    } finally {
      setCoverageLoading(false);
    }
  };

  const searchUsersDebounced = async (search: string) => {
    if (search.length < 2) {
      setUserSearchResults([]);
      return;
    }
    setUserSearchLoading(true);
    try {
      const response = await getUsers({ limit: 10 }) as {
        success: boolean;
        data?: { users: Array<{ id: string; name: string; phone?: string; type: string }> };
      };
      if (response.success && response.data) {
        // Filter by search term on client side since backend doesn't have search
        const filtered = response.data.users.filter(
          (u) =>
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.phone?.includes(search)
        );
        setUserSearchResults(filtered.slice(0, 10));
      }
    } catch (err) {
      console.error("Failed to search users:", err);
    } finally {
      setUserSearchLoading(false);
    }
  };

  const handleAddStaff = async () => {
    if (!staffForm.userId || !staffForm.staffRole) {
      toast.error("Please select a user and role");
      return;
    }
    setSaving(true);
    try {
      await addFpoStaff(id!, { userId: staffForm.userId, staffRole: staffForm.staffRole });
      toast.success("Staff member added");
      setAddStaffOpen(false);
      setStaffForm({ userId: "", staffRole: "", userSearch: "" });
      setUserSearchResults([]);
      setStaffCreateMode(false);
      setCreateUserForm({ name: "", nameLocal: "", phone: "", email: "" });
      loadStaff();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add staff");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateUserForStaff = async () => {
    if (!createUserForm.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!staffForm.staffRole) {
      toast.error("Please select a role first");
      return;
    }

    setCreatingUser(true);
    try {
      const response = await createUser({
        name: createUserForm.name.trim(),
        nameLocal: createUserForm.nameLocal.trim() || undefined,
        phone: createUserForm.phone.trim() || undefined,
        email: createUserForm.email.trim() || undefined,
        type: "partner", // Staff members are partners
      }) as { success: boolean; data?: { id: string; name: string } };

      if (response.success && response.data) {
        // Automatically add the new user as staff
        await addFpoStaff(id!, { userId: response.data.id, staffRole: staffForm.staffRole });
        toast.success(`Created user "${response.data.name}" and added as ${staffForm.staffRole}`);
        setAddStaffOpen(false);
        setStaffForm({ userId: "", staffRole: "", userSearch: "" });
        setStaffCreateMode(false);
        setCreateUserForm({ name: "", nameLocal: "", phone: "", email: "" });
        setUserSearchResults([]);
        loadStaff();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setCreatingUser(false);
    }
  };

  const handleRemoveStaff = async (staffId: string) => {
    try {
      await removeFpoStaff(id!, staffId);
      toast.success("Staff member removed");
      loadStaff();
    } catch {
      toast.error("Failed to remove staff");
    }
  };

  const handleAddMember = async () => {
    if (!memberForm.userId) {
      toast.error("Please select a farmer");
      return;
    }
    setSaving(true);
    try {
      await addFPOMember(id!, memberForm.userId, "member");
      toast.success("Member added");
      setAddMemberOpen(false);
      setMemberForm({ userId: "", userSearch: "", membershipType: "member" });
      setUserSearchResults([]);
      loadMembers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add member");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await removeFPOMember(id!, userId);
      toast.success("Member removed");
      loadMembers();
    } catch {
      toast.error("Failed to remove member");
    }
  };

  const handleUploadDocument = async () => {
    if (!docForm.name || !docForm.type || !docForm.fileUrl) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSaving(true);
    try {
      await addFpoDocument(id!, {
        name: docForm.name,
        type: docForm.type,
        description: docForm.description || undefined,
        fileUrl: docForm.fileUrl,
      });
      toast.success("Document uploaded");
      setUploadDocOpen(false);
      setDocForm({ name: "", type: "registration_certificate", description: "", fileUrl: "" });
      loadDocuments();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload document");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    try {
      await deleteFpoDocument(id!, docId);
      toast.success("Document deleted");
      loadDocuments();
    } catch {
      toast.error("Failed to delete document");
    }
  };

  const handleAddCoverage = async () => {
    if (!coverageForm.stateId) {
      toast.error("Please select at least a state");
      return;
    }
    setSaving(true);
    try {
      await addFpoCoverage(id!, {
        stateId: coverageForm.stateId,
        districtId: coverageForm.districtId || undefined,
        blockId: coverageForm.blockId || undefined,
        villageId: coverageForm.villageId || undefined,
      });
      toast.success("Coverage area added");
      setAddCoverageOpen(false);
      setCoverageForm({});
      loadCoverage();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add coverage");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCoverage = async (coverageId: string) => {
    try {
      await deleteFpoCoverage(id!, coverageId);
      toast.success("Coverage area removed");
      loadCoverage();
    } catch {
      toast.error("Failed to remove coverage");
    }
  };

  const handleOpenEdit = () => {
    if (!fpo) return;
    setEditForm({
      name: fpo.name,
      nameLocal: fpo.nameLocal || "",
      registrationNumber: fpo.registrationNumber || "",
      phone: fpo.phone || "",
      email: fpo.email || "",
      address: fpo.address || "",
    });
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editForm.name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      await updateFPO(id!, {
        name: editForm.name.trim(),
        nameLocal: editForm.nameLocal.trim() || undefined,
        registrationNumber: editForm.registrationNumber.trim() || undefined,
        phone: editForm.phone.trim() || undefined,
        email: editForm.email.trim() || undefined,
        address: editForm.address.trim() || undefined,
      });
      toast.success("FPO updated");
      setEditOpen(false);
      loadFPO();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update FPO");
    } finally {
      setSaving(false);
    }
  };

  // Farmer upload handlers
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadFileName(file.name);
    setUploadResult(null);

    try {
      const isExcel = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");
      let rows: Record<string, string>[];

      if (isExcel) {
        const buffer = await file.arrayBuffer();
        rows = parseExcel(buffer);
      } else {
        const text = await file.text();
        rows = parseCSV(text);
      }

      if (rows.length === 0) {
        toast.error("File appears to be empty");
        setUploadFileName("");
        return;
      }

      if (rows.length > 1000) {
        toast.error("Maximum 1000 rows per upload");
        setUploadFileName("");
        return;
      }

      setUploadData(rows);
      setUploadPreview(rows.slice(0, 5));
    } catch {
      toast.error("Failed to parse file");
      setUploadFileName("");
    }

    event.target.value = "";
  };

  const handleUploadFarmers = async () => {
    if (uploadData.length === 0) return;

    setUploading(true);
    try {
      const result = await importUsers(uploadData, "farmer", id!) as {
        success: boolean;
        imported: number;
        failed: number;
        errors: string[];
      };
      setUploadResult({ imported: result.imported, failed: result.failed, errors: result.errors });
      if (result.imported > 0) {
        toast.success(`Imported ${result.imported} farmers`);
        loadMembers();
      }
      if (result.failed > 0) {
        toast.warning(`${result.failed} rows failed`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleCloseUploadDialog = () => {
    setUploadFarmersOpen(false);
    setUploadFileName("");
    setUploadData([]);
    setUploadPreview([]);
    setUploadResult(null);
  };

  const handleDownloadTemplate = () => {
    downloadTemplateExcel(
      ["name", "nameLocal", "phone", "email", "fatherName", "village", "block", "district", "state"],
      "farmers_template",
      "Farmers"
    );
  };

  const formatLocation = (fpo: FPO): string => {
    if (!fpo.village) return "No location set";
    return `${fpo.village.name}, ${fpo.village.block.name}, ${fpo.village.block.district.name}, ${fpo.village.block.district.state.name}`;
  };

  const formatCoverage = (cov: CoverageArea): string => {
    const parts = [cov.state.name];
    if (cov.district) parts.push(cov.district.name);
    if (cov.block) parts.push(cov.block.name);
    if (cov.village) parts.push(cov.village.name);
    return parts.join(" > ");
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
        <Button variant="outline" size="sm" onClick={handleOpenEdit}>
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
              {staffLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : staff.length === 0 ? (
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
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleRemoveStaff(s.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {/* Quick assign buttons for unassigned roles */}
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Quick assign:</p>
                <div className="flex flex-wrap gap-2">
                  {STAFF_ROLES.filter((r) => !staff.some((s) => s.staffRole === r.value)).map(
                    (role) => (
                      <Button
                        key={role.value}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setStaffForm({ ...staffForm, staffRole: role.value });
                          setAddStaffOpen(true);
                        }}
                      >
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
                  <Button size="sm" variant="outline" onClick={() => setUploadFarmersOpen(true)}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Farmers
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
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleRemoveMember(m.user.id)}
                          >
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
              {documentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : documents.length === 0 ? (
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
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => window.open(doc.fileUrl, "_blank")}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleDeleteDocument(doc.id)}
                          >
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
                    Coverage Areas ({coverage.length})
                  </CardTitle>
                  <CardDescription>
                    Regions where this FPO operates and can serve farmers
                  </CardDescription>
                </div>
                <Button size="sm" onClick={() => setAddCoverageOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Coverage
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {coverageLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : coverage.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No coverage areas defined yet</p>
                  <p className="text-sm">
                    Add states, districts, or blocks where this FPO operates
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {coverage.map((cov) => (
                    <div
                      key={cov.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{formatCoverage(cov)}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleDeleteCoverage(cov.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Staff Dialog */}
      <Dialog open={addStaffOpen} onOpenChange={(open) => {
        setAddStaffOpen(open);
        if (!open) {
          setStaffCreateMode(false);
          setCreateUserForm({ name: "", nameLocal: "", phone: "", email: "" });
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Staff Member</DialogTitle>
            <DialogDescription>
              {staffCreateMode ? "Create a new user and assign as staff" : "Assign a staff role to this FPO"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Role *</Label>
              <Select
                value={staffForm.staffRole}
                onValueChange={(v) => setStaffForm({ ...staffForm, staffRole: v })}
              >
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

            {!staffCreateMode ? (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Person *</Label>
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-primary"
                      onClick={() => setStaffCreateMode(true)}
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      Create New User
                    </Button>
                  </div>
                  <Input
                    placeholder="Search by name or phone..."
                    value={staffForm.userSearch}
                    onChange={(e) => {
                      setStaffForm({ ...staffForm, userSearch: e.target.value });
                      searchUsersDebounced(e.target.value);
                    }}
                  />
                  {userSearchLoading && (
                    <div className="text-sm text-muted-foreground">Searching...</div>
                  )}
                  {userSearchResults.length > 0 && (
                    <div className="border rounded-md max-h-40 overflow-auto">
                      {userSearchResults.map((user) => (
                        <div
                          key={user.id}
                          className={`p-2 cursor-pointer hover:bg-muted ${
                            staffForm.userId === user.id ? "bg-muted" : ""
                          }`}
                          onClick={() =>
                            setStaffForm({
                              ...staffForm,
                              userId: user.id,
                              userSearch: user.name,
                            })
                          }
                        >
                          <div className="font-medium">{user.name}</div>
                          {user.phone && (
                            <div className="text-sm text-muted-foreground">{user.phone}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-base font-medium">Create New User</Label>
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="h-auto p-0"
                      onClick={() => setStaffCreateMode(false)}
                    >
                      <Search className="mr-1 h-3 w-3" />
                      Search Existing
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Name *</Label>
                      <Input
                        placeholder="Full name"
                        value={createUserForm.name}
                        onChange={(e) => setCreateUserForm({ ...createUserForm, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Local Name</Label>
                      <Input
                        placeholder="Name in local language"
                        value={createUserForm.nameLocal}
                        onChange={(e) => setCreateUserForm({ ...createUserForm, nameLocal: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input
                          placeholder="Phone number"
                          value={createUserForm.phone}
                          onChange={(e) => setCreateUserForm({ ...createUserForm, phone: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          placeholder="Email address"
                          value={createUserForm.email}
                          onChange={(e) => setCreateUserForm({ ...createUserForm, email: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddStaffOpen(false)}>
              Cancel
            </Button>
            {staffCreateMode ? (
              <Button onClick={handleCreateUserForStaff} disabled={creatingUser}>
                {creatingUser && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create & Add Staff
              </Button>
            ) : (
              <Button onClick={handleAddStaff} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Staff
              </Button>
            )}
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
              <Input
                placeholder="Search by name or phone..."
                value={memberForm.userSearch}
                onChange={(e) => {
                  setMemberForm({ ...memberForm, userSearch: e.target.value });
                  searchUsersDebounced(e.target.value);
                }}
              />
              {userSearchLoading && (
                <div className="text-sm text-muted-foreground">Searching...</div>
              )}
              {userSearchResults.length > 0 && (
                <div className="border rounded-md max-h-40 overflow-auto">
                  {userSearchResults
                    .filter((u) => u.type === "farmer")
                    .map((user) => (
                      <div
                        key={user.id}
                        className={`p-2 cursor-pointer hover:bg-muted ${
                          memberForm.userId === user.id ? "bg-muted" : ""
                        }`}
                        onClick={() =>
                          setMemberForm({
                            ...memberForm,
                            userId: user.id,
                            userSearch: user.name,
                          })
                        }
                      >
                        <div className="font-medium">{user.name}</div>
                        {user.phone && (
                          <div className="text-sm text-muted-foreground">{user.phone}</div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddMemberOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMember} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Farmers Dialog */}
      <Dialog open={uploadFarmersOpen} onOpenChange={handleCloseUploadDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Farmers</DialogTitle>
            <DialogDescription>
              Bulk upload farmers from a CSV or Excel file. They will be added as members of this FPO.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Download Template */}
            <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
              <div className="text-sm">
                <div className="font-medium">Need a template?</div>
                <div className="text-muted-foreground">Download the Excel template with required columns</div>
              </div>
              <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                Download Template
              </Button>
            </div>

            {/* File Input */}
            <div className="space-y-2">
              <Label>Select File</Label>
              <Input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
              />
              <p className="text-xs text-muted-foreground">
                Supports .csv, .xlsx, and .xls files (max 1000 rows)
              </p>
            </div>

            {/* Preview */}
            {uploadFileName && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Preview: {uploadFileName}</Label>
                  <Badge variant="secondary">{uploadData.length} rows</Badge>
                </div>
                {uploadPreview.length > 0 && (
                  <div className="border rounded-lg overflow-auto max-h-48">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {Object.keys(uploadPreview[0]).map((col) => (
                            <TableHead key={col} className="text-xs whitespace-nowrap">
                              {col}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {uploadPreview.map((row, i) => (
                          <TableRow key={i}>
                            {Object.values(row).map((val, j) => (
                              <TableCell key={j} className="text-xs py-1">
                                {val || "—"}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            )}

            {/* Upload Result */}
            {uploadResult && (
              <Alert variant={uploadResult.failed > 0 ? "destructive" : "default"}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div>Imported: {uploadResult.imported}, Failed: {uploadResult.failed}</div>
                  {uploadResult.errors.length > 0 && (
                    <ul className="mt-2 text-xs list-disc list-inside max-h-24 overflow-auto">
                      {uploadResult.errors.slice(0, 10).map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                      {uploadResult.errors.length > 10 && (
                        <li>...and {uploadResult.errors.length - 10} more errors</li>
                      )}
                    </ul>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseUploadDialog}>
              {uploadResult ? "Close" : "Cancel"}
            </Button>
            {!uploadResult && (
              <Button onClick={handleUploadFarmers} disabled={uploading || uploadData.length === 0}>
                {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Upload className="mr-2 h-4 w-4" />
                Upload {uploadData.length > 0 ? `${uploadData.length} Farmers` : ""}
              </Button>
            )}
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
              <Input
                placeholder="e.g., Registration Certificate 2024"
                value={docForm.name}
                onChange={(e) => setDocForm({ ...docForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Type *</Label>
              <Select
                value={docForm.type}
                onValueChange={(v) => setDocForm({ ...docForm, type: v })}
              >
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
              <Label>Description</Label>
              <Input
                placeholder="Optional description"
                value={docForm.description}
                onChange={(e) => setDocForm({ ...docForm, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>File URL *</Label>
              <Input
                placeholder="https://drive.google.com/..."
                value={docForm.fileUrl}
                onChange={(e) => setDocForm({ ...docForm, fileUrl: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Paste a Google Drive or other cloud storage link
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDocOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUploadDocument} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Coverage Dialog */}
      <Dialog open={addCoverageOpen} onOpenChange={setAddCoverageOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Coverage Area</DialogTitle>
            <DialogDescription>
              Select the region where this FPO operates
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <CoverageSelector
              value={coverageForm}
              onChange={setCoverageForm}
              showDistrict={true}
              showBlock={true}
              showVillage={true}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddCoverageOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCoverage} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Coverage
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit FPO Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit FPO</DialogTitle>
            <DialogDescription>
              Update FPO details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                placeholder="FPO Name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Local Name</Label>
              <Input
                placeholder="Name in local language"
                value={editForm.nameLocal}
                onChange={(e) => setEditForm({ ...editForm, nameLocal: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Registration Number</Label>
              <Input
                placeholder="Registration number"
                value={editForm.registrationNumber}
                onChange={(e) => setEditForm({ ...editForm, registrationNumber: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  placeholder="Phone number"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="Email address"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                placeholder="Address"
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
