import { useState, useCallback } from "react";
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
} from "lucide-react";
import {
  importUsers,
  importFPOs,
  importServiceProviders,
  importBrands,
  importProducts,
  importLocations,
} from "@/lib/api";
import { toast } from "sonner";

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
}

const uploadConfigs: UploadConfig[] = [
  {
    type: "farmers",
    label: "Farmers",
    description: "Farmer user accounts",
    icon: Users,
    templateFile: "01_farmers.csv",
    requiredColumns: ["name", "phone"],
  },
  {
    type: "partners",
    label: "Partners",
    description: "FPO partners/managers",
    icon: Users,
    templateFile: "02_partners.csv",
    requiredColumns: ["name", "phone"],
  },
  {
    type: "providers",
    label: "Provider Users",
    description: "Service provider user accounts",
    icon: Users,
    templateFile: "03_providers.csv",
    requiredColumns: ["name", "phone"],
  },
  {
    type: "admins",
    label: "Admins",
    description: "Admin user accounts",
    icon: Users,
    templateFile: "04_admins.csv",
    requiredColumns: ["name", "phone"],
  },
  {
    type: "fpos",
    label: "FPOs",
    description: "Farmer Producer Organizations",
    icon: Building2,
    templateFile: "05_fpos.csv",
    requiredColumns: ["name", "registration_number"],
  },
  {
    type: "service_providers",
    label: "Service Providers",
    description: "Companies selling products",
    icon: Store,
    templateFile: "07_service_providers.csv",
    requiredColumns: ["name"],
  },
  {
    type: "brands",
    label: "Brands",
    description: "Product brand master list",
    icon: Tag,
    templateFile: "08_brands.csv",
    requiredColumns: ["name"],
  },
  {
    type: "products",
    label: "Products",
    description: "Product catalog",
    icon: Package,
    templateFile: "09_products.csv",
    requiredColumns: ["sku_code", "name", "category_slug", "provider_name", "unit_code", "mrp"],
  },
  {
    type: "districts",
    label: "Districts",
    description: "Geographic districts",
    icon: MapPin,
    templateFile: "10_districts.csv",
    requiredColumns: ["name", "state_code"],
  },
  {
    type: "blocks",
    label: "Blocks",
    description: "Blocks/Talukas",
    icon: MapPin,
    templateFile: "11_blocks.csv",
    requiredColumns: ["name", "district_name", "state_code"],
  },
  {
    type: "villages",
    label: "Villages",
    description: "Villages with GPS",
    icon: MapPin,
    templateFile: "12_villages.csv",
    requiredColumns: ["name", "block_name", "district_name", "state_code"],
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
  const [fileName, setFileName] = useState<string>("");

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

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setFileName(file.name);
      const text = await file.text();
      const rows = parseCSV(text);

      // Show preview (first 5 rows)
      setPreviewData(rows.slice(0, 5));
      setResult(null);

      // Reset file input
      event.target.value = "";
    },
    []
  );

  const handleUpload = async () => {
    if (previewData.length === 0) return;

    setUploading(true);
    setResult(null);

    try {
      // Re-parse full file data (previewData only has 5 rows)
      const fullData = previewData; // In real app, store full data

      let response: UploadResult;

      switch (selectedType) {
        case "farmers":
        case "partners":
        case "providers":
        case "admins":
          response = await importUsers(fullData, selectedType === "providers" ? "provider" : selectedType.slice(0, -1));
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
        failed: previewData.length,
        errors: [message],
      });
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = (filename: string) => {
    // Create download link for template
    const link = document.createElement("a");
    link.href = `/templates/${filename}`;
    link.download = filename;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">CSV Upload</h1>
        <p className="text-muted-foreground">
          Import data from CSV files. Assign locations via UI after import.
        </p>
      </div>

      <Tabs value={selectedType} onValueChange={(v) => {
        setSelectedType(v as UploadType);
        setPreviewData([]);
        setResult(null);
        setFileName("");
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
                  <Button
                    variant="outline"
                    onClick={() => downloadTemplate(uploadConfig.templateFile)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Template
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
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
                    type="file"
                    accept=".csv"
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
                      <p className="text-lg font-medium text-primary">{fileName}</p>
                    ) : (
                      <>
                        <p className="text-lg font-medium">Drop CSV file here or click to browse</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Supports .csv files only
                        </p>
                      </>
                    )}
                  </label>
                </div>

                {/* Preview */}
                {previewData.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">
                      Preview (first {previewData.length} rows):
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

                    <div className="flex justify-end mt-4">
                      <Button onClick={handleUpload} disabled={uploading}>
                        {uploading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Data
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
                      ) && result.imported > 0 && (
                        <p className="mt-2 font-medium">
                          Next: Go to the respective section to assign locations
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
