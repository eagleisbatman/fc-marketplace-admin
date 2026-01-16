import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getFPOs } from "@/lib/api";
import { Loader2, Plus, Search, Building2 } from "lucide-react";

type FPO = {
  id: string;
  name: string;
  nameLocal?: string;
  registrationNumber?: string;
  village?: {
    name: string;
    block: {
      name: string;
      district: {
        name: string;
      };
    };
  };
  _count?: {
    members: number;
  };
};

type FPOSelectorProps = {
  value?: string;
  onChange: (fpoId: string | undefined) => void;
  onCreateNew?: () => void;
  allowCreate?: boolean;
  disabled?: boolean;
  placeholder?: string;
  label?: string;
  showLabel?: boolean;
};

export function FPOSelector({
  value,
  onChange,
  onCreateNew,
  allowCreate = false,
  disabled = false,
  placeholder = "Select FPO",
  label = "FPO",
  showLabel = true,
}: FPOSelectorProps) {
  const [fpos, setFpos] = useState<FPO[]>([]);
  const [filteredFpos, setFilteredFpos] = useState<FPO[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Load FPOs on mount
  useEffect(() => {
    loadFPOs();
  }, []);

  // Filter FPOs when search changes
  useEffect(() => {
    if (search) {
      const searchLower = search.toLowerCase();
      const filtered = fpos.filter(
        (fpo) =>
          fpo.name.toLowerCase().includes(searchLower) ||
          (fpo.nameLocal?.toLowerCase().includes(searchLower) ?? false) ||
          (fpo.registrationNumber?.toLowerCase().includes(searchLower) ?? false)
      );
      setFilteredFpos(filtered);
    } else {
      setFilteredFpos(fpos);
    }
  }, [search, fpos]);

  const loadFPOs = async () => {
    try {
      setLoading(true);
      const response = await getFPOs({ limit: 200 }) as { success: boolean; data?: { fpos: FPO[] } };
      if (response.success && response.data) {
        setFpos(response.data.fpos || []);
        setFilteredFpos(response.data.fpos || []);
      }
    } catch (err) {
      console.error("Failed to load FPOs:", err);
    } finally {
      setLoading(false);
    }
  };

  const selectedFpo = fpos.find((f) => f.id === value);

  const formatFpoDisplay = (fpo: FPO) => {
    const parts = [fpo.name];
    if (fpo.registrationNumber) {
      parts.push(`(${fpo.registrationNumber})`);
    }
    return parts.join(" ");
  };

  const formatFpoLocation = (fpo: FPO) => {
    if (!fpo.village) return null;
    return `${fpo.village.name}, ${fpo.village.block.district.name}`;
  };

  return (
    <div className="space-y-2">
      {showLabel && <Label>{label}</Label>}
      <Select
        value={value || ""}
        onValueChange={(val) => onChange(val || undefined)}
        disabled={disabled || loading}
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <SelectTrigger>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : selectedFpo ? (
            <span className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              {formatFpoDisplay(selectedFpo)}
            </span>
          ) : (
            <SelectValue placeholder={placeholder} />
          )}
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          <div className="flex items-center border-b px-3 pb-2">
            <Search className="h-4 w-4 text-muted-foreground mr-2" />
            <Input
              placeholder="Search FPOs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 border-0 focus-visible:ring-0 px-0"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {filteredFpos.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              {search ? "No FPOs found matching your search" : "No FPOs available"}
            </div>
          ) : (
            filteredFpos.map((fpo) => (
              <SelectItem key={fpo.id} value={fpo.id}>
                <div className="flex flex-col">
                  <span className="font-medium">{formatFpoDisplay(fpo)}</span>
                  {fpo.village && (
                    <span className="text-xs text-muted-foreground">
                      {formatFpoLocation(fpo)}
                    </span>
                  )}
                  {fpo._count && (
                    <span className="text-xs text-muted-foreground">
                      {fpo._count.members} members
                    </span>
                  )}
                </div>
              </SelectItem>
            ))
          )}

          {allowCreate && onCreateNew && (
            <>
              <div className="border-t my-1" />
              <Button
                variant="ghost"
                className="w-full justify-start text-primary"
                onClick={(e) => {
                  e.preventDefault();
                  setIsOpen(false);
                  onCreateNew();
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New FPO
              </Button>
            </>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}

// Simple non-searchable version for forms where space is limited
export function FPOSelectorSimple({
  value,
  onChange,
  disabled = false,
  placeholder = "Select FPO",
  label = "FPO",
  showLabel = true,
}: Omit<FPOSelectorProps, "onCreateNew" | "allowCreate">) {
  const [fpos, setFpos] = useState<FPO[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFPOs();
  }, []);

  const loadFPOs = async () => {
    try {
      setLoading(true);
      const response = await getFPOs({ limit: 200 }) as { success: boolean; data?: { fpos: FPO[] } };
      if (response.success && response.data) {
        setFpos(response.data.fpos || []);
      }
    } catch (err) {
      console.error("Failed to load FPOs:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      {showLabel && <Label>{label}</Label>}
      <Select
        value={value || ""}
        onValueChange={(val) => onChange(val || undefined)}
        disabled={disabled || loading}
      >
        <SelectTrigger>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <SelectValue placeholder={placeholder} />
          )}
        </SelectTrigger>
        <SelectContent>
          {fpos.map((fpo) => (
            <SelectItem key={fpo.id} value={fpo.id}>
              {fpo.name}
              {fpo.registrationNumber && ` (${fpo.registrationNumber})`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
