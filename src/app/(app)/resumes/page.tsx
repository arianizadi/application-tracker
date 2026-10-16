import { requireUser } from "@/lib/auth/dal";

export default async function Page() {
  const user = await requireUser();
  return <p>Placeholder for resumes ({user.name})</p>;
}
