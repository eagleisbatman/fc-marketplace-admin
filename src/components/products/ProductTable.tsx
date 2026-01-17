import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import type { Product, Currency } from "@/types/product.types";
import { stockStatusOptions } from "@/types/product.types";

type ProductTableProps = {
  products: Product[];
  loading: boolean;
  hasFilters: boolean;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
};

function formatPrice(price: number, currency?: Currency): string {
  const symbol = currency?.symbol || "₹";
  return `${symbol}${price.toFixed(2)}`;
}

function getStockBadgeVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "in_stock":
      return "default";
    case "low_stock":
      return "secondary";
    case "out_of_stock":
      return "destructive";
    case "discontinued":
      return "outline";
    default:
      return "secondary";
  }
}

export function ProductTable({
  products,
  loading,
  hasFilters,
  onEdit,
  onDelete,
}: ProductTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {hasFilters
          ? "No products found matching your criteria"
          : "No products found"}
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>SKU</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Brand</TableHead>
            <TableHead>Provider</TableHead>
            <TableHead className="text-right">MRP</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-mono text-sm">
                {product.skuCode}
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{product.name}</div>
                  {product.packSize && (
                    <div className="text-xs text-muted-foreground">
                      {product.packSize}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>{product.category?.name || "-"}</TableCell>
              <TableCell>{product.brand?.name || "-"}</TableCell>
              <TableCell>{product.provider?.name || "-"}</TableCell>
              <TableCell className="text-right">
                {formatPrice(product.mrp, product.currency)}
                {product.sellingPrice && product.sellingPrice < product.mrp && (
                  <div className="text-xs text-green-600">
                    {formatPrice(product.sellingPrice, product.currency)}
                  </div>
                )}
              </TableCell>
              <TableCell className="text-center">
                <Badge variant={getStockBadgeVariant(product.stockStatus)}>
                  {stockStatusOptions.find(
                    (o) => o.value === product.stockStatus
                  )?.label || product.stockStatus}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(product)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(product)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
