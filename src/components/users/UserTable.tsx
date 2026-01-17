import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { MoreHorizontal, Pencil, MapPin, Trash2 } from "lucide-react";
import type { User } from "@/types/user.types";

type UserTableProps = {
  users: User[];
  selectedUsers: Set<string>;
  onToggleSelection: (userId: string) => void;
  onToggleAll: () => void;
  onEdit: (user: User) => void;
  onEditLocation: (user: User) => void;
  onDelete: (user: User) => void;
};

function getUserLocation(user: User): string | null {
  if (!user.village) return null;
  return `${user.village.name}, ${user.village.block.district.name}`;
}

function getUserFpo(user: User): string | null {
  if (!user.fpoMemberships || user.fpoMemberships.length === 0) return null;
  return user.fpoMemberships[0].fpo.name;
}

export function UserTable({
  users,
  selectedUsers,
  onToggleSelection,
  onToggleAll,
  onEdit,
  onEditLocation,
  onDelete,
}: UserTableProps) {
  const allSelected = selectedUsers.size === users.length && users.length > 0;

  return (
    <div className="border rounded-lg overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                onCheckedChange={onToggleAll}
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>FPO</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedUsers.has(user.id)}
                    onCheckedChange={() => onToggleSelection(user.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {user.name}
                  {user.nameLocal && (
                    <span className="block text-sm text-muted-foreground">
                      {user.nameLocal}
                    </span>
                  )}
                </TableCell>
                <TableCell>{user.phone || "-"}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      user.type === "farmer"
                        ? "default"
                        : user.type === "partner"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {user.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  {getUserLocation(user) ? (
                    <span className="text-sm">{getUserLocation(user)}</span>
                  ) : (
                    <Badge variant="outline" className="text-orange-500 border-orange-500">
                      Not Set
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {getUserFpo(user) ? (
                    <span className="text-sm">{getUserFpo(user)}</span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
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
                      <DropdownMenuItem onClick={() => onEdit(user)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEditLocation(user)}>
                        <MapPin className="mr-2 h-4 w-4" />
                        {user.village ? "Change Location" : "Assign Location"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(user)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
