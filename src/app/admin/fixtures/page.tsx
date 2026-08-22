import { AdminSection } from "@/components/admin/admin-section";
export default function Page() {
  return (
    <AdminSection
      title="Fixtures"
      description="Review and manage published schedules."
      items={["Scheduled matches", "Venues", "Officials"]}
    />
  );
}
