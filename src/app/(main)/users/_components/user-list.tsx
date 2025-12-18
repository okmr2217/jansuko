"use client";

import { User } from "@/lib/db/queries/users";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EditUserDialog } from "./edit-user-dialog";
import { DeleteUserDialog } from "./delete-user-dialog";

interface UserListProps {
  users: User[];
  isAdmin: boolean;
  currentUserId?: string;
}

export function UserList({ users, isAdmin, currentUserId }: UserListProps) {
  if (users.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">雀士が登録されていません</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>表示名</TableHead>
            <TableHead>権限</TableHead>
            <TableHead>登録日</TableHead>
            {isAdmin && <TableHead className="w-[100px]">操作</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.displayName}</TableCell>
              <TableCell>
                {user.isAdmin ? (
                  <Badge variant="default">管理者</Badge>
                ) : (
                  <Badge variant="secondary">一般</Badge>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(user.createdAt).toLocaleDateString("ja-JP")}
              </TableCell>
              {isAdmin && (
                <TableCell>
                  <div className="flex items-center gap-2">
                    <EditUserDialog user={user} />
                    <DeleteUserDialog
                      user={user}
                      disabled={user.id === currentUserId}
                    />
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
