import { Trophy } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ResultsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-medium text-3xl tracking-tight">Results</h1>
        <p className="text-muted-foreground">Published match and event results will appear here.</p>
      </div>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="size-5" />
            Results pending
          </CardTitle>
          <CardDescription>No final scores have been imported yet.</CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          Use the admin import page when the official result sheet is ready.
        </CardContent>
      </Card>
    </div>
  );
}
