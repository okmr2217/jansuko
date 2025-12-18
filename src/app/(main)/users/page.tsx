import { getSession } from "@/lib/auth/session";
import { getUsers } from "@/lib/db/queries/users";
import { UserList } from "./_components/user-list";
import { CreateUserDialog } from "./_components/create-user-dialog";

export default async function UsersPage() {
  const session = await getSession();
  const isAdmin = session?.isAdmin ?? false;
  const users = await getUsers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">雀士一覧</h1>
          <p className="text-muted-foreground">登録されている雀士の管理</p>
        </div>
        {isAdmin && <CreateUserDialog />}
      </div>
      <UserList users={users} isAdmin={isAdmin} currentUserId={session?.id} />
    </div>
  );
}
