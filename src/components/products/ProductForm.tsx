import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  ProductFormData,
  Category,
  Brand,
  ServiceProvider,
  Unit,
  Currency,
} from "@/types/product.types";
import { stockStatusOptions } from "@/types/product.types";

type ProductFormProps = {
  formData: ProductFormData;
  onFormChange: (data: ProductFormData) => void;
  categories: Category[];
  brands: Brand[];
  providers: ServiceProvider[];
  units: Unit[];
  currencies: Currency[];
};

export function ProductForm({
  formData,
  onFormChange,
  categories,
  brands,
  providers,
  units,
  currencies,
}: ProductFormProps) {
  return (
    <div className="grid gap-4 max-h-[60vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="skuCode">SKU Code *</Label>
          <Input
            id="skuCode"
            value={formData.skuCode}
            onChange={(e) =>
              onFormChange({ ...formData, skuCode: e.target.value })
            }
            placeholder="SKU-001"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stockStatus">Stock Status</Label>
          <Select
            value={formData.stockStatus}
            onValueChange={(val) =>
              onFormChange({ ...formData, stockStatus: val })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {stockStatusOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
            placeholder="Product name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nameLocal">Local Name</Label>
          <Input
            id="nameLocal"
            value={formData.nameLocal}
            onChange={(e) =>
              onFormChange({ ...formData, nameLocal: e.target.value })
            }
            placeholder="Local name"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            onFormChange({ ...formData, description: e.target.value })
          }
          placeholder="Product description"
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="categoryId">Category *</Label>
          <Select
            value={formData.categoryId}
            onValueChange={(val) =>
              onFormChange({ ...formData, categoryId: val })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.filter((c) => c.id).map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="brandId">Brand</Label>
          <Select
            value={formData.brandId || "__none__"}
            onValueChange={(val) => onFormChange({ ...formData, brandId: val === "__none__" ? "" : val })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select brand (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">No brand</SelectItem>
              {brands.filter((b) => b.id).map((brand) => (
                <SelectItem key={brand.id} value={brand.id}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="providerId">Service Provider *</Label>
          <Select
            value={formData.providerId}
            onValueChange={(val) =>
              onFormChange({ ...formData, providerId: val })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent>
              {providers.filter((p) => p.id).map((prov) => (
                <SelectItem key={prov.id} value={prov.id}>
                  {prov.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="variety">Variety</Label>
          <Input
            id="variety"
            value={formData.variety}
            onChange={(e) =>
              onFormChange({ ...formData, variety: e.target.value })
            }
            placeholder="Product variety"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="unitId">Unit *</Label>
          <Select
            value={formData.unitId}
            onValueChange={(val) => onFormChange({ ...formData, unitId: val })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              {units.filter((u) => u.id).map((unit) => (
                <SelectItem key={unit.id} value={unit.id}>
                  {unit.name} ({unit.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="packSize">Pack Size</Label>
          <Input
            id="packSize"
            value={formData.packSize}
            onChange={(e) =>
              onFormChange({ ...formData, packSize: e.target.value })
            }
            placeholder="e.g., 5kg, 1L"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currencyId">Currency *</Label>
          <Select
            value={formData.currencyId}
            onValueChange={(val) =>
              onFormChange({ ...formData, currencyId: val })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {currencies.filter((c) => c.id).map((curr) => (
                <SelectItem key={curr.id} value={curr.id}>
                  {curr.code} ({curr.symbol})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="mrp">MRP *</Label>
          <Input
            id="mrp"
            type="number"
            step="0.01"
            value={formData.mrp}
            onChange={(e) => onFormChange({ ...formData, mrp: e.target.value })}
            placeholder="0.00"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sellingPrice">Selling Price</Label>
          <Input
            id="sellingPrice"
            type="number"
            step="0.01"
            value={formData.sellingPrice}
            onChange={(e) =>
              onFormChange({ ...formData, sellingPrice: e.target.value })
            }
            placeholder="0.00"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="discountPercent">Discount %</Label>
          <Input
            id="discountPercent"
            type="number"
            step="0.01"
            value={formData.discountPercent}
            onChange={(e) =>
              onFormChange({ ...formData, discountPercent: e.target.value })
            }
            placeholder="0"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input
          id="imageUrl"
          value={formData.imageUrl}
          onChange={(e) =>
            onFormChange({ ...formData, imageUrl: e.target.value })
          }
          placeholder="https://example.com/image.jpg"
        />
      </div>
    </div>
  );
}
