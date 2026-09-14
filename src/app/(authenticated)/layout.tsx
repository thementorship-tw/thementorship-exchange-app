import { requireActiveUser } from "@/auth";

export default async function AuthenticatedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireActiveUser();

  return children;
}
