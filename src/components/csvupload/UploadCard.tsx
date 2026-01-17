import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Download,
  Building2,
  Loader2,
  FileText,
} from "lucide-react";
import {
  importUsers,
  importFPOs,
  importServiceProviders,
  importBrands,
  importProducts,
  importLocations,
} from "@/lib/api";
import { FPOSelectorSimple } from "@/components/FPOSelector";
import { toast } from "sonner";
import {
  parseCSV,
  parseExcel,
  downloadTemplateCSV,
  downloadTemplateExcel,
  type UploadResult,
} from "@/components/import";
import type { UploadConfig } from "@/config/uploadConfigs";

type UploadCardProps = {
  config: UploadConfig;
};

export function UploadCard({ config }: UploadCardProps) {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [previewData, setPreviewData] = useState<Record<string, string>[]>([]);
  const [fullData, setFullData] = useState<Record<string, string>[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [selectedFpoId, setSelectedFpoId] = useState<string | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const Icon = config.icon;

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setFileName(file.name);
      setResult(null);

      try {
        const isExcel =
          file.name.endsWith(".xlsx") || file.name.endsWith(".xls");
        let rows: Record<string, string>[];

        if (isExcel) {
          const buffer = await file.arrayBuffer();
          rows = parseExcel(buffer);
        } else {
          const text = await file.text();
          rows = parseCSV(text);
        }

        setFullData(rows);
        setPreviewData(rows.slice(0, 5));
      } catch (err) {
        toast.error("Failed to parse file. Please check the format.");
        console.error("Parse error:", err);
      }

      event.target.value = "";
    },
    []
  );

  const handleUpload = async () => {
    if (fullData.length === 0) return;

    setUploading(true);
    setResult(null);

    try {
      let response: UploadResult;

      switch (config.type) {
        case "farmers":
          response = await importUsers(fullData, "farmer", selectedFpoId);
          break;
        case "partners":
          response = await importUsers(fullData, "partner");
          break;
        case "providers":
          response = await importUsers(fullData, "provider");
          break;
        case "admins":
          response = await importUsers(fullData, "admin");
          break;
        case "fpos":
          response = await importFPOs(fullData);
          break;
        case "service_providers":
          response = await importServiceProviders(fullData);
          break;
        case "brands":
          response = await importBrands(fullData);
          break;
        case "products":
          response = await importProducts(fullData);
          break;
        case "districts":
        case "blocks":
        case "villages":
          response = await importLocations(fullData, config.type);
          break;
        default:
          throw new Error("Unknown upload type");
      }

      setResult(response);

      if (response.success) {
        toast.success(`Imported ${response.imported} records`);
      } else {
        toast.error(`Import completed with ${response.failed} errors`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      setResult({
        success: false,
        imported: 0,
        failed: fullData.length,
        errors: [message],
      });
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>{config.label}</CardTitle>
              <CardDescription>{config.description}</CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                downloadTemplateCSV(config.requiredColumns, config.templateFile)
              }
            >
              <FileText className="mr-2 h-4 w-4" />
              CSV Template
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                downloadTemplateExcel(
                  config.requiredColumns,
                  config.templateFile
                )
              }
            >
              <Download className="mr-2 h-4 w-4" />
              Excel Template
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* FPO Pre-selection for Farmers */}
        {config.supportsFpoPreselect && (
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="flex items-start gap-4">
              <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium mb-1">
                  Auto-assign to FPO (optional)
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Select an FPO to automatically add all imported farmers as
                  members
                </p>
                <div className="max-w-xs">
                  <FPOSelectorSimple
                    value={selectedFpoId}
                    onChange={setSelectedFpoId}
                    placeholder="Select FPO (optional)"
                    showLabel={false}
                  />
                </div>
                {selectedFpoId && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                    All imported farmers will be added as members to this FPO
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Required Columns */}
        <div>
          <h4 className="text-sm font-medium mb-2">Required Columns:</h4>
          <div className="flex flex-wrap gap-2">
            {config.requiredColumns.map((col) => (
              <Badge key={col} variant="secondary">
                {col}
              </Badge>
            ))}
          </div>
        </div>

        {/* Upload Zone */}
        <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileSelect}
            className="hidden"
            id={`file-upload-${config.type}`}
          />
          <label htmlFor={`file-upload-${config.type}`} className="cursor-pointer">
            <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            {fileName ? (
              <div>
                <p className="text-lg font-medium text-primary">{fileName}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {fullData.length} rows loaded
                </p>
              </div>
            ) : (
              <>
                <p className="text-lg font-medium">
                  Drop file here or click to browse
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Supports .csv and .xlsx files
                </p>
              </>
            )}
          </label>
        </div>

        {/* Preview */}
        {previewData.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">
              Preview (first {previewData.length} of {fullData.length} rows):
            </h4>
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {Object.keys(previewData[0]).map((header) => (
                      <TableHead key={header}>{header}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.map((row, i) => (
                    <TableRow key={i}>
                      {Object.values(row).map((value, j) => (
                        <TableCell key={j} className="max-w-[200px] truncate">
                          {value || "-"}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                {fullData.length} total rows will be uploaded
                {selectedFpoId && config.supportsFpoPreselect && (
                  <span className="text-green-600 dark:text-green-400 ml-2">
                    (auto-assigned to FPO)
                  </span>
                )}
              </p>
              <Button onClick={handleUpload} disabled={uploading}>
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload {fullData.length} Records
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <Alert variant={result.success ? "default" : "destructive"}>
            {result.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertTitle>
              {result.success
                ? "Upload Successful"
                : "Upload Completed with Errors"}
            </AlertTitle>
            <AlertDescription>
              <p>{result.imported} records imported successfully</p>
              {result.failed > 0 && <p>{result.failed} records failed</p>}
              {result.errors.length > 0 && (
                <ul className="mt-2 text-sm list-disc list-inside">
                  {result.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              )}
              {["farmers", "partners", "fpos", "service_providers"].includes(
                config.type
              ) &&
                result.imported > 0 &&
                !selectedFpoId && (
                  <p className="mt-2 font-medium">
                    Next: Go to the respective section to assign locations
                  </p>
                )}
              {config.supportsFpoPreselect &&
                selectedFpoId &&
                result.imported > 0 && (
                  <p className="mt-2 text-green-600 dark:text-green-400 font-medium">
                    {result.imported} farmers were automatically added to the
                    selected FPO
                  </p>
                )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
