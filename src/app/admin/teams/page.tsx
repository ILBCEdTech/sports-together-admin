import { AdminSection } from "@/components/admin/admin-section";
export default function Page() {
  return (
    <AdminSection
      title="Teams"
      description="Manage participating teams and coaches."
      items={["Team I", "Team L", "Team B", "Team C"]}
    />
  );
}
