import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Database, Server, ShieldCheck } from "lucide-react";

import { ConfigDrawer } from "@/components/config-drawer";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { ThemeSwitch } from "@/components/theme-switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTRPC } from "@/lib/trpc";

export function Dashboard() {
  const trpc = useTRPC();
  const healthQuery = useQuery(trpc.healthCheck.queryOptions());
  const apiHealthy = healthQuery.data === "OK";

  return (
    <>
      <Header>
        <div className="me-auto">
          <p className="text-sm font-medium">Admin workspace</p>
        </div>
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>
      <Main>
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">System status</h1>
          <p className="mt-1 text-muted-foreground">
            Live status from this generated application. No sample analytics or sales data.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">API</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-lg font-semibold">
                <span className={`h-2.5 w-2.5 rounded-full ${apiHealthy ? "bg-emerald-500" : "bg-amber-500"}`} />
                {healthQuery.isPending ? "Checking" : apiHealthy ? "Healthy" : "Unavailable"}
              </div>
              <CardDescription className="mt-2">tRPC healthCheck is queried in real time.</CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Database</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-lg font-semibold"><CheckCircle2 className="h-5 w-5 text-emerald-600" />PostgreSQL</div>
              <CardDescription className="mt-2">Drizzle schema is the source of truth.</CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Authentication</CardTitle>
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-lg font-semibold"><CheckCircle2 className="h-5 w-5 text-emerald-600" />Better Auth</div>
              <CardDescription className="mt-2">The current page requires a valid server session.</CardDescription>
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  );
}
