import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tag } from "lucide-react";

export function Brands() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Brands</h1>
        <p className="text-muted-foreground">Manage product brands</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Brand List
          </CardTitle>
          <CardDescription>
            Master list of brands for products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Import brands via CSV upload, then products can reference them.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
