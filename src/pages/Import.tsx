import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAdmin } from "@/contexts/AdminContext";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Info } from "lucide-react";
import { templates, categories } from "@/config/importTemplates";
import { ImportCard } from "@/components/import";

export function Import() {
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("users");
  const { selectedCountry } = useAdmin();
  const { user } = useAuth();

  // For super_admin without country selected, show warning
  const showCountryWarning = user?.role === "super_admin" && !selectedCountry;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bulk Import</h1>
        <p className="text-muted-foreground">
          Download templates and upload data in bulk. Click on a card to expand
          and see import options.
        </p>
        {selectedCountry && (
          <div className="mt-2 flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Importing for:</span>
            <Badge variant="outline" className="text-sm">
              {selectedCountry.flag} {selectedCountry.name}
            </Badge>
          </div>
        )}
      </div>

      {showCountryWarning && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Country Not Selected</AlertTitle>
          <AlertDescription>
            Please select a country from the header to ensure data is imported
            correctly. Without a country selected, imported data may not be
            associated with the correct region.
          </AlertDescription>
        </Alert>
      )}

      <div className="rounded-lg border bg-blue-50 dark:bg-blue-950/30 p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-sm">How to use</h4>
            <ol className="text-sm text-muted-foreground mt-1 list-decimal list-inside space-y-1">
              <li>
                Select a category and click on the entity type you want to
                import
              </li>
              <li>Download the template (includes sample data)</li>
              <li>Fill in your data following the template format</li>
              <li>Upload your completed file to import the data</li>
            </ol>
          </div>
        </div>
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="flex flex-wrap h-auto gap-2">
          {categories.map((cat) => (
            <TabsTrigger
              key={cat.id}
              value={cat.id}
              className="flex items-center gap-2"
            >
              <cat.icon className="h-4 w-4" />
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((cat) => (
          <TabsContent key={cat.id} value={cat.id} className="space-y-4 mt-4">
            {templates
              .filter((t) => t.category === cat.id)
              .map((template) => (
                <ImportCard
                  key={template.id}
                  template={template}
                  isExpanded={expandedTemplate === template.id}
                  onToggle={() =>
                    setExpandedTemplate(
                      expandedTemplate === template.id ? null : template.id
                    )
                  }
                />
              ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
