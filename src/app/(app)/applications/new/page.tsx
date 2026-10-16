import { requireUser } from "@/lib/auth/dal";

export default async function Page() {
  const user = await requireUser();
  return <p>Placeholder for applications/new ({user.name})</p>;
}
