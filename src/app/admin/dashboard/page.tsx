import { AdminSection } from "@/components/admin/admin-section";
export default function Page() {
  return (
    <AdminSection
      title="Dashboard"
      description="Tournament operations at a glance."
      items={["Five sports", "Upcoming fixtures", "Pending results"]}
    />
  );
}
