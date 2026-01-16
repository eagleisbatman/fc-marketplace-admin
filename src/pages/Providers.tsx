import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Store } from "lucide-react";

export function Providers() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Service Providers</h1>
        <p className="text-muted-foreground">
          Manage service provider companies and coverage areas
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Coming Soon
          </CardTitle>
          <CardDescription>
            Service provider management with coverage area assignment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This section will allow you to:
          </p>
          <ul className="list-disc list-inside mt-2 text-muted-foreground">
            <li>View all service providers</li>
            <li>Assign coverage areas (states/districts)</li>
            <li>Manage provider details</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
