import { redirect } from "next/navigation";

export default async function StudentsPage() {
  redirect("/students/teams-players");
}
