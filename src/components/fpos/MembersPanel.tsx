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
import { Loader2, UserPlus, UserMinus } from "lucide-react";
import type { FPOMember } from "@/types/fpo.types";

type MembersPanelProps = {
  members: FPOMember[];
  loading: boolean;
  onAddMember: () => void;
  onRemoveMember: (member: FPOMember) => void;
  onChangeRole: (member: FPOMember) => void;
};

export function MembersPanel({
  members,
  loading,
  onAddMember,
  onRemoveMember,
  onChangeRole,
}: MembersPanelProps) {
  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-sm">FPO Members</h4>
        <Button variant="outline" size="sm" onClick={onAddMember}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground text-sm">
          No members yet. Add farmers to this FPO.
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    {member.user.name}
                    {member.user.nameLocal && (
                      <span className="block text-xs text-muted-foreground">
                        {member.user.nameLocal}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{member.user.phone || "-"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        member.role === "admin"
                          ? "default"
                          : member.role === "manager"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(member.joinedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onChangeRole(member)}
                      >
                        Change Role
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => onRemoveMember(member)}
                      >
                        <UserMinus className="h-4 w-4" />
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
