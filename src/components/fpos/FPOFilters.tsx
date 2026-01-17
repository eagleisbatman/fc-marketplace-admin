import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { Search, RefreshCw, Filter, ChevronDown, X } from "lucide-react";
import { LocationSelector } from "@/components/LocationSelector";
import { useDebounce } from "@/hooks/useDebounce";
import { useAdmin } from "@/contexts/AdminContext";
import type { FPOFilters as FPOFiltersType } from "@/types/fpo.types";

type FPOFiltersProps = {
  filters: FPOFiltersType;
  showAdvancedFilters: boolean;
  hasActiveFilters: boolean;
  onShowAdvancedFiltersChange: (show: boolean) => void;
  onFiltersChange: (filters: Partial<FPOFiltersType>) => void;
  onClearFilters: () => void;
  onRefresh: () => void;
};

export function FPOFilters({
  filters,
  showAdvancedFilters,
  hasActiveFilters,
  onShowAdvancedFiltersChange,
  onFiltersChange,
  onClearFilters,
  onRefresh,
}: FPOFiltersProps) {
  const { selectedCountry } = useAdmin();

  // Local search state for debouncing
  const [localSearch, setLocalSearch] = useState(filters.search);
  const debouncedSearch = useDebounce(localSearch, 300);

  // Sync debounced search with parent
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onFiltersChange({ search: debouncedSearch });
    }
  }, [debouncedSearch, filters.search, onFiltersChange]);

  // Sync local search when filters.search changes externally (e.g., clear filters)
  useEffect(() => {
    setLocalSearch(filters.search);
  }, [filters.search]);

  return (
    <>
      <div className="flex gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or registration number..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant={hasActiveFilters ? "default" : "outline"}
          onClick={() => onShowAdvancedFiltersChange(!showAdvancedFilters)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5">
              Active
            </Badge>
          )}
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              showAdvancedFilters ? "rotate-180" : ""
            }`}
          />
        </Button>
        <Button variant="outline" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Advanced Filters Panel */}
      <Collapsible
        open={showAdvancedFilters}
        onOpenChange={onShowAdvancedFiltersChange}
      >
        <CollapsibleContent>
          <div className="mb-4 p-4 border rounded-lg bg-muted/30 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Advanced Filters</h4>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearFilters}
                  className="h-7 text-xs"
                >
                  <X className="mr-1 h-3 w-3" />
                  Clear All
                </Button>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Location Filter */}
              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm">Location Filter</Label>
                <LocationSelector
                  value={filters.location}
                  onChange={(val) => onFiltersChange({ location: val })}
                  countryFilter={selectedCountry?.code}
                />
              </div>

              {/* Has Location Filter */}
              <div className="space-y-2">
                <Label className="text-sm">Location Status</Label>
                <Select
                  value={filters.hasLocation}
                  onValueChange={(val) =>
                    onFiltersChange({
                      hasLocation: val as "all" | "yes" | "no",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All FPOs</SelectItem>
                    <SelectItem value="yes">With Location</SelectItem>
                    <SelectItem value="no">Without Location</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </>
  );
}
