import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Building2,
  MapPin,
  Loader2,
  AlertCircle,
  Plus,
  Search,
  Users,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { getFPOs, createFPO } from "@/lib/api";
import type { FPO } from "@/types/fpo.types";
import { toast } from "sonner";
import { CoverageSelector, type CoverageValue } from "@/components/CoverageSelector";

export function FPOsSimple() {
  const navigate = useNavigate();

  const [fpos, setFpos] = useState<FPO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    nameLocal: "",
    registrationNumber: "",
    phone: "",
    email: "",
    address: "",
  });
  const [createLocation, setCreateLocation] = useState<CoverageValue>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadFPOs();
  }, []);

  const loadFPOs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = (await getFPOs({ page: 1, limit: 100 })) as {
        success: boolean;
        data?: { fpos: FPO[] };
      };
      if (response.success && response.data) {
        setFpos(response.data.fpos);
      }
    } catch (err) {
      console.error("Failed to load FPOs:", err);
      setError("Failed to load FPOs");
      toast.error("Failed to load FPOs");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFPO = async () => {
    if (!createForm.name.trim()) {
      toast.error("Name is required");
      return;
    }

    setSaving(true);
    try {
      const response = await createFPO({
        name: createForm.name.trim(),
        nameLocal: createForm.nameLocal?.trim() || undefined,
        registrationNumber: createForm.registrationNumber?.trim() || undefined,
        phone: createForm.phone?.trim() || undefined,
        email: createForm.email?.trim() || undefined,
        address: createForm.address?.trim() || undefined,
        villageId: createLocation.villageId || undefined,
      }) as { success: boolean; data?: { fpo: FPO } };

      if (response.success) {
        toast.success("FPO created successfully");
        setCreateOpen(false);
        setCreateForm({
          name: "",
          nameLocal: "",
          registrationNumber: "",
          phone: "",
          email: "",
          address: "",
        });
        setCreateLocation({});
        loadFPOs();

        // Navigate to the new FPO detail page if we have the ID
        if (response.data?.fpo?.id) {
          navigate(`/dashboard/fpos/${response.data.fpo.id}`);
        }
      }
    } catch (err) {
      console.error("Failed to create FPO:", err);
      toast.error(err instanceof Error ? err.message : "Failed to create FPO");
    } finally {
      setSaving(false);
    }
  };

  const formatLocation = (fpo: FPO): string => {
    if (!fpo.village) return "No location";
    return `${fpo.village.block.district.name}, ${fpo.village.block.district.state.name}`;
  };

  const filteredFpos = search
    ? fpos.filter(
        (f) =>
          f.name.toLowerCase().includes(search.toLowerCase()) ||
          f.nameLocal?.toLowerCase().includes(search.toLowerCase()) ||
          f.registrationNumber?.toLowerCase().includes(search.toLowerCase())
      )
    : fpos;

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
        <Button onClick={() => setCreateOpen(true)}>
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

      {/* Main Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                FPO List ({fpos.length})
              </CardTitle>
              <CardDescription>
                Click on an FPO to view and manage details
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={loadFPOs} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or registration number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* FPO List */}
          {filteredFpos.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              {search ? (
                <p>No FPOs found matching "{search}"</p>
              ) : (
                <>
                  <p>No FPOs yet</p>
                  <p className="text-sm">Create your first FPO or upload via bulk import</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFpos.map((fpo) => (
                <div
                  key={fpo.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
                  onClick={() => navigate(`/dashboard/fpos/${fpo.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-lg">{fpo.name}</div>
                      {fpo.nameLocal && (
                        <div className="text-sm text-muted-foreground">
                          {fpo.nameLocal}
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {fpo._count?.members || 0} members
                        </span>
                        {fpo.village && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {formatLocation(fpo)}
                          </span>
                        )}
                        {fpo.registrationNumber && (
                          <Badge variant="outline" className="text-xs">
                            {fpo.registrationNumber}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create FPO Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New FPO</DialogTitle>
            <DialogDescription>
              Add a new Farmer Producer Organization
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, name: e.target.value })
                  }
                  placeholder="FPO name"
                />
              </div>
              <div className="space-y-2">
                <Label>Local Name</Label>
                <Input
                  value={createForm.nameLocal}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, nameLocal: e.target.value })
                  }
                  placeholder="Local language name"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Registration Number</Label>
                <Input
                  value={createForm.registrationNumber}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      registrationNumber: e.target.value,
                    })
                  }
                  placeholder="e.g., MH-FPO-2024-1234"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={createForm.phone}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, phone: e.target.value })
                  }
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={createForm.email}
                onChange={(e) =>
                  setCreateForm({ ...createForm, email: e.target.value })
                }
                placeholder="contact@fpo.org"
              />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                value={createForm.address}
                onChange={(e) =>
                  setCreateForm({ ...createForm, address: e.target.value })
                }
                placeholder="Full address"
              />
            </div>
            <div className="space-y-2">
              <Label>Operating Location</Label>
              <CoverageSelector
                value={createLocation}
                onChange={setCreateLocation}
                showDistrict={true}
                showBlock={true}
                showVillage={true}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFPO} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create FPO
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
