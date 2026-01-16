import { useState, useCallback, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Users,
  Building2,
  Store,
  Tag,
  Package,
  MapPin,
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
import * as XLSX from "xlsx";

type UploadType =
  | "farmers"
  | "partners"
  | "providers"
  | "admins"
  | "fpos"
  | "service_providers"
  | "brands"
  | "products"
  | "districts"
  | "blocks"
  | "villages";

interface UploadConfig {
  type: UploadType;
  label: string;
  description: string;
  icon: React.ElementType;
  templateFile: string;
  requiredColumns: string[];
  supportsFpoPreselect?: boolean;
}

const uploadConfigs: UploadConfig[] = [
  {
    type: "farmers",
    label: "Farmers",
    description: "Farmer user accounts",
    icon: Users,
    templateFile: "farmers_template",
    requiredColumns: ["name", "phone", "name_local", "email", "state_code", "district_name", "block_name", "village_name"],
    supportsFpoPreselect: true,
  },
  {
    type: "partners",
    label: "Partners",
    description: "FPO partners/managers",
    icon: Users,
    templateFile: "partners_template",
    requiredColumns: ["name", "phone", "name_local", "email", "state_code", "district_name", "block_name", "village_name"],
  },
  {
    type: "providers",
    label: "Provider Users",
    description: "Service provider user accounts",
    icon: Users,
    templateFile: "provider_users_template",
    requiredColumns: ["name", "phone", "name_local", "email"],
  },
  {
    type: "admins",
    label: "Admins",
    description: "Admin user accounts",
    icon: Users,
    templateFile: "admins_template",
    requiredColumns: ["name", "phone", "email", "password"],
  },
  {
    type: "fpos",
    label: "FPOs",
    description: "Farmer Producer Organizations",
    icon: Building2,
    templateFile: "fpos_template",
    requiredColumns: ["name", "name_local", "registration_number", "phone", "email", "state_code", "district_name", "block_name", "village_name"],
  },
  {
    type: "service_providers",
    label: "Service Providers",
    description: "Companies selling products",
    icon: Store,
    templateFile: "service_providers_template",
    requiredColumns: ["name", "description", "website", "logo_url"],
  },
  {
    type: "brands",
    label: "Brands",
    description: "Product brand master list",
    icon: Tag,
    templateFile: "brands_template",
    requiredColumns: ["name", "description", "logo_url"],
  },
  {
    type: "products",
    label: "Products",
    description: "Product catalog",
    icon: Package,
    templateFile: "products_template",
    requiredColumns: ["sku_code", "name", "name_local", "description", "category_slug", "provider_name", "brand_name", "unit_code", "pack_size", "mrp", "image_url"],
  },
  {
    type: "districts",
    label: "Districts",
    description: "Geographic districts",
    icon: MapPin,
    templateFile: "districts_template",
    requiredColumns: ["name", "name_local", "state_code", "lgd_code"],
  },
  {
    type: "blocks",
    label: "Blocks",
    description: "Blocks/Talukas",
    icon: MapPin,
    templateFile: "blocks_template",
    requiredColumns: ["name", "name_local", "district_name", "state_code", "lgd_code"],
  },
  {
    type: "villages",
    label: "Villages",
    description: "Villages with GPS",
    icon: MapPin,
    templateFile: "villages_template",
    requiredColumns: ["name", "name_local", "block_name", "district_name", "state_code", "lgd_code", "latitude", "longitude"],
  },
];

interface UploadResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: string[];
}

export function CsvUpload() {
  const [selectedType, setSelectedType] = useState<UploadType>("farmers");
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [previewData, setPreviewData] = useState<Record<string, string>[]>([]);
  const [fullData, setFullData] = useState<Record<string, string>[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [selectedFpoId, setSelectedFpoId] = useState<string | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCSV = (text: string): Record<string, string>[] => {
    const lines = text.trim().split("\n");
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
    return lines.slice(1).map((line) => {
      // Handle quoted values with commas
      const values: string[] = [];
      let current = "";
      let inQuotes = false;

      for (const char of line) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          values.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      const row: Record<string, string> = {};
      headers.forEach((header, i) => {
        row[header] = values[i]?.replace(/^"|"$/g, "") || "";
      });
      return row;
    });
  };

  const parseExcel = (buffer: ArrayBuffer): Record<string, string>[] => {
    const workbook = XLSX.read(buffer, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // Convert to JSON with header row
    const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
      raw: false,
      defval: ""
    });

    // Convert all values to strings
    return jsonData.map(row => {
      const stringRow: Record<string, string> = {};
      Object.entries(row).forEach(([key, value]) => {
        stringRow[key] = String(value ?? "");
      });
      return stringRow;
    });
  };

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

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

        // Store full data and show preview (first 5 rows)
        setFullData(rows);
        setPreviewData(rows.slice(0, 5));
      } catch (err) {
        toast.error("Failed to parse file. Please check the format.");
        console.error("Parse error:", err);
      }

      // Reset file input
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

      switch (selectedType) {
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
          response = await importLocations(fullData, selectedType);
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

  const downloadTemplate = (config: UploadConfig, format: "csv" | "xlsx") => {
    const headers = config.requiredColumns;

    if (format === "csv") {
      // Generate CSV content with headers
      const csvContent = headers.join(",") + "\n";
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${config.templateFile}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      // Generate Excel file
      const worksheet = XLSX.utils.aoa_to_sheet([headers]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
      XLSX.writeFile(workbook, `${config.templateFile}.xlsx`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Data Upload</h1>
        <p className="text-muted-foreground">
          Import data from CSV or Excel files. Assign locations via UI after import.
        </p>
      </div>

      <Tabs value={selectedType} onValueChange={(v) => {
        setSelectedType(v as UploadType);
        setPreviewData([]);
        setFullData([]);
        setResult(null);
        setFileName("");
        setSelectedFpoId(undefined);
      }}>
        <TabsList className="flex-wrap h-auto gap-2 p-2">
          <TabsTrigger value="farmers">Farmers</TabsTrigger>
          <TabsTrigger value="partners">Partners</TabsTrigger>
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="admins">Admins</TabsTrigger>
          <TabsTrigger value="fpos">FPOs</TabsTrigger>
          <TabsTrigger value="service_providers">Service Providers</TabsTrigger>
          <TabsTrigger value="brands">Brands</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="districts">Districts</TabsTrigger>
          <TabsTrigger value="blocks">Blocks</TabsTrigger>
          <TabsTrigger value="villages">Villages</TabsTrigger>
        </TabsList>

        {uploadConfigs.map((uploadConfig) => (
          <TabsContent key={uploadConfig.type} value={uploadConfig.type}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <uploadConfig.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>{uploadConfig.label}</CardTitle>
                      <CardDescription>{uploadConfig.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadTemplate(uploadConfig, "csv")}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      CSV Template
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadTemplate(uploadConfig, "xlsx")}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Excel Template
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* FPO Pre-selection for Farmers */}
                {uploadConfig.supportsFpoPreselect && (
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <div className="flex items-start gap-4">
                      <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
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
                    {uploadConfig.requiredColumns.map((col) => (
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
                    id={`file-upload-${uploadConfig.type}`}
                  />
                  <label
                    htmlFor={`file-upload-${uploadConfig.type}`}
                    className="cursor-pointer"
                  >
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
                        <p className="text-lg font-medium">Drop file here or click to browse</p>
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
                        {selectedFpoId && uploadConfig.supportsFpoPreselect && (
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
                      {result.success ? "Upload Successful" : "Upload Completed with Errors"}
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
                        uploadConfig.type
                      ) && result.imported > 0 && !selectedFpoId && (
                        <p className="mt-2 font-medium">
                          Next: Go to the respective section to assign locations
                        </p>
                      )}
                      {uploadConfig.supportsFpoPreselect && selectedFpoId && result.imported > 0 && (
                        <p className="mt-2 text-green-600 dark:text-green-400 font-medium">
                          {result.imported} farmers were automatically added to the selected FPO
                        </p>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
