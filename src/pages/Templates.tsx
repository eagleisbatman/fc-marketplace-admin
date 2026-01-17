import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download } from "lucide-react";
import { templateCategories } from "@/config/templatePageConfigs";
import { TemplateGrid } from "@/components/templates";

export function Templates() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Import Templates</h1>
        <p className="text-muted-foreground">
          Download templates for bulk data import. Each template includes sample
          data to help you understand the expected format.
        </p>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-2">
          {templateCategories.map((category) => (
            <TabsTrigger
              key={category.id}
              value={category.id}
              className="flex items-center gap-2"
            >
              <category.icon className="h-4 w-4" />
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {templateCategories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-4">
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Download className="h-4 w-4" />
                <span>{category.description}</span>
              </div>
            </div>
            <TemplateGrid templates={category.templates} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
