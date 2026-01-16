import { useState } from "react";
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
import { Building2, MapPin, Search, Users, Plus } from "lucide-react";

// Mock data
const mockFPOs = [
  {
    id: "1",
    name: "Pune District Farmers Producer Company",
    registrationNumber: "MH-FPO-2020-001",
    phone: "912025551234",
    members: 156,
    location: null,
  },
  {
    id: "2",
    name: "Godavari Farmers Producer Organization",
    registrationNumber: "MH-FPO-2021-015",
    phone: "912535551234",
    members: 89,
    location: { state: "MH", district: "Nashik", block: "Niphad", village: "Ozar" },
  },
];

export function FPOs() {
  const [search, setSearch] = useState("");

  const filteredFPOs = mockFPOs.filter(
    (fpo) =>
      fpo.name.toLowerCase().includes(search.toLowerCase()) ||
      fpo.registrationNumber.toLowerCase().includes(search.toLowerCase())
  );

  const fposWithoutLocation = mockFPOs.filter((f) => !f.location).length;

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
            FPO List
          </CardTitle>
          <CardDescription>
            Click on an FPO to manage location and members
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
          </div>

          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Registration #</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFPOs.map((fpo) => (
                  <TableRow key={fpo.id}>
                    <TableCell className="font-medium">{fpo.name}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {fpo.registrationNumber}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        <Users className="mr-1 h-3 w-3" />
                        {fpo.members}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {fpo.location ? (
                        <span className="text-sm">
                          {fpo.location.village}, {fpo.location.district}
                        </span>
                      ) : (
                        <Badge variant="outline" className="text-orange-500 border-orange-500">
                          Not Set
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm">
                          <MapPin className="mr-2 h-4 w-4" />
                          Location
                        </Button>
                        <Button variant="outline" size="sm">
                          <Plus className="mr-2 h-4 w-4" />
                          Members
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
