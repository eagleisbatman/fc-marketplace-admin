import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Search, Check, Users as UsersIcon } from "lucide-react";

// Mock data - replace with API calls
const mockUsers = [
  { id: "1", name: "Ramesh Kumar", phone: "9876543210", type: "farmer", location: null },
  { id: "2", name: "Sunil Patil", phone: "9876543211", type: "farmer", location: null },
  {
    id: "3",
    name: "Ganesh Jadhav",
    phone: "9876543212",
    type: "farmer",
    location: { state: "MH", district: "Pune", block: "Haveli", village: "Wagholi" },
  },
  { id: "4", name: "Suresh Patil", phone: "9876543220", type: "partner", location: null },
  { id: "5", name: "Priya Sharma", phone: "9876543230", type: "provider", location: null },
];

// Mock location data
const states = [
  { code: "MH", name: "Maharashtra" },
  { code: "GJ", name: "Gujarat" },
  { code: "KA", name: "Karnataka" },
];

const districts: Record<string, { name: string }[]> = {
  MH: [{ name: "Pune" }, { name: "Nashik" }, { name: "Mumbai" }],
  GJ: [{ name: "Ahmedabad" }, { name: "Surat" }],
  KA: [{ name: "Bangalore" }, { name: "Mysore" }],
};

const blocks: Record<string, { name: string }[]> = {
  Pune: [{ name: "Haveli" }, { name: "Mulshi" }, { name: "Bhor" }],
  Nashik: [{ name: "Niphad" }, { name: "Dindori" }],
};

const villages: Record<string, { name: string }[]> = {
  Haveli: [{ name: "Wagholi" }, { name: "Lohegaon" }],
  Mulshi: [{ name: "Pirangut" }, { name: "Paud" }],
  Niphad: [{ name: "Ozar" }, { name: "Lasalgaon" }],
};

interface LocationSelection {
  state: string;
  district: string;
  block: string;
  village: string;
}

function LocationAssignDialog({
  user,
  onSave,
}: {
  user: (typeof mockUsers)[0];
  onSave: (location: LocationSelection) => void;
}) {
  const [location, setLocation] = useState<LocationSelection>({
    state: user.location?.state || "",
    district: user.location?.district || "",
    block: user.location?.block || "",
    village: user.location?.village || "",
  });

  const handleStateChange = (value: string) => {
    setLocation({ state: value, district: "", block: "", village: "" });
  };

  const handleDistrictChange = (value: string) => {
    setLocation({ ...location, district: value, block: "", village: "" });
  };

  const handleBlockChange = (value: string) => {
    setLocation({ ...location, block: value, village: "" });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <MapPin className="mr-2 h-4 w-4" />
          {user.location ? "Edit" : "Assign"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Location</DialogTitle>
          <DialogDescription>
            Set location for {user.name} ({user.phone})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>State</Label>
            <Select value={location.state} onValueChange={handleStateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {states.map((state) => (
                  <SelectItem key={state.code} value={state.code}>
                    {state.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>District</Label>
            <Select
              value={location.district}
              onValueChange={handleDistrictChange}
              disabled={!location.state}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select district" />
              </SelectTrigger>
              <SelectContent>
                {(districts[location.state] || []).map((d) => (
                  <SelectItem key={d.name} value={d.name}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Block / Taluka</Label>
            <Select
              value={location.block}
              onValueChange={handleBlockChange}
              disabled={!location.district}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select block" />
              </SelectTrigger>
              <SelectContent>
                {(blocks[location.district] || []).map((b) => (
                  <SelectItem key={b.name} value={b.name}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Village</Label>
            <Select
              value={location.village}
              onValueChange={(v) => setLocation({ ...location, village: v })}
              disabled={!location.block}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select village" />
              </SelectTrigger>
              <SelectContent>
                {(villages[location.block] || []).map((v) => (
                  <SelectItem key={v.name} value={v.name}>
                    {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline">Cancel</Button>
          <Button onClick={() => onSave(location)} disabled={!location.village}>
            <Check className="mr-2 h-4 w-4" />
            Save Location
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function Users() {
  const [userType, setUserType] = useState("all");
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState(mockUsers);

  const filteredUsers = users.filter((user) => {
    const matchesType = userType === "all" || user.type === userType;
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.phone.includes(search);
    return matchesType && matchesSearch;
  });

  const usersWithoutLocation = users.filter((u) => !u.location).length;

  const handleLocationSave = (userId: string, location: LocationSelection) => {
    setUsers(
      users.map((u) =>
        u.id === userId ? { ...u, location } : u
      )
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground">
          Manage user accounts and assign locations
        </p>
      </div>

      {usersWithoutLocation > 0 && (
        <Card className="border-orange-500 bg-orange-500/10">
          <CardContent className="flex items-center gap-4 py-4">
            <MapPin className="h-8 w-8 text-orange-500" />
            <div>
              <h3 className="font-medium">
                {usersWithoutLocation} users without location
              </h3>
              <p className="text-sm text-muted-foreground">
                Assign locations to enable location-based features
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5" />
            User List
          </CardTitle>
          <CardDescription>
            Click "Assign" to set location for users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Tabs value={userType} onValueChange={setUserType}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="farmer">Farmers</TabsTrigger>
                <TabsTrigger value="partner">Partners</TabsTrigger>
                <TabsTrigger value="provider">Providers</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.type === "farmer"
                            ? "default"
                            : user.type === "partner"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {user.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.location ? (
                        <span className="text-sm">
                          {user.location.village}, {user.location.block},{" "}
                          {user.location.district}
                        </span>
                      ) : (
                        <Badge variant="outline" className="text-orange-500 border-orange-500">
                          Not Set
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <LocationAssignDialog
                        user={user}
                        onSave={(location) => handleLocationSave(user.id, location)}
                      />
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
