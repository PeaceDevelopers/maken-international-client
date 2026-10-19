import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PortalNav from "./portal-nav";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const client = await prisma.client.findUnique({
    where: { id: session.user.id },
    select: { name: true, image: true },
  });

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-page)" }}>
      <PortalNav userName={client?.name ?? session.user?.name ?? ""} userImage={client?.image} />
      <main className="lg:pl-[220px]">
        <div className="px-4 py-5 lg:px-8 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
