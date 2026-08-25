import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { type BusinessColumn, BusinessDataTable } from "@/components/business-data-table";
import { ConfigDrawer } from "@/components/config-drawer";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { Badge } from "@/components/ui/badge";
import { useTRPC } from "@/lib/trpc";

interface AuditItem {
  action: string;
  actorEmail: string | null;
  actorName: string | null;
  createdAt: Date | string;
  id: string;
  ipAddress: string | null;
  targetType: string;
  userAgent: string | null;
}

const filterAudit = (item: AuditItem, query: string) =>
  !query ||
  item.action.toLowerCase().includes(query) ||
  item.actorName?.toLowerCase().includes(query) === true ||
  item.actorEmail?.toLowerCase().includes(query) === true ||
  item.targetType.toLowerCase().includes(query);
const getAuditId = (item: AuditItem) => item.id;

export function Audit() {
  const trpc = useTRPC();
  const logsQuery = useQuery(trpc.admin.auditLogs.queryOptions());
  const logs = (logsQuery.data ?? []) as AuditItem[];
  const columns = useMemo<BusinessColumn<AuditItem>[]>(
    () => [
      {
        header: "Actor",
        render: (item) => (
          <div>
            <div className="font-medium">{item.actorName ?? "System"}</div>
            <div className="text-muted-foreground text-xs">
              {item.actorEmail ?? "Automated action"}
            </div>
          </div>
        ),
      },
      {
        header: "Action",
        render: (item) => <Badge variant="outline">{item.action}</Badge>,
      },
      {
        header: "Resource",
        render: (item) => <span className="capitalize">{item.targetType}</span>,
      },
      {
        header: "Origin",
        render: (item) => (
          <div>
            <div className="font-mono text-xs">{item.ipAddress ?? "Unknown"}</div>
            <div className="max-w-52 truncate text-muted-foreground text-xs">
              {item.userAgent ?? "—"}
            </div>
          </div>
        ),
      },
      {
        className: "whitespace-nowrap text-right",
        header: "Timestamp",
        render: (item) => new Date(item.createdAt).toLocaleString(),
      },
    ],
    [],
  );

  return (
    <>
      <Header fixed>
        <Search className="me-auto" />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>
      <Main className="flex flex-1 flex-col gap-4 sm:gap-6">
        <div>
          <h2 className="font-bold text-2xl tracking-tight">Audit log</h2>
          <p className="text-muted-foreground">Review sensitive administrative activity.</p>
        </div>
        <BusinessDataTable
          columns={columns}
          data={logs}
          empty="No audit events found."
          filter={filterAudit}
          getRowId={getAuditId}
          placeholder="Filter audit events..."
        />
      </Main>
    </>
  );
}
