import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";

export function Products() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Products</h1>
        <p className="text-muted-foreground">Manage product catalog</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Product Catalog
          </CardTitle>
          <CardDescription>
            View and manage imported products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Import products via CSV upload. Products reference brands and service providers.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
