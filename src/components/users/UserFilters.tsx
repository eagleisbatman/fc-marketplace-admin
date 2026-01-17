import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, RefreshCw, Filter, X, Calendar, ChevronDown } from "lucide-react";
import { LocationSelector } from "@/components/LocationSelector";
import { useDebounce } from "@/hooks/useDebounce";
import { useAdmin } from "@/contexts/AdminContext";
import type { UserFilters as UserFiltersType } from "@/types/user.types";

type UserFiltersProps = {
  filters: UserFiltersType;
  showAdvancedFilters: boolean;
  onShowAdvancedFiltersChange: (show: boolean) => void;
  onFiltersChange: (updates: Partial<UserFiltersType>) => void;
  onClearFilters: () => void;
  onRefresh: () => void;
  loading: boolean;
};

export function UserFilters({
  filters,
  showAdvancedFilters,
  onShowAdvancedFiltersChange,
  onFiltersChange,
  onClearFilters,
  onRefresh,
  loading,
}: UserFiltersProps) {
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

  const hasActiveFilters =
    filters.filterLocation.stateCode ||
    filters.filterLocation.districtId ||
    filters.filterLocation.blockId ||
    filters.filterLocation.villageId ||
    filters.filterDateFrom ||
    filters.filterDateTo ||
    filters.filterHasLocation !== "all";

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone or email..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Tabs value={filters.userType} onValueChange={(val) => onFiltersChange({ userType: val })}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="farmer">Farmers</TabsTrigger>
            <TabsTrigger value="partner">Partners</TabsTrigger>
            <TabsTrigger value="provider">Providers</TabsTrigger>
          </TabsList>
        </Tabs>
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
          <ChevronDown className={`h-4 w-4 transition-transform ${showAdvancedFilters ? "rotate-180" : ""}`} />
        </Button>
        <Button variant="outline" onClick={onRefresh} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <Collapsible open={showAdvancedFilters} onOpenChange={onShowAdvancedFiltersChange}>
        <CollapsibleContent>
          <div className="mb-4 p-4 border rounded-lg bg-muted/30 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Advanced Filters</h4>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={onClearFilters} className="h-7 text-xs">
                  <X className="mr-1 h-3 w-3" />
                  Clear All
                </Button>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2 md:col-span-2 lg:col-span-2">
                <Label className="text-sm">Location Filter</Label>
                <LocationSelector
                  value={filters.filterLocation}
                  onChange={(val) => onFiltersChange({ filterLocation: val })}
                  countryFilter={selectedCountry?.code}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Created After</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={filters.filterDateFrom}
                    onChange={(e) => onFiltersChange({ filterDateFrom: e.target.value })}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Created Before</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={filters.filterDateTo}
                    onChange={(e) => onFiltersChange({ filterDateTo: e.target.value })}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Location Status</Label>
                <Select
                  value={filters.filterHasLocation}
                  onValueChange={(val) => onFiltersChange({ filterHasLocation: val as "all" | "yes" | "no" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
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
