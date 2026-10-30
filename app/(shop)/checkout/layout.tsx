import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

export default async function CheckoutLayout({ children }: { children: React.ReactNode }) {
  // only signed-in customers can reach checkout (the API enforces the same rule)
  if (!(await getCurrentUser())) redirect("/login?next=/checkout");
  return children;
}
