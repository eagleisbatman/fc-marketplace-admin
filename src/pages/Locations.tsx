import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  RefreshCw,
  AlertCircle,
  Loader2,
  Database,
  Globe,
  Building,
  Home,
  Map,
  CheckCircle,
  MapPin
} from "lucide-react";
import { getLocationSyncStatus, type LocationSyncStatus } from "@/lib/api";
import { useAdmin } from "@/contexts/AdminContext";
import { useAuth } from "@/contexts/AuthContext";

export function Locations() {
  const [status, setStatus] = useState<LocationSyncStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { selectedCountry } = useAdmin();
  const { user } = useAuth();

  // For super_admin without country selected, show warning
  const showCountryWarning = user?.role === "super_admin" && !selectedCountry;

  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getLocationSyncStatus();
      setStatus(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [selectedCountry]);

  const formatNumber = (num: number) => num.toLocaleString();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Locations</h1>
          <p className="text-muted-foreground">
            {selectedCountry
              ? `${selectedCountry.name} location hierarchy (States → Districts → Blocks → Villages)`
              : "Location hierarchy (States → Districts → Blocks → Villages)"}
          </p>
          {selectedCountry && (
            <div className="mt-2 flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Viewing:</span>
              <Badge variant="outline" className="text-sm">
                {selectedCountry.flag} {selectedCountry.name}
              </Badge>
            </div>
          )}
        </div>
        <Button variant="outline" onClick={fetchStatus} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {showCountryWarning && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Country Not Selected</AlertTitle>
          <AlertDescription>
            Please select a country from the header to view location data for a specific region.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Current Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Location Data
          </CardTitle>
          <CardDescription>
            {selectedCountry?.code === "IN"
              ? "Pre-loaded from India's Local Government Directory (LGD)"
              : selectedCountry
                ? `Location data for ${selectedCountry.name}`
                : "Pre-loaded location hierarchy data"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : status ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg border bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">States</span>
                </div>
                <p className="text-2xl font-bold">{formatNumber(status.counts.states)}</p>
                <Badge variant="default" className="bg-green-500 mt-2">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Complete
                </Badge>
              </div>
              <div className="p-4 rounded-lg border bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Map className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Districts</span>
                </div>
                <p className="text-2xl font-bold">{formatNumber(status.counts.districts)}</p>
                <Badge variant="default" className="bg-green-500 mt-2">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Complete
                </Badge>
              </div>
              <div className="p-4 rounded-lg border bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Building className="h-4 w-4 text-orange-500" />
                  <span className="font-medium">Blocks</span>
                </div>
                <p className="text-2xl font-bold">{formatNumber(status.counts.blocks)}</p>
                <Badge variant="default" className="bg-green-500 mt-2">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Complete
                </Badge>
              </div>
              <div className="p-4 rounded-lg border bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Home className="h-4 w-4 text-purple-500" />
                  <span className="font-medium">Villages</span>
                </div>
                <p className="text-2xl font-bold">{formatNumber(status.counts.villages)}</p>
                <Badge variant="default" className="bg-green-500 mt-2">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Complete
                </Badge>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Unable to load status</p>
          )}
        </CardContent>
      </Card>

      {/* Data Quality Card */}
      {status && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Data Quality
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg border">
                <p className="text-2xl font-bold text-green-500">
                  {formatNumber(status.withLgdCodes.districts)}
                </p>
                <p className="text-sm text-muted-foreground">Districts with LGD codes</p>
              </div>
              <div className="text-center p-4 rounded-lg border">
                <p className="text-2xl font-bold text-green-500">
                  {formatNumber(status.withLgdCodes.blocks)}
                </p>
                <p className="text-sm text-muted-foreground">Blocks with LGD codes</p>
              </div>
              <div className="text-center p-4 rounded-lg border">
                <p className="text-2xl font-bold text-green-500">
                  {formatNumber(status.withLgdCodes.villages)}
                </p>
                <p className="text-sm text-muted-foreground">Villages with LGD codes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Data Source
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedCountry?.code === "IN" ? (
            <div className="text-sm space-y-2">
              <p>
                Location data is pre-loaded from India's <strong>Local Government Directory (LGD)</strong>,
                the official source for administrative division codes.
              </p>
              <p className="text-muted-foreground">
                The data includes:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                <li>All 28 states and 8 union territories</li>
                <li>765 districts with official LGD codes</li>
                <li>7,226 blocks/sub-districts</li>
                <li>642,419 villages across India</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-4">
                Source: Local Government Directory (lgdirectory.gov.in)
              </p>
            </div>
          ) : (
            <div className="text-sm space-y-2">
              <p>
                Location data is pre-loaded from official government sources for each country.
              </p>
              <p className="text-muted-foreground">
                The hierarchy includes states/provinces, districts, blocks/sub-districts, and villages
                based on each country's administrative structure.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
