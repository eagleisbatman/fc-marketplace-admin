import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Plus, Trash2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { CoverageSelector, type CoverageValue } from "@/components/CoverageSelector";
import { getFpoCoverage, addFpoCoverage, deleteFpoCoverage, type CoverageArea } from "@/lib/api";

type CoveragePanelProps = {
  fpoId: string;
};

export function CoveragePanel({ fpoId }: CoveragePanelProps) {
  const [coverage, setCoverage] = useState<CoverageArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newCoverage, setNewCoverage] = useState<CoverageValue>({});
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadCoverage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fpoId]);

  const loadCoverage = async () => {
    try {
      setLoading(true);
      const response = await getFpoCoverage(fpoId);
      if (response.success && response.data) {
        setCoverage(response.data.coverage);
      }
    } catch (error) {
      console.error("Failed to load coverage:", error);
      toast.error("Failed to load coverage areas");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCoverage = async () => {
    if (!newCoverage.stateId) {
      toast.error("Please select at least a state");
      return;
    }

    try {
      setSaving(true);
      const response = await addFpoCoverage(fpoId, {
        stateId: newCoverage.stateId,
        districtId: newCoverage.districtId,
        blockId: newCoverage.blockId,
        villageId: newCoverage.villageId,
      });

      if (response.success) {
        toast.success("Coverage area added");
        setAddDialogOpen(false);
        setNewCoverage({});
        loadCoverage();
      }
    } catch (error) {
      console.error("Failed to add coverage:", error);
      toast.error("Failed to add coverage area");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCoverage = async (coverageId: string) => {
    try {
      setDeletingId(coverageId);
      const response = await deleteFpoCoverage(fpoId, coverageId);

      if (response.success) {
        toast.success("Coverage area removed");
        setCoverage((prev) => prev.filter((c) => c.id !== coverageId));
      }
    } catch (error) {
      console.error("Failed to delete coverage:", error);
      toast.error("Failed to remove coverage area");
    } finally {
      setDeletingId(null);
    }
  };

  const formatCoverageLocation = (item: CoverageArea): string => {
    const parts = [item.state.name];
    if (item.district) {
      parts.push(item.district.name);
    } else {
      parts.push("(All Districts)");
    }
    if (item.block) {
      parts.push(item.block.name);
    } else if (item.district) {
      parts.push("(All Blocks)");
    }
    if (item.village) {
      parts.push(item.village.name);
    } else if (item.block) {
      parts.push("(All Villages)");
    }
    return parts.join(" > ");
  };

  const getCoverageLevel = (item: CoverageArea): string => {
    if (item.village) return "Village";
    if (item.block) return "Block";
    if (item.district) return "District";
    return "State";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Operating Regions</h3>
        <Button onClick={() => setAddDialogOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Region
        </Button>
      </div>

      {coverage.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No coverage areas defined</p>
            <p className="text-sm mt-1">Add regions where this FPO operates</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {coverage.map((item) => (
            <Card key={item.id}>
              <CardContent className="py-3 px-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-sm">
                      {formatCoverageLocation(item)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Level: {getCoverageLevel(item)}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteCoverage(item.id)}
                  disabled={deletingId === item.id}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  {deletingId === item.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Coverage Area</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Select the geographic area where this FPO operates. You can specify
              from state level down to village level.
            </p>
            <CoverageSelector
              value={newCoverage}
              onChange={setNewCoverage}
              disabled={saving}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddDialogOpen(false);
                setNewCoverage({});
              }}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddCoverage}
              disabled={!newCoverage.stateId || saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Coverage"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
