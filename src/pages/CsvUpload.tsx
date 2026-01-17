import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { uploadConfigs, type UploadType } from "@/config/uploadConfigs";
import { UploadCard } from "@/components/csvupload";

export function CsvUpload() {
  const [selectedType, setSelectedType] = useState<UploadType>("farmers");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Data Upload</h1>
        <p className="text-muted-foreground">
          Import data from CSV or Excel files. Assign locations via UI after
          import.
        </p>
      </div>

      <Tabs
        value={selectedType}
        onValueChange={(v) => setSelectedType(v as UploadType)}
      >
        <TabsList className="flex-wrap h-auto gap-2 p-2">
          {uploadConfigs.map((config) => (
            <TabsTrigger key={config.type} value={config.type}>
              {config.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {uploadConfigs.map((config) => (
          <TabsContent key={config.type} value={config.type}>
            <UploadCard config={config} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
