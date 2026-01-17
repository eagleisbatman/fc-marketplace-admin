import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building2, MapPin, Loader2, AlertCircle, Plus } from "lucide-react";
import { useFPOs } from "@/hooks/useFPOs";
import {
  FPOTable,
  FPOFilters,
  FPOPagination,
  CreateFPODialog,
  EditFPODialog,
  DeleteFPODialog,
  LocationDialog,
  AddMemberDialog,
  RemoveMemberDialog,
  ChangeRoleDialog,
  AddDocumentDialog,
  DeleteDocumentDialog,
} from "@/components/fpos";
import type { FPO, FPOMember, CreateFPOForm, DocumentForm } from "@/types/fpo.types";
import type { LocationValue } from "@/components/LocationSelector";
import type { FpoDocument } from "@/lib/api";

const defaultFormState: CreateFPOForm = {
  name: "",
  nameLocal: "",
  registrationNumber: "",
  phone: "",
  email: "",
  address: "",
  location: {},
};

const defaultDocumentForm: DocumentForm = {
  name: "",
  type: "registration",
  description: "",
  fileUrl: "",
};

export function FPOs() {
  const {
    fpos,
    loading,
    error,
    pagination,
    filters,
    hasActiveFilters,
    expandedFpoId,
    members,
    membersLoading,
    documents,
    documentsLoading,
    availableFarmers,
    farmersLoading,
    loadFPOs,
    loadAvailableFarmers,
    loadMembers,
    loadDocuments,
    toggleExpand,
    handleCreateFPO,
    handleUpdateFPO,
    handleDeleteFPO,
    handleUpdateLocation,
    handleAddMember,
    handleRemoveMember,
    handleChangeRole,
    handleAddDocument,
    handleDeleteDocument,
    setCurrentPage,
    setPageSize,
    updateFilters,
    clearFilters,
  } = useFPOs();

  // Dialog states
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [removeMemberDialogOpen, setRemoveMemberDialogOpen] = useState(false);
  const [changeRoleDialogOpen, setChangeRoleDialogOpen] = useState(false);
  const [addDocumentDialogOpen, setAddDocumentDialogOpen] = useState(false);
  const [deleteDocumentDialogOpen, setDeleteDocumentDialogOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState<CreateFPOForm>(defaultFormState);
  const [editingFpo, setEditingFpo] = useState<FPO | null>(null);
  const [deletingFpo, setDeletingFpo] = useState<FPO | null>(null);
  const [locationEditFpo, setLocationEditFpo] = useState<FPO | null>(null);
  const [locationValue, setLocationValue] = useState<LocationValue>({});
  const [selectedFpoForMember, setSelectedFpoForMember] = useState<FPO | null>(null);
  const [removingMember, setRemovingMember] = useState<FPOMember | null>(null);
  const [changingRoleMember, setChangingRoleMember] = useState<FPOMember | null>(null);
  const [newMemberRole, setNewMemberRole] = useState("member");
  const [selectedFarmerId, setSelectedFarmerId] = useState<string>("");
  const [farmerSearch, setFarmerSearch] = useState("");
  const [documentForm, setDocumentForm] = useState<DocumentForm>(defaultDocumentForm);
  const [deletingDocument, setDeletingDocument] = useState<FpoDocument | null>(null);

  // Loading state
  const [saving, setSaving] = useState(false);

  const fposWithoutLocation = fpos.filter((f) => !f.village).length;

  // Handlers
  const handleOpenEditDialog = (fpo: FPO) => {
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

  const handleOpenLocationDialog = (fpo: FPO) => {
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

  const handleOpenAddMemberDialog = (fpo: FPO) => {
    setSelectedFpoForMember(fpo);
    setSelectedFarmerId("");
    setNewMemberRole("member");
    setFarmerSearch("");
    loadAvailableFarmers();
    setAddMemberDialogOpen(true);
  };

  const handleOpenAddDocumentDialog = (fpo: FPO) => {
    setSelectedFpoForMember(fpo);
    setDocumentForm(defaultDocumentForm);
    setAddDocumentDialogOpen(true);
  };

  const handleSubmitCreate = async () => {
    setSaving(true);
    const success = await handleCreateFPO(formData);
    setSaving(false);
    if (success) {
      setCreateDialogOpen(false);
      setFormData(defaultFormState);
      loadFPOs();
    }
  };

  const handleSubmitEdit = async () => {
    if (!editingFpo) return;
    setSaving(true);
    const success = await handleUpdateFPO(editingFpo.id, formData);
    setSaving(false);
    if (success) {
      setEditDialogOpen(false);
      setEditingFpo(null);
      setFormData(defaultFormState);
      loadFPOs();
    }
  };

  const handleSubmitDelete = async () => {
    if (!deletingFpo) return;
    setSaving(true);
    const success = await handleDeleteFPO(deletingFpo.id);
    setSaving(false);
    if (success) {
      setDeleteDialogOpen(false);
      setDeletingFpo(null);
      loadFPOs();
    }
  };

  const handleSubmitLocation = async () => {
    if (!locationEditFpo || !locationValue.villageId) return;
    setSaving(true);
    const success = await handleUpdateLocation(
      locationEditFpo.id,
      locationValue.villageId
    );
    setSaving(false);
    if (success) {
      setLocationDialogOpen(false);
      setLocationEditFpo(null);
      setLocationValue({});
      loadFPOs();
    }
  };

  const handleSubmitAddMember = async () => {
    if (!selectedFpoForMember || !selectedFarmerId) return;
    setSaving(true);
    const success = await handleAddMember(
      selectedFpoForMember.id,
      selectedFarmerId,
      newMemberRole
    );
    setSaving(false);
    if (success) {
      setAddMemberDialogOpen(false);
      setSelectedFarmerId("");
      setNewMemberRole("member");
      setFarmerSearch("");
      await loadMembers(selectedFpoForMember.id);
      loadFPOs();
    }
  };

  const handleSubmitRemoveMember = async () => {
    if (!selectedFpoForMember || !removingMember) return;
    setSaving(true);
    const success = await handleRemoveMember(
      selectedFpoForMember.id,
      removingMember.user.id
    );
    setSaving(false);
    if (success) {
      setRemoveMemberDialogOpen(false);
      setRemovingMember(null);
      await loadMembers(selectedFpoForMember.id);
      loadFPOs();
    }
  };

  const handleSubmitChangeRole = async () => {
    if (!selectedFpoForMember || !changingRoleMember) return;
    setSaving(true);
    const success = await handleChangeRole(
      selectedFpoForMember.id,
      changingRoleMember.user.id,
      newMemberRole
    );
    setSaving(false);
    if (success) {
      setChangeRoleDialogOpen(false);
      setChangingRoleMember(null);
      setNewMemberRole("member");
      await loadMembers(selectedFpoForMember.id);
    }
  };

  const handleSubmitAddDocument = async () => {
    if (!selectedFpoForMember) return;
    setSaving(true);
    const success = await handleAddDocument(selectedFpoForMember.id, documentForm);
    setSaving(false);
    if (success) {
      setAddDocumentDialogOpen(false);
      setDocumentForm(defaultDocumentForm);
      await loadDocuments(selectedFpoForMember.id);
    }
  };

  const handleSubmitDeleteDocument = async () => {
    if (!selectedFpoForMember || !deletingDocument) return;
    setSaving(true);
    const success = await handleDeleteDocument(
      selectedFpoForMember.id,
      deletingDocument.id
    );
    setSaving(false);
    if (success) {
      setDeleteDocumentDialogOpen(false);
      setDeletingDocument(null);
      await loadDocuments(selectedFpoForMember.id);
    }
  };

  if (loading && fpos.length === 0) {
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

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Location Warning */}
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

      {/* Main Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            FPO List ({pagination.totalFpos.toLocaleString()} total)
          </CardTitle>
          <CardDescription>
            {pagination.totalFpos === 0
              ? "No FPOs found. Create your first FPO or upload via CSV."
              : "Click on an FPO row to view and manage members"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <FPOFilters
            filters={filters}
            showAdvancedFilters={showAdvancedFilters}
            hasActiveFilters={hasActiveFilters}
            onShowAdvancedFiltersChange={setShowAdvancedFilters}
            onFiltersChange={updateFilters}
            onClearFilters={clearFilters}
            onRefresh={loadFPOs}
          />

          {/* Table */}
          <FPOTable
            fpos={fpos}
            expandedFpoId={expandedFpoId}
            members={members}
            membersLoading={membersLoading}
            documents={documents}
            documentsLoading={documentsLoading}
            onToggleExpand={toggleExpand}
            onEdit={handleOpenEditDialog}
            onEditLocation={handleOpenLocationDialog}
            onDelete={(fpo) => {
              setDeletingFpo(fpo);
              setDeleteDialogOpen(true);
            }}
            onAddMember={handleOpenAddMemberDialog}
            onAddDocument={handleOpenAddDocumentDialog}
            onRemoveMember={(fpo, member) => {
              setSelectedFpoForMember(fpo);
              setRemovingMember(member);
              setRemoveMemberDialogOpen(true);
            }}
            onChangeRole={(fpo, member) => {
              setSelectedFpoForMember(fpo);
              setChangingRoleMember(member);
              setNewMemberRole(member.role);
              setChangeRoleDialogOpen(true);
            }}
            onDeleteDocument={(fpo, doc) => {
              setSelectedFpoForMember(fpo);
              setDeletingDocument(doc);
              setDeleteDocumentDialogOpen(true);
            }}
          />

          {/* Pagination */}
          <FPOPagination
            pagination={pagination}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateFPODialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        formData={formData}
        onFormChange={setFormData}
        onSubmit={handleSubmitCreate}
        saving={saving}
      />

      <EditFPODialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        fpo={editingFpo}
        formData={formData}
        onFormChange={setFormData}
        onSubmit={handleSubmitEdit}
        saving={saving}
      />

      <DeleteFPODialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        fpo={deletingFpo}
        onConfirm={handleSubmitDelete}
        saving={saving}
      />

      <LocationDialog
        open={locationDialogOpen}
        onOpenChange={setLocationDialogOpen}
        fpo={locationEditFpo}
        locationValue={locationValue}
        onLocationChange={setLocationValue}
        onSave={handleSubmitLocation}
        saving={saving}
      />

      <AddMemberDialog
        open={addMemberDialogOpen}
        onOpenChange={setAddMemberDialogOpen}
        fpo={selectedFpoForMember}
        farmers={availableFarmers}
        farmersLoading={farmersLoading}
        selectedFarmerId={selectedFarmerId}
        onFarmerSelect={setSelectedFarmerId}
        farmerSearch={farmerSearch}
        onFarmerSearchChange={setFarmerSearch}
        role={newMemberRole}
        onRoleChange={setNewMemberRole}
        onSubmit={handleSubmitAddMember}
        saving={saving}
        members={members}
      />

      <RemoveMemberDialog
        open={removeMemberDialogOpen}
        onOpenChange={setRemoveMemberDialogOpen}
        fpo={selectedFpoForMember}
        member={removingMember}
        onConfirm={handleSubmitRemoveMember}
        saving={saving}
      />

      <ChangeRoleDialog
        open={changeRoleDialogOpen}
        onOpenChange={setChangeRoleDialogOpen}
        member={changingRoleMember}
        role={newMemberRole}
        onRoleChange={setNewMemberRole}
        onSubmit={handleSubmitChangeRole}
        saving={saving}
      />

      <AddDocumentDialog
        open={addDocumentDialogOpen}
        onOpenChange={setAddDocumentDialogOpen}
        fpo={selectedFpoForMember}
        formData={documentForm}
        onFormChange={setDocumentForm}
        onSubmit={handleSubmitAddDocument}
        saving={saving}
      />

      <DeleteDocumentDialog
        open={deleteDocumentDialogOpen}
        onOpenChange={setDeleteDocumentDialogOpen}
        document={deletingDocument}
        onConfirm={handleSubmitDeleteDocument}
        saving={saving}
      />
    </div>
  );
}
