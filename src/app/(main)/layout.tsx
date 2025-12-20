import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <Header user={user} />
      <main className="flex-1">
        <div className="container max-w-3xl mx-auto p-4 pb-12">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
