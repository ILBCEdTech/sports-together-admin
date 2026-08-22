import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminSection({ title, description, items }: { title: string; description: string; items: string[] }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-medium text-3xl tracking-tight">{title}</h1>
        <p className="mt-1 text-muted-foreground">{description}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <Card key={item}>
            <CardHeader>
              <CardTitle>{item}</CardTitle>
              <CardDescription>Ready for event administration.</CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              Manage {item.toLowerCase()} from this workspace.
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
