import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { sports } from "@/lib/fixture-data";

export default function FixturesPage() {
  return (
    <div className="space-y-6">
      <div>
        <Badge variant="outline">Tournament schedule</Badge>
        <h1 className="mt-3 font-medium text-3xl tracking-tight">Fixtures</h1>
        <p className="mt-1 text-muted-foreground">Choose a sport to view its complete event schedule.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sports.map((sport) => (
          <Card key={sport.slug}>
            <CardHeader>
              <CardTitle>{sport.name}</CardTitle>
              <CardDescription>{sport.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground text-sm">{sport.fixtures.length} entries</span>
              <Button asChild variant="outline" size="sm">
                <Link href={`/${sport.slug}`}>
                  View <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
