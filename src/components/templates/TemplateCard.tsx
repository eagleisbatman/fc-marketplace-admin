import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileSpreadsheet, FileText } from "lucide-react";
import { downloadCSVGeneric, downloadExcelGeneric } from "@/components/import";
import type { TemplatePageConfig } from "@/config/templatePageConfigs";

type TemplateCardProps = {
  template: TemplatePageConfig;
};

export function TemplateCard({ template }: TemplateCardProps) {
  const Icon = template.icon;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-lg">{template.title}</CardTitle>
        </div>
        <CardDescription>{template.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="text-sm text-muted-foreground">
          <p className="font-medium mb-2">Columns:</p>
          <div className="flex flex-wrap gap-1">
            {template.columns.map((col) => (
              <span
                key={col}
                className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium"
              >
                {col}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => downloadCSVGeneric(template)}
        >
          <FileText className="mr-2 h-4 w-4" />
          CSV
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => downloadExcelGeneric(template)}
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Excel
        </Button>
      </CardFooter>
    </Card>
  );
}

type TemplateGridProps = {
  templates: TemplatePageConfig[];
};

export function TemplateGrid({ templates }: TemplateGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {templates.map((template) => (
        <TemplateCard key={template.id} template={template} />
      ))}
    </div>
  );
}
