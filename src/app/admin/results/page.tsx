import { AdminSection } from "@/components/admin/admin-section";
export default function Page() {
  return (
    <AdminSection
      title="Results"
      description="Record scores and publish standings."
      items={["Match results", "Event results", "Standings"]}
    />
  );
}
