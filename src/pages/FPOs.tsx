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
import { Building2, MapPin, Search, Users, Loader2, AlertCircle } from "lucide-react";
import { getFPOs } from "@/lib/api";
import { Alert, AlertDescription } from "@/components/ui/alert";

type FPO = {
  id: string;
  name: string;
  nameLocal?: string;
  registrationNumber?: string;
  phone?: string;
  village?: {
    name: string;
    block: {
      name: string;
      district: {
        name: string;
        state: {
          name: string;
        };
      };
    };
  };
  _count?: {
    members: number;
  };
};

export function FPOs() {
  const [search, setSearch] = useState("");
  const [fpos, setFpos] = useState<FPO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFPOs();
  }, []);

  const loadFPOs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getFPOs({ limit: 100 }) as { success: boolean; data?: { fpos: FPO[] } };
      if (response.success && response.data) {
        setFpos(response.data.fpos || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load FPOs");
    } finally {
      setLoading(false);
    }
  };

  const filteredFPOs = fpos.filter(
    (fpo) =>
      fpo.name.toLowerCase().includes(search.toLowerCase()) ||
      (fpo.registrationNumber?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  const fposWithoutLocation = fpos.filter((f) => !f.village).length;

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
          <h1 className="text-3xl font-bold">FPOs</h1>
          <p className="text-muted-foreground">
            Manage Farmer Producer Organizations
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {fposWithoutLocation > 0 && (
        <Card className="border-orange-500 bg-orange-500/10">
          <CardContent className="flex items-center gap-4 py-4">
            <MapPin className="h-8 w-8 text-orange-500" />
            <div>
              <h3 className="font-medium">
                {fposWithoutLocation} FPOs without location
              </h3>
              <p className="text-sm text-muted-foreground">
                Assign locations to FPOs after import
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            FPO List ({fpos.length} total)
          </CardTitle>
          <CardDescription>
            {fpos.length === 0
              ? "No FPOs found. Upload FPOs via CSV Upload page."
              : "Manage FPO locations and members"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or registration number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" onClick={loadFPOs}>
              Refresh
            </Button>
          </div>

          {fpos.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No FPOs in the database yet.</p>
              <p className="text-sm mt-2">Go to CSV Upload to import FPOs.</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Registration #</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFPOs.map((fpo) => (
                    <TableRow key={fpo.id}>
                      <TableCell className="font-medium">
                        {fpo.name}
                        {fpo.nameLocal && (
                          <span className="block text-sm text-muted-foreground">
                            {fpo.nameLocal}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {fpo.registrationNumber ? (
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {fpo.registrationNumber}
                          </code>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          <Users className="mr-1 h-3 w-3" />
                          {fpo._count?.members ?? 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {fpo.village ? (
                          <span className="text-sm">
                            {fpo.village.name}, {fpo.village.block.district.name}
                          </span>
                        ) : (
                          <Badge variant="outline" className="text-orange-500 border-orange-500">
                            Not Set
                          </Badge>
                        )}
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
