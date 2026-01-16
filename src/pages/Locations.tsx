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
  Map,
  CheckCircle,
  XCircle
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

// Expected counts based on seeded LGD data (from GitHub: planemad/india-local-government-directory)
// Note: This is the complete official data - no additional sync needed
const EXPECTED_COUNTS = {
  districts: 765,
  blocks: 7226,
  villages: 642419,
};

type State = {
  id: string;
  code: string;
  name: string;
};

type SyncStatus = "up_to_date" | "needs_update" | "empty";

function getSyncStatus(current: number, expected: number): SyncStatus {
  if (current === 0) return "empty";
  if (current >= expected * 0.95) return "up_to_date"; // Allow 5% tolerance
  return "needs_update";
}

function StatusBadge({ status, current, expected }: { status: SyncStatus; current: number; expected: number }) {
  if (status === "up_to_date") {
    return (
      <Badge variant="default" className="bg-green-500">
        <CheckCircle className="mr-1 h-3 w-3" />
        Up to date
      </Badge>
    );
  }
  if (status === "empty") {
    return (
      <Badge variant="destructive">
        <XCircle className="mr-1 h-3 w-3" />
        Not loaded
      </Badge>
    );
  }
  const missing = expected - current;
  return (
    <Badge variant="secondary" className="bg-orange-500 text-white">
      <AlertCircle className="mr-1 h-3 w-3" />
      {missing.toLocaleString()} new available
    </Badge>
  );
}

export function Locations() {
  const [status, setStatus] = useState<LocationSyncStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<{ type: string; result: SyncResult } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [states, setStates] = useState<State[]>([]);
  const [selectedState, setSelectedState] = useState<string>("__all__");

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
          selectedState && selectedState !== "__all__" ? { state: selectedState } : undefined
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

  // Calculate sync statuses
  const districtStatus = status ? getSyncStatus(status.counts.districts, EXPECTED_COUNTS.districts) : "empty";
  const blockStatus = status ? getSyncStatus(status.counts.blocks, EXPECTED_COUNTS.blocks) : "empty";
  const villageStatus = status ? getSyncStatus(status.counts.villages, EXPECTED_COUNTS.villages) : "empty";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Locations</h1>
          <p className="text-muted-foreground">
            India location hierarchy (States → Districts → Blocks → Villages)
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
                <Badge variant="default" className="bg-green-500 mt-2">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Pre-seeded
                </Badge>
              </div>
              <div className="p-4 rounded-lg border bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Map className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Districts</span>
                </div>
                <p className="text-2xl font-bold">{formatNumber(status.counts.districts)}</p>
                <div className="mt-2">
                  <StatusBadge status={districtStatus} current={status.counts.districts} expected={EXPECTED_COUNTS.districts} />
                </div>
              </div>
              <div className="p-4 rounded-lg border bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Building className="h-4 w-4 text-orange-500" />
                  <span className="font-medium">Blocks</span>
                </div>
                <p className="text-2xl font-bold">{formatNumber(status.counts.blocks)}</p>
                <div className="mt-2">
                  <StatusBadge status={blockStatus} current={status.counts.blocks} expected={EXPECTED_COUNTS.blocks} />
                </div>
              </div>
              <div className="p-4 rounded-lg border bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Home className="h-4 w-4 text-purple-500" />
                  <span className="font-medium">Villages</span>
                </div>
                <p className="text-2xl font-bold">{formatNumber(status.counts.villages)}</p>
                <div className="mt-2">
                  <StatusBadge status={villageStatus} current={status.counts.villages} expected={EXPECTED_COUNTS.villages} />
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Unable to load status</p>
          )}
        </CardContent>
      </Card>

      {/* Sync Cards - Only show if not up to date */}
      {status && (districtStatus !== "up_to_date" || blockStatus !== "up_to_date" || villageStatus !== "up_to_date") && (
        <>
          <h2 className="text-xl font-semibold mt-8">Import from India Data Portal</h2>
          <p className="text-muted-foreground text-sm mb-4">
            Click to import/update location data from the official India Data Portal API.
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Districts Sync */}
            {districtStatus !== "up_to_date" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Map className="h-5 w-5 text-green-500" />
                    Import Districts
                  </CardTitle>
                  <CardDescription>
                    {EXPECTED_COUNTS.districts.toLocaleString()} districts from India Data Portal
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <StatusBadge status={districtStatus} current={status.counts.districts} expected={EXPECTED_COUNTS.districts} />
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
                        Importing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Import Districts
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Blocks Sync */}
            {blockStatus !== "up_to_date" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Building className="h-5 w-5 text-orange-500" />
                    Import Blocks
                  </CardTitle>
                  <CardDescription>
                    {EXPECTED_COUNTS.blocks.toLocaleString()} blocks from India Data Portal
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <StatusBadge status={blockStatus} current={status.counts.blocks} expected={EXPECTED_COUNTS.blocks} />
                  {districtStatus === "empty" && (
                    <p className="text-sm text-orange-500">Import districts first</p>
                  )}
                  {syncing === "blocks" && (
                    <Progress value={undefined} className="h-2" />
                  )}
                  <Button
                    onClick={() => handleSync("blocks")}
                    disabled={syncing !== null || districtStatus === "empty"}
                    className="w-full"
                  >
                    {syncing === "blocks" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Import Blocks
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Villages Sync */}
            {villageStatus !== "up_to_date" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Home className="h-5 w-5 text-purple-500" />
                    Import Villages
                  </CardTitle>
                  <CardDescription>
                    {EXPECTED_COUNTS.villages.toLocaleString()} villages from India Data Portal
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <StatusBadge status={villageStatus} current={status.counts.villages} expected={EXPECTED_COUNTS.villages} />
                  {blockStatus === "empty" && (
                    <p className="text-sm text-orange-500">Import blocks first</p>
                  )}
                  <Select value={selectedState} onValueChange={setSelectedState}>
                    <SelectTrigger>
                      <SelectValue placeholder="All states (optional filter)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">All States</SelectItem>
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
                    disabled={syncing !== null || blockStatus === "empty"}
                    className="w-full"
                  >
                    {syncing === "villages" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Import Villages
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}

      {/* All Up to Date Message */}
      {status && districtStatus === "up_to_date" && blockStatus === "up_to_date" && villageStatus === "up_to_date" && (
        <Card className="border-green-500 bg-green-500/10">
          <CardContent className="flex items-center gap-4 py-6">
            <CheckCircle className="h-10 w-10 text-green-500" />
            <div>
              <h3 className="font-semibold text-lg">All location data is up to date</h3>
              <p className="text-sm text-muted-foreground">
                Your database has all {EXPECTED_COUNTS.districts.toLocaleString()} districts, {EXPECTED_COUNTS.blocks.toLocaleString()} blocks, and {EXPECTED_COUNTS.villages.toLocaleString()} villages from India Data Portal.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

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
              The import process will:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
              <li>Create new locations that don't exist in the database</li>
              <li>Update existing locations with official LGD codes</li>
              <li>Skip locations that already have matching LGD codes</li>
            </ul>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Districts: {EXPECTED_COUNTS.districts.toLocaleString()}</Badge>
            <Badge variant="outline">Blocks: {EXPECTED_COUNTS.blocks.toLocaleString()}</Badge>
            <Badge variant="outline">Villages: {EXPECTED_COUNTS.villages.toLocaleString()}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Source: India Data Portal (api.data.gov.in)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
