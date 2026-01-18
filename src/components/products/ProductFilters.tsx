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
import { Search, RefreshCw, Filter, X } from "lucide-react";
import type {
  ProductFilters as ProductFiltersType,
  Category,
  Brand,
  ServiceProvider,
} from "@/types/product.types";

type ProductFiltersProps = {
  filters: ProductFiltersType;
  showFilters: boolean;
  hasActiveFilters: boolean;
  loading: boolean;
  categories: Category[];
  brands: Brand[];
  providers: ServiceProvider[];
  onShowFiltersChange: (show: boolean) => void;
  onFiltersChange: (filters: Partial<ProductFiltersType>) => void;
  onClearFilters: () => void;
  onRefresh: () => void;
};

export function ProductFilters({
  filters,
  showFilters,
  hasActiveFilters,
  loading,
  categories,
  brands,
  providers,
  onShowFiltersChange,
  onFiltersChange,
  onClearFilters,
  onRefresh,
}: ProductFiltersProps) {
  const activeFilterCount = [
    filters.categoryId,
    filters.brandId,
    filters.providerId,
  ].filter(Boolean).length;

  return (
    <div className="space-y-4 mb-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
            className="pl-9"
          />
        </div>
        <Button
          variant={showFilters ? "secondary" : "outline"}
          onClick={() => onShowFiltersChange(!showFilters)}
        >
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            <X className="mr-1 h-4 w-4" />
            Clear
          </Button>
        )}
        <Button variant="outline" size="icon" onClick={onRefresh} aria-label="Refresh products">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {showFilters && (
        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex-1">
            <Label className="text-xs text-muted-foreground">Category</Label>
            <Select
              value={filters.categoryId || "__all__"}
              onValueChange={(val) => onFiltersChange({ categoryId: val === "__all__" ? "" : val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All categories</SelectItem>
                {categories.filter((c) => c.id).map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Label className="text-xs text-muted-foreground">Brand</Label>
            <Select
              value={filters.brandId || "__all__"}
              onValueChange={(val) => onFiltersChange({ brandId: val === "__all__" ? "" : val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All brands" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All brands</SelectItem>
                {brands.filter((b) => b.id).map((brand) => (
                  <SelectItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Label className="text-xs text-muted-foreground">Provider</Label>
            <Select
              value={filters.providerId || "__all__"}
              onValueChange={(val) => onFiltersChange({ providerId: val === "__all__" ? "" : val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All providers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All providers</SelectItem>
                {providers.filter((p) => p.id).map((prov) => (
                  <SelectItem key={prov.id} value={prov.id}>
                    {prov.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}
