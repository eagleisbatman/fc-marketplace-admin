import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Loader2,
  AlertCircle,
  Search,
  Phone,
  UserPlus,
  Building2,
  RefreshCw,
} from "lucide-react";
import { getIndependentFarmers, associateFarmerWithFpo, getFPOs, type IndependentFarmer } from "@/lib/api";
import type { FPO } from "@/types/fpo.types";
import { toast } from "sonner";

export function IndependentFarmers() {
  const [farmers, setFarmers] = useState<IndependentFarmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Associate dialog state
  const [associateOpen, setAssociateOpen] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState<IndependentFarmer | null>(null);
  const [fpos, setFpos] = useState<FPO[]>([]);
  const [fposLoading, setFposLoading] = useState(false);
  const [selectedFpoId, setSelectedFpoId] = useState("");
  const [membershipType, setMembershipType] = useState<"member" | "associated">("associated");
  const [associating, setAssociating] = useState(false);

  const loadFarmers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getIndependentFarmers({
        page,
        limit: 20,
        search: search || undefined,
      });
      if (response.success && response.data) {
        setFarmers(response.data.farmers);
        setTotal(response.data.pagination.total);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (err) {
      console.error("Failed to load independent farmers:", err);
      setError("Failed to load independent farmers");
      toast.error("Failed to load independent farmers");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    loadFarmers();
  }, [loadFarmers]);

  const loadFpos = async () => {
    try {
      setFposLoading(true);
      const response = (await getFPOs({ page: 1, limit: 1000 })) as {
        success: boolean;
        data?: { fpos: FPO[] };
      };
      if (response.success && response.data) {
        setFpos(response.data.fpos);
      }
    } catch (err) {
      console.error("Failed to load FPOs:", err);
      toast.error("Failed to load FPOs");
    } finally {
      setFposLoading(false);
    }
  };

  const handleOpenAssociateDialog = (farmer: IndependentFarmer) => {
    setSelectedFarmer(farmer);
    setSelectedFpoId("");
    setMembershipType("associated");
    setAssociateOpen(true);
    loadFpos();
  };

  const handleAssociate = async () => {
    if (!selectedFarmer || !selectedFpoId) {
      toast.error("Please select an FPO");
      return;
    }

    setAssociating(true);
    try {
      const response = await associateFarmerWithFpo(
        selectedFarmer.id,
        selectedFpoId,
        membershipType
      );
      if (response.success) {
        toast.success(
          `Farmer associated with FPO as ${membershipType === "member" ? "Member" : "Associated"}`
        );
        setAssociateOpen(false);
        setSelectedFarmer(null);
        loadFarmers();
      }
    } catch (err) {
      console.error("Failed to associate farmer:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to associate farmer with FPO"
      );
    } finally {
      setAssociating(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1); // Reset to first page on search
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Independent Farmers</h1>
          <p className="text-muted-foreground">
            Farmers not associated with any FPO
          </p>
        </div>
        <Button variant="outline" onClick={loadFarmers} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
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
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Independent Farmers ({total})
          </CardTitle>
          <CardDescription>
            These farmers registered but did not select an FPO. You can associate
            them with an FPO.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or phone..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Farmers Table */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : farmers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              {search ? (
                <p>No independent farmers found matching "{search}"</p>
              ) : (
                <>
                  <p>No independent farmers</p>
                  <p className="text-sm">
                    All farmers are associated with an FPO
                  </p>
                </>
              )}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {farmers.map((farmer) => (
                    <TableRow key={farmer.id}>
                      <TableCell>
                        <div className="font-medium">{farmer.name}</div>
                        {farmer.nameLocal && (
                          <div className="text-sm text-muted-foreground">
                            {farmer.nameLocal}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {farmer.phone ? (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {farmer.phone}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {farmer.email || (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(farmer.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenAssociateDialog(farmer)}
                        >
                          <Building2 className="mr-2 h-4 w-4" />
                          Associate with FPO
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Associate with FPO Dialog */}
      <Dialog open={associateOpen} onOpenChange={setAssociateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Associate Farmer with FPO</DialogTitle>
            <DialogDescription>
              Link {selectedFarmer?.name} to an FPO
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select FPO *</Label>
              {fposLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading FPOs...
                </div>
              ) : (
                <Select value={selectedFpoId} onValueChange={setSelectedFpoId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an FPO" />
                  </SelectTrigger>
                  <SelectContent>
                    {fpos.map((fpo) => (
                      <SelectItem key={fpo.id} value={fpo.id}>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          <span>{fpo.name}</span>
                          {fpo.village && (
                            <span className="text-xs text-muted-foreground">
                              ({fpo.village.block.district.name})
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-2">
              <Label>Membership Type</Label>
              <Select
                value={membershipType}
                onValueChange={(v) =>
                  setMembershipType(v as "member" | "associated")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">
                    <div>
                      <div className="font-medium">Member</div>
                      <div className="text-xs text-muted-foreground">
                        Official FPO member
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="associated">
                    <div>
                      <div className="font-medium">Associated</div>
                      <div className="text-xs text-muted-foreground">
                        Routes interests through FPO, not official member
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssociateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAssociate}
              disabled={associating || !selectedFpoId}
            >
              {associating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <UserPlus className="mr-2 h-4 w-4" />
              Associate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
