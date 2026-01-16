import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  Upload,
  Users,
  Building2,
  Store,
  Tag,
  Package,
  MapPin,
  Download,
} from "lucide-react";

const dataTypes = [
  { path: "/dashboard/users", label: "Users", icon: Users, description: "Farmers, Partners, Providers, Admins" },
  { path: "/dashboard/fpos", label: "FPOs", icon: Building2, description: "Farmer Producer Organizations" },
  { path: "/dashboard/providers", label: "Service Providers", icon: Store, description: "Companies selling products" },
  { path: "/dashboard/brands", label: "Brands", icon: Tag, description: "Product brands" },
  { path: "/dashboard/products", label: "Products", icon: Package, description: "Product catalog" },
  { path: "/dashboard/locations", label: "Locations", icon: MapPin, description: "Districts, Blocks, Villages" },
];

export function Dashboard() {
  const { user } = useAuth();

  const getRoleDescription = () => {
    if (user?.role === "super_admin") return "You have access to all countries and data";
    if (user?.role === "country_admin") return `You manage data for ${user.countryName}`;
    if (user?.role === "state_admin") return `You manage data for ${user.stateName}, ${user.countryName}`;
    return "";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Data Management</h1>
        <p className="text-muted-foreground">{getRoleDescription()}</p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Data
            </CardTitle>
            <CardDescription>Import CSV files</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/dashboard/upload">
              <Button className="w-full">
                <Upload className="mr-2 h-4 w-4" />
                Go to CSV Upload
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Download Templates
            </CardTitle>
            <CardDescription>Get CSV templates for data entry</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/dashboard/templates">
              <Button variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download Templates
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Data Types Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Manage Data</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {dataTypes.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{item.label}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
