import { AdminSection } from "@/components/admin/admin-section";
export default function Page() {
  return (
    <AdminSection
      title="Players"
      description="Maintain player registrations and divisions."
      items={["Player directory", "Junior divisions", "Senior divisions"]}
    />
  );
}
