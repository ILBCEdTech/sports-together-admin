import { AdminSection } from "@/components/admin/admin-section";
export default function Page() {
  return (
    <AdminSection
      title="Sports"
      description="Configure the tournament sports."
      items={["Football", "Volleyball", "Basketball", "Badminton", "Swimming"]}
    />
  );
}
