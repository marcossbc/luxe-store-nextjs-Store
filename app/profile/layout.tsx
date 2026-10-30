import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { getCurrentUser } from "@/lib/auth/session";

export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
  // server-side guard: a signed-out visitor never receives this page at all
  if (!(await getCurrentUser())) redirect("/login?next=/profile");
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
