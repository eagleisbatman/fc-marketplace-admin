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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Users,
  MapPin,
  MoreHorizontal,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  UserPlus,
  FileText,
} from "lucide-react";
import type { FPO, FPOMember } from "@/types/fpo.types";
import type { FpoDocument } from "@/lib/api";
import { MembersPanel } from "./MembersPanel";
import { DocumentsPanel } from "./DocumentsPanel";

type FPOTableProps = {
  fpos: FPO[];
  expandedFpoId: string | null;
  members: FPOMember[];
  membersLoading: boolean;
  documents: FpoDocument[];
  documentsLoading: boolean;
  onToggleExpand: (fpoId: string) => void;
  onEdit: (fpo: FPO) => void;
  onEditLocation: (fpo: FPO) => void;
  onDelete: (fpo: FPO) => void;
  onAddMember: (fpo: FPO) => void;
  onAddDocument: (fpo: FPO) => void;
  onRemoveMember: (fpo: FPO, member: FPOMember) => void;
  onChangeRole: (fpo: FPO, member: FPOMember) => void;
  onDeleteDocument: (fpo: FPO, doc: FpoDocument) => void;
};

function getFpoLocation(fpo: FPO): string | null {
  if (!fpo.village) return null;
  return `${fpo.village.name}, ${fpo.village.block.district.name}`;
}

export function FPOTable({
  fpos,
  expandedFpoId,
  members,
  membersLoading,
  documents,
  documentsLoading,
  onToggleExpand,
  onEdit,
  onEditLocation,
  onDelete,
  onAddMember,
  onAddDocument,
  onRemoveMember,
  onChangeRole,
  onDeleteDocument,
}: FPOTableProps) {
  if (fpos.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No FPOs in the database yet.</p>
        <p className="text-sm mt-2">
          Create an FPO or go to CSV Upload to import FPOs.
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10"></TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Registration #</TableHead>
            <TableHead>Members</TableHead>
            <TableHead>Location</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fpos.map((fpo) => (
            <Collapsible
              key={fpo.id}
              open={expandedFpoId === fpo.id}
              onOpenChange={() => onToggleExpand(fpo.id)}
              asChild
            >
              <>
                <TableRow className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        {expandedFpoId === fpo.id ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                  </TableCell>
                  <TableCell className="font-medium">
                    {fpo.name}
                    {fpo.nameLocal && (
                      <span className="block text-sm text-muted-foreground">
                        {fpo.nameLocal}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {fpo.registrationNumber ? (
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {fpo.registrationNumber}
                      </code>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      <Users className="mr-1 h-3 w-3" />
                      {fpo._count?.members ?? 0}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {getFpoLocation(fpo) ? (
                      <span className="text-sm">{getFpoLocation(fpo)}</span>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-orange-500 border-orange-500"
                      >
                        Not Set
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(fpo)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEditLocation(fpo)}>
                          <MapPin className="mr-2 h-4 w-4" />
                          {fpo.village ? "Change Location" : "Assign Location"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onAddMember(fpo)}>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Add Member
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onAddDocument(fpo)}>
                          <FileText className="mr-2 h-4 w-4" />
                          Add Document
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(fpo)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
                <CollapsibleContent asChild>
                  <TableRow className="bg-muted/30">
                    <TableCell colSpan={6} className="p-0">
                      <div className="p-4">
                        <Tabs defaultValue="members" className="w-full">
                          <TabsList className="mb-4">
                            <TabsTrigger value="members" className="gap-2">
                              <Users className="h-4 w-4" />
                              Members ({members.length})
                            </TabsTrigger>
                            <TabsTrigger value="documents" className="gap-2">
                              <FileText className="h-4 w-4" />
                              Documents ({documents.length})
                            </TabsTrigger>
                          </TabsList>

                          <TabsContent value="members">
                            <MembersPanel
                              members={members}
                              loading={membersLoading}
                              onAddMember={() => onAddMember(fpo)}
                              onRemoveMember={(member) =>
                                onRemoveMember(fpo, member)
                              }
                              onChangeRole={(member) =>
                                onChangeRole(fpo, member)
                              }
                            />
                          </TabsContent>

                          <TabsContent value="documents">
                            <DocumentsPanel
                              documents={documents}
                              loading={documentsLoading}
                              onAddDocument={() => onAddDocument(fpo)}
                              onDeleteDocument={(doc) =>
                                onDeleteDocument(fpo, doc)
                              }
                            />
                          </TabsContent>
                        </Tabs>
                      </div>
                    </TableCell>
                  </TableRow>
                </CollapsibleContent>
              </>
            </Collapsible>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
