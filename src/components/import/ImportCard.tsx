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
import type { TemplateConfig } from "@/config/importTemplates";
import {
  downloadCSV,
  downloadExcel,
  parseCSV,
  parseExcel,
  MAX_FILE_SIZE_MB,
  MAX_FILE_SIZE_BYTES,
  MAX_ROW_COUNT,
  type UploadResult,
} from "./importHelpers";

type ImportCardProps = {
  template: TemplateConfig;
  isExpanded: boolean;
  onToggle: () => void;
};

export function ImportCard({ template, isExpanded, onToggle }: ImportCardProps) {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [previewData, setPreviewData] = useState<Record<string, string>[]>([]);
  const [fullData, setFullData] = useState<Record<string, string>[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [selectedFpoId, setSelectedFpoId] = useState<string | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const Icon = template.icon;

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file size
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast.error(
          `File size exceeds ${MAX_FILE_SIZE_MB}MB limit. Please use a smaller file or split into multiple uploads.`
        );
        event.target.value = "";
        return;
      }

      setFileName(file.name);
      setResult(null);

      try {
        const isExcel = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");
        let rows: Record<string, string>[];

        if (isExcel) {
          const buffer = await file.arrayBuffer();
          rows = parseExcel(buffer);
        } else {
          const text = await file.text();
          rows = parseCSV(text);
        }

        // Validate row count
        if (rows.length > MAX_ROW_COUNT) {
          toast.error(
            `File contains ${rows.length.toLocaleString()} rows, which exceeds the ${MAX_ROW_COUNT.toLocaleString()} row limit. Please split into multiple files.`
          );
          setFileName("");
          event.target.value = "";
          return;
        }

        if (rows.length === 0) {
          toast.error("File appears to be empty or has no valid data rows.");
          setFileName("");
          event.target.value = "";
          return;
        }

        setFullData(rows);
        setPreviewData(rows.slice(0, 5));
      } catch (err) {
        toast.error("Failed to parse file. Please check the format.");
        console.error("Parse error:", err);
        setFileName("");
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

      switch (template.id) {
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
          response = await importLocations(
            fullData,
            template.id as "districts" | "blocks" | "villages"
          );
          break;
        default:
          throw new Error("Unknown import type");
      }

      setResult(response);

      if (response.success) {
        toast.success(`Imported ${response.imported} records`);
      } else {
        toast.warning(
          `Import completed: ${response.imported} success, ${response.failed} failed`
        );
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

  const clearUpload = () => {
    setPreviewData([]);
    setFullData([]);
    setFileName("");
    setResult(null);
    setSelectedFpoId(undefined);
  };

  return (
    <Card className={isExpanded ? "ring-2 ring-primary" : ""}>
      <CardHeader
        className="cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{template.title}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isExpanded && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadCSV(template);
                  }}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadExcel(template);
                  }}
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Excel
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6 pt-0">
          {/* Step 1: Download Template */}
          <div className="rounded-lg border bg-muted/30 p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Download className="h-4 w-4" />
              Step 1: Download Template
            </h4>
            <p className="text-sm text-muted-foreground mb-3">
              Download a template with sample data to understand the required format.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadCSV(template)}
              >
                <FileText className="mr-2 h-4 w-4" />
                Download CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadExcel(template)}
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Download Excel
              </Button>
            </div>
            <div className="mt-3">
              <p className="text-xs text-muted-foreground mb-1">Required columns:</p>
              <div className="flex flex-wrap gap-1">
                {template.columns.map((col) => (
                  <Badge key={col} variant="secondary" className="text-xs">
                    {col}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* FPO Pre-selection (for farmers only) */}
          {template.supportsFpoPreselect && (
            <div className="rounded-lg border bg-blue-50 dark:bg-blue-950/30 p-4">
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium mb-1">
                    Auto-assign to FPO (optional)
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Select an FPO to automatically add all imported farmers as members
                  </p>
                  <div className="max-w-xs">
                    <FPOSelectorSimple
                      value={selectedFpoId}
                      onChange={setSelectedFpoId}
                      placeholder="Select FPO (optional)"
                      showLabel={false}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Upload File */}
          <div className="rounded-lg border p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Step 2: Upload Your Data
            </h4>

            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
                id={`file-upload-${template.id}`}
              />
              <label
                htmlFor={`file-upload-${template.id}`}
                className="cursor-pointer"
              >
                <FileSpreadsheet className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                {fileName ? (
                  <div>
                    <p className="font-medium text-primary">{fileName}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {fullData.length} rows loaded
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      onClick={(e) => {
                        e.preventDefault();
                        clearUpload();
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                ) : (
                  <>
                    <p className="font-medium">Drop file here or click to browse</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Supports .csv and .xlsx files
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Max {MAX_FILE_SIZE_MB}MB file size • Max{" "}
                      {MAX_ROW_COUNT.toLocaleString()} rows
                    </p>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Preview and Upload */}
          {previewData.length > 0 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">
                  Preview (first {previewData.length} of {fullData.length} rows):
                </h4>
                <div className="border rounded-lg overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {Object.keys(previewData[0]).map((header) => (
                          <TableHead key={header} className="whitespace-nowrap">
                            {header}
                          </TableHead>
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
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {fullData.length} total rows will be imported
                  {selectedFpoId && template.supportsFpoPreselect && (
                    <span className="text-green-600 dark:text-green-400 ml-2">
                      (auto-assigned to FPO)
                    </span>
                  )}
                </p>
                <Button onClick={handleUpload} disabled={uploading}>
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Import {fullData.length} Records
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
                {result.success ? "Import Successful" : "Import Completed with Errors"}
              </AlertTitle>
              <AlertDescription>
                <p>{result.imported} records imported successfully</p>
                {result.failed > 0 && <p>{result.failed} records failed</p>}
                {result.errors.length > 0 && (
                  <ul className="mt-2 text-sm list-disc list-inside">
                    {result.errors.slice(0, 5).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                    {result.errors.length > 5 && (
                      <li>...and {result.errors.length - 5} more errors</li>
                    )}
                  </ul>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      )}
    </Card>
  );
}
