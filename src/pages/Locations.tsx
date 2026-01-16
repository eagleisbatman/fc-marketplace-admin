import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Database,
  Globe,
  Building,
  Home,
  Map
} from "lucide-react";
import {
  getLocationSyncStatus,
  syncDistricts,
  syncBlocks,
  syncVillages,
  getStates,
  type LocationSyncStatus,
  type SyncResult
} from "@/lib/api";

type State = {
  id: string;
  code: string;
  name: string;
};

export function Locations() {
  const [status, setStatus] = useState<LocationSyncStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<{ type: string; result: SyncResult } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [states, setStates] = useState<State[]>([]);
  const [selectedState, setSelectedState] = useState<string>("");

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

  const fetchStates = async () => {
    try {
      const response = await getStates("IN") as { success: boolean; data: State[] };
      setStates(response.data);
    } catch (err) {
      console.error("Failed to fetch states:", err);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchStates();
  }, []);

  const handleSync = async (type: "districts" | "blocks" | "villages") => {
    try {
      setSyncing(type);
      setError(null);
      setSyncResult(null);

      let response;
      if (type === "districts") {
        response = await syncDistricts();
      } else if (type === "blocks") {
        response = await syncBlocks();
      } else {
        response = await syncVillages(
          selectedState ? { state: selectedState } : undefined
        );
      }

      setSyncResult({ type, result: response.data });
      await fetchStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to sync ${type}`);
    } finally {
      setSyncing(null);
    }
  };

  const formatNumber = (num: number) => num.toLocaleString();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Locations</h1>
          <p className="text-muted-foreground">
            Sync and manage geographic hierarchy from India Data Portal
          </p>
        </div>
        <Button variant="outline" onClick={fetchStatus} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {syncResult && (
        <Alert variant={syncResult.result.errors.length > 0 ? "default" : "default"} className="border-green-500">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertTitle>Sync Completed</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-1">
              <p><strong>{syncResult.type.charAt(0).toUpperCase() + syncResult.type.slice(1)}:</strong> {syncResult.result.message}</p>
              <p className="text-sm">
                Created: {syncResult.result.created} | Updated: {syncResult.result.updated} | Skipped: {syncResult.result.skipped}
              </p>
              {syncResult.result.errors.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-muted-foreground">
                    {syncResult.result.errors.length} errors (click to expand)
                  </summary>
                  <ul className="mt-1 text-xs text-muted-foreground list-disc list-inside max-h-32 overflow-y-auto">
                    {syncResult.result.errors.slice(0, 20).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Current Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Current Data Status
          </CardTitle>
          <CardDescription>
            Location hierarchy currently stored in the database
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
                <p className="text-xs text-muted-foreground">Pre-seeded</p>
              </div>
              <div className="p-4 rounded-lg border bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Map className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Districts</span>
                </div>
                <p className="text-2xl font-bold">{formatNumber(status.counts.districts)}</p>
                <p className="text-xs text-muted-foreground">
                  {formatNumber(status.withLgdCodes.districts)} with LGD codes
                </p>
              </div>
              <div className="p-4 rounded-lg border bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Building className="h-4 w-4 text-orange-500" />
                  <span className="font-medium">Blocks</span>
                </div>
                <p className="text-2xl font-bold">{formatNumber(status.counts.blocks)}</p>
                <p className="text-xs text-muted-foreground">
                  {formatNumber(status.withLgdCodes.blocks)} with LGD codes
                </p>
              </div>
              <div className="p-4 rounded-lg border bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Home className="h-4 w-4 text-purple-500" />
                  <span className="font-medium">Villages</span>
                </div>
                <p className="text-2xl font-bold">{formatNumber(status.counts.villages)}</p>
                <p className="text-xs text-muted-foreground">
                  {formatNumber(status.withLgdCodes.villages)} with LGD codes
                </p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Unable to load status</p>
          )}
        </CardContent>
      </Card>

      {/* Sync Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Districts Sync */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Map className="h-5 w-5 text-green-500" />
              Sync Districts
            </CardTitle>
            <CardDescription>
              ~765 districts from India Data Portal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>Syncs district data with LGD codes from the official India Data Portal.</p>
            </div>
            {syncing === "districts" && (
              <Progress value={undefined} className="h-2" />
            )}
            <Button
              onClick={() => handleSync("districts")}
              disabled={syncing !== null}
              className="w-full"
            >
              {syncing === "districts" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sync Districts
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Blocks Sync */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building className="h-5 w-5 text-orange-500" />
              Sync Blocks
            </CardTitle>
            <CardDescription>
              ~7,245 blocks from India Data Portal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>Syncs block/taluka data. Requires districts to be synced first.</p>
            </div>
            {syncing === "blocks" && (
              <Progress value={undefined} className="h-2" />
            )}
            <Button
              onClick={() => handleSync("blocks")}
              disabled={syncing !== null}
              className="w-full"
            >
              {syncing === "blocks" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sync Blocks
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Villages Sync */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Home className="h-5 w-5 text-purple-500" />
              Sync Villages
            </CardTitle>
            <CardDescription>
              ~690,000 villages from India Data Portal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>Syncs village data. Can filter by state. May take several minutes.</p>
            </div>
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger>
                <SelectValue placeholder="All states (optional filter)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All States</SelectItem>
                {states.map((state) => (
                  <SelectItem key={state.code} value={state.code}>
                    {state.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {syncing === "villages" && (
              <div className="space-y-2">
                <Progress value={undefined} className="h-2" />
                <p className="text-xs text-muted-foreground text-center">
                  This may take several minutes...
                </p>
              </div>
            )}
            <Button
              onClick={() => handleSync("villages")}
              disabled={syncing !== null}
              className="w-full"
            >
              {syncing === "villages" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sync Villages
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Data Source Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm space-y-2">
            <p>
              Location data is sourced from the <strong>India Data Portal</strong> which provides
              official LGD (Local Government Directory) codes for administrative divisions.
            </p>
            <p className="text-muted-foreground">
              The sync process will:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
              <li>Create new locations that don't exist in the database</li>
              <li>Update existing locations with official LGD codes</li>
              <li>Skip locations that already have matching LGD codes</li>
            </ul>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Districts: 765</Badge>
            <Badge variant="outline">Blocks: 7,245</Badge>
            <Badge variant="outline">Villages: 690,499</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Source: India Data Portal (ckandev.indiadataportal.com)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
