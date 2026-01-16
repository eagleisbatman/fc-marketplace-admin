import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/contexts/AdminContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Upload,
  Users,
  Building2,
  Store,
  Tag,
  Package,
  MapPin,
  Download,
  Globe,
  Loader2,
} from "lucide-react";
import { useState } from "react";

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
  const {
    selectedCountry,
    setSelectedCountry,
    countries,
    isLoadingCountries,
    needsCountrySelection,
  } = useAdmin();
  const [tempSelectedCountryId, setTempSelectedCountryId] = useState<string>("");

  const getRoleDescription = () => {
    if (user?.role === "super_admin") {
      if (selectedCountry) {
        return `Managing data for ${selectedCountry.flag} ${selectedCountry.name}`;
      }
      return "Select a country to manage";
    }
    if (user?.role === "country_admin") return `You manage data for ${user.countryName}`;
    if (user?.role === "state_admin") return `You manage data for ${user.stateName}, ${user.countryName}`;
    return "";
  };

  const handleCountrySelect = () => {
    const country = countries.find((c) => c.id === tempSelectedCountryId);
    if (country) {
      setSelectedCountry(country);
    }
  };

  return (
    <>
      {/* Country Selection Modal for Super Admin */}
      <Dialog open={needsCountrySelection}>
        <DialogContent className="sm:max-w-md" hideCloseButton>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Select Country
            </DialogTitle>
            <DialogDescription>
              Choose which country you want to manage. You can switch countries later from the header.
            </DialogDescription>
          </DialogHeader>

          {isLoadingCountries ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : countries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No countries available. Please contact an administrator.
            </div>
          ) : (
            <div className="space-y-4">
              <RadioGroup
                value={tempSelectedCountryId}
                onValueChange={setTempSelectedCountryId}
                className="gap-3"
              >
                {countries.map((country) => (
                  <div key={country.id} className="flex items-center space-x-3">
                    <RadioGroupItem value={country.id} id={country.id} />
                    <Label
                      htmlFor={country.id}
                      className="flex items-center gap-2 cursor-pointer flex-1 py-2"
                    >
                      <span className="text-xl">{country.flag}</span>
                      <span className="font-medium">{country.name}</span>
                      {country.nameLocal && (
                        <span className="text-muted-foreground text-sm">
                          ({country.nameLocal})
                        </span>
                      )}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <Button
                onClick={handleCountrySelect}
                disabled={!tempSelectedCountryId}
                className="w-full"
              >
                Continue
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
              <CardDescription>Import CSV or Excel files</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/dashboard/upload">
                <Button className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  Go to Data Upload
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
              <CardDescription>Get templates for data entry</CardDescription>
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
    </>
  );
}
