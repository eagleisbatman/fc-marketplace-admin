import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Store, Search, Package, Loader2, AlertCircle } from "lucide-react";
import { getServiceProviders } from "@/lib/api";
import { Alert, AlertDescription } from "@/components/ui/alert";

type ServiceProvider = {
  id: string;
  name: string;
  description?: string;
  website?: string;
  logoUrl?: string;
  _count?: {
    products: number;
  };
};

export function Providers() {
  const [search, setSearch] = useState("");
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getServiceProviders({ limit: 100 });
      if (response.success && response.data) {
        setProviders(response.data.providers || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load service providers");
    } finally {
      setLoading(false);
    }
  };

  const filteredProviders = providers.filter(
    (provider) =>
      provider.name.toLowerCase().includes(search.toLowerCase()) ||
      (provider.description?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Service Providers</h1>
          <p className="text-muted-foreground">
            Manage service provider companies
          </p>
        </div>
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
            <Store className="h-5 w-5" />
            Service Provider List ({providers.length} total)
          </CardTitle>
          <CardDescription>
            {providers.length === 0
              ? "No service providers found. Upload via CSV Upload page."
              : "Manage service providers and their products"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" onClick={loadProviders}>
              Refresh
            </Button>
          </div>

          {providers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Store className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No service providers in the database yet.</p>
              <p className="text-sm mt-2">Go to CSV Upload to import service providers.</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Website</TableHead>
                    <TableHead>Products</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProviders.map((provider) => (
                    <TableRow key={provider.id}>
                      <TableCell className="font-medium">
                        {provider.name}
                      </TableCell>
                      <TableCell>
                        {provider.description || (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {provider.website ? (
                          <a
                            href={provider.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            {provider.website}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          <Package className="mr-1 h-3 w-3" />
                          {provider._count?.products ?? 0}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
