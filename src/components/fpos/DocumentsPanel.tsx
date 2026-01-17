import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Upload, File, Trash2, ExternalLink } from "lucide-react";
import type { FpoDocument } from "@/lib/api";

type DocumentsPanelProps = {
  documents: FpoDocument[];
  loading: boolean;
  onAddDocument: () => void;
  onDeleteDocument: (doc: FpoDocument) => void;
};

/**
 * Sanitize a URL for safe display/navigation
 * Returns empty string for dangerous URLs (javascript:, data:, etc.)
 */
function sanitizeDocumentUrl(url: string | undefined | null): string {
  if (!url || typeof url !== "string") return "";

  const trimmedUrl = url.trim();
  if (trimmedUrl.length === 0) return "";

  // Check for dangerous protocols
  const lowerUrl = trimmedUrl.toLowerCase();
  if (
    lowerUrl.startsWith("javascript:") ||
    lowerUrl.startsWith("data:") ||
    lowerUrl.startsWith("vbscript:")
  ) {
    console.warn("Blocked dangerous URL:", url);
    return "";
  }

  // Only allow http(s) URLs
  if (!lowerUrl.startsWith("http://") && !lowerUrl.startsWith("https://")) {
    console.warn("Blocked non-http URL:", url);
    return "";
  }

  return trimmedUrl;
}

function getDocumentTypeLabel(type: string): string {
  const types: Record<string, string> = {
    registration: "Registration Certificate",
    license: "License",
    tax: "Tax Document",
    audit: "Audit Report",
    agreement: "Agreement",
    other: "Other",
  };
  return types[type] || type;
}

export function DocumentsPanel({
  documents,
  loading,
  onAddDocument,
  onDeleteDocument,
}: DocumentsPanelProps) {
  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-sm">FPO Documents</h4>
        <Button variant="outline" size="sm" onClick={onAddDocument}>
          <Upload className="mr-2 h-4 w-4" />
          Add Document
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground text-sm">
          No documents uploaded yet. Add registration certificates, licenses, or
          other documents.
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <File className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <span className="font-medium">{doc.name}</span>
                        {doc.description && (
                          <span className="block text-xs text-muted-foreground">
                            {doc.description}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getDocumentTypeLabel(doc.type)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {sanitizeDocumentUrl(doc.fileUrl) && (
                        <Button variant="ghost" size="icon" asChild aria-label="Open document">
                          <a
                            href={sanitizeDocumentUrl(doc.fileUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => onDeleteDocument(doc)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
