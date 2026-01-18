import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Users,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Search,
  ChevronRight,
  Phone,
  MapPin,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { getFPOs, getFPOMembers } from "@/lib/api";
import type { FPO, FPOMember } from "@/types/fpo.types";
import { toast } from "sonner";

export function Farmers() {
  // FPO list state
  const [fpos, setFpos] = useState<FPO[]>([]);
  const [fposLoading, setFposLoading] = useState(true);
  const [fpoSearch, setFpoSearch] = useState("");

  // Selected FPO and members
  const [selectedFpo, setSelectedFpo] = useState<FPO | null>(null);
  const [members, setMembers] = useState<FPOMember[]>([]);
  const [associated, setAssociated] = useState<FPOMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [farmerSearch, setFarmerSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"members" | "associated">("members");

  const [error, setError] = useState<string | null>(null);

  // Load FPOs on mount
  useEffect(() => {
    loadFpos();
  }, []);

  // Load members when FPO is selected
  useEffect(() => {
    if (selectedFpo) {
      loadMembers(selectedFpo.id);
    }
  }, [selectedFpo]);

  const loadFpos = async () => {
    try {
      setFposLoading(true);
      setError(null);
      const response = (await getFPOs({ page: 1, limit: 1000 })) as {
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
      setFposLoading(false);
    }
  };

  const loadMembers = async (fpoId: string) => {
    try {
      setMembersLoading(true);
      // Load all members, then split by membershipType
      const response = (await getFPOMembers(fpoId)) as {
        success: boolean;
        data?: { members: FPOMember[] };
      };
      if (response.success && response.data) {
        const allMembers = response.data.members;
        // Split by membershipType - 'member' = official members, 'associated' = associated farmers
        setMembers(allMembers.filter((m) => m.membershipType !== "associated"));
        setAssociated(allMembers.filter((m) => m.membershipType === "associated"));
      }
    } catch (err) {
      console.error("Failed to load members:", err);
      toast.error("Failed to load members");
    } finally {
      setMembersLoading(false);
    }
  };

  const handleSelectFpo = (fpo: FPO) => {
    setSelectedFpo(fpo);
    setFarmerSearch("");
    setActiveTab("members");
  };

  const handleBackToList = () => {
    setSelectedFpo(null);
    setMembers([]);
    setAssociated([]);
    setFarmerSearch("");
    setActiveTab("members");
  };

  // Filter FPOs by search
  const filteredFpos = fpoSearch
    ? fpos.filter(
        (f) =>
          f.name.toLowerCase().includes(fpoSearch.toLowerCase()) ||
          f.nameLocal?.toLowerCase().includes(fpoSearch.toLowerCase()) ||
          f.registrationNumber?.toLowerCase().includes(fpoSearch.toLowerCase())
      )
    : fpos;

  // Get current list based on active tab
  const currentList = activeTab === "members" ? members : associated;

  // Filter farmers by search
  const filteredFarmers = farmerSearch
    ? currentList.filter(
        (m) =>
          m.user.name.toLowerCase().includes(farmerSearch.toLowerCase()) ||
          m.user.phone?.toLowerCase().includes(farmerSearch.toLowerCase())
      )
    : currentList;

  const formatLocation = (fpo: FPO): string => {
    if (!fpo.village) return "No location";
    const parts = [
      fpo.village.name,
      fpo.village.block.name,
      fpo.village.block.district.name,
      fpo.village.block.district.state.name,
    ];
    return parts.join(", ");
  };

  if (fposLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Show FPO list if no FPO is selected
  if (!selectedFpo) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Farmers</h1>
          <p className="text-muted-foreground">
            Select an FPO to view its farmers
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Select FPO ({fpos.length} total)
            </CardTitle>
            <CardDescription>
              Choose an FPO to view and manage its farmers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search FPOs by name or registration number..."
                  value={fpoSearch}
                  onChange={(e) => setFpoSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* FPO List */}
            <div className="space-y-2">
              {filteredFpos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {fpoSearch
                    ? "No FPOs found matching your search"
                    : "No FPOs available"}
                </div>
              ) : (
                filteredFpos.map((fpo) => (
                  <div
                    key={fpo.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleSelectFpo(fpo)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{fpo.name}</div>
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
                              {fpo.village.block.district.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show farmers for selected FPO
  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleBackToList}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{selectedFpo.name}</h1>
          <p className="text-muted-foreground">{formatLocation(selectedFpo)}</p>
        </div>
      </div>

      {/* Farmers Card with Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Farmers
          </CardTitle>
          <CardDescription>
            View members and associated farmers of this FPO
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={(v) => {
              setActiveTab(v as "members" | "associated");
              setFarmerSearch("");
            }}
          >
            <TabsList className="mb-4">
              <TabsTrigger value="members" className="flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                Members ({members.length})
              </TabsTrigger>
              <TabsTrigger value="associated" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Associated ({associated.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="members">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Official FPO members who are registered farmers
                </p>
                {renderFarmersList()}
              </div>
            </TabsContent>

            <TabsContent value="associated">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Farmers who route their interests through this FPO but are not
                  official members
                </p>
                {renderFarmersList()}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );

  function renderFarmersList() {
    return (
      <>
        {/* Search */}
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search farmers by name or phone..."
              value={farmerSearch}
              onChange={(e) => setFarmerSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {membersLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredFarmers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {farmerSearch
              ? "No farmers found matching your search"
              : activeTab === "members"
                ? "No members in this FPO"
                : "No associated farmers in this FPO"}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFarmers.map((member) => (
                <TableRow key={member.user.id}>
                  <TableCell>
                    <div className="font-medium">{member.user.name}</div>
                    {member.user.nameLocal && (
                      <div className="text-sm text-muted-foreground">
                        {member.user.nameLocal}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {member.user.phone ? (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {member.user.phone}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        member.membershipType === "associated"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {member.membershipType === "associated"
                        ? "Associated"
                        : "Member"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(member.joinedAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </>
    );
  }
}
