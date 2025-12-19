import { getSession } from "@/lib/auth/session";
import { getUsers } from "@/lib/db/queries/users";
import { UserList } from "./_components/user-list";
import { CreateUserDialog } from "./_components/create-user-dialog";
import { PageHeader } from "@/components/common/page-header";

export default async function UsersPage() {
  const session = await getSession();
  const isAdmin = session?.isAdmin ?? false;
  const users = await getUsers();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader title="👨 雀士一覧" description="登録されている雀士の管理" />
        <div>
          {isAdmin && <CreateUserDialog />}
        </div>
      </div>
      <UserList users={users} isAdmin={isAdmin} currentUserId={session?.id} />
    </div>
  );
}
