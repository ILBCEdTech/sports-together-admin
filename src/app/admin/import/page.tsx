import { FileSpreadsheet, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ImportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-medium text-3xl tracking-tight">Import</h1>
        <p className="text-muted-foreground">Bring fixture or result workbooks into the admin system.</p>
      </div>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="size-5" />
            Spreadsheet import
          </CardTitle>
          <CardDescription>Upload an approved Excel workbook to start an import.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button disabled>
            <Upload />
            Choose workbook
          </Button>
          <p className="mt-3 text-muted-foreground text-xs">Import processing is ready for backend integration.</p>
        </CardContent>
      </Card>
    </div>
  );
}
