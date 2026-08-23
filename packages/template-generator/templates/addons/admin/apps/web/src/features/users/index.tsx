// biome-ignore-all lint/performance/noJsxPropsBind: table and role controls intentionally close over row identifiers.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import { type BusinessColumn, BusinessDataTable } from "@/components/business-data-table";
import { ConfigDrawer } from "@/components/config-drawer";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTRPC } from "@/lib/trpc";

interface RoleOption {
  id: string;
  name: string;
}
interface UserItem {
  banned: boolean | null;
  email: string;
  id: string;
  name: string;
  roles: { roleId: string; roleName: string }[];
}

const filterUser = (user: UserItem, query: string) =>
  !query ||
  user.name.toLowerCase().includes(query) ||
  user.email.toLowerCase().includes(query) ||
  user.roles.some((role) => role.roleName.toLowerCase().includes(query));

export function Users() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const usersQuery = useQuery(trpc.admin.users.queryOptions({ search: "" }));
  const rolesQuery = useQuery(trpc.admin.roles.queryOptions());
  const users = (usersQuery.data ?? []) as UserItem[];
  const roles = (rolesQuery.data ?? []) as RoleOption[];
  const [selected, setSelected] = useState<UserItem | null>(null);
  const refresh = useCallback(
    () => queryClient.invalidateQueries({ queryKey: trpc.admin.users.queryKey() }),
    [queryClient, trpc.admin.users],
  );
  const setRoles = useMutation(
    trpc.admin.setUserRoles.mutationOptions({
      onSuccess: async () => {
        await refresh();
        toast.success("User roles updated");
      },
    }),
  );
  const setBanned = useMutation(
    trpc.admin.setUserBanned.mutationOptions({
      onSuccess: async () => {
        await refresh();
        toast.success("Account status updated");
      },
    }),
  );
  const revokeSessions = useMutation(
    trpc.admin.revokeUserSessions.mutationOptions({
      onSuccess: () => toast.success("User sessions revoked"),
    }),
  );
  const closeDialog = useCallback(() => setSelected(null), []);
  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setSelected(null);
    }
  }, []);
  const toggleRole = useCallback(
    (roleId: string, checked: boolean) => {
      if (!selected) {
        return;
      }
      const current = selected.roles.map((role) => role.roleId);
      const roleIds = checked ? [...current, roleId] : current.filter((id) => id !== roleId);
      setRoles.mutate({ roleIds, userId: selected.id });
      setSelected({
        ...selected,
        roles: roles
          .filter((role) => roleIds.includes(role.id))
          .map((role) => ({ roleId: role.id, roleName: role.name })),
      });
    },
    [roles, selected, setRoles],
  );
  const toggleBan = useCallback(() => {
    if (!selected) {
      return;
    }
    setBanned.mutate({ banned: !selected.banned, userId: selected.id });
    setSelected({ ...selected, banned: !selected.banned });
  }, [selected, setBanned]);
  const revoke = useCallback(() => {
    if (selected) {
      revokeSessions.mutate({ userId: selected.id });
    }
  }, [revokeSessions, selected]);
  const columns = useMemo<BusinessColumn<UserItem>[]>(
    () => [
      {
        header: "User",
        render: (user) => (
          <div>
            <div className="font-medium">{user.name}</div>
            <div className="text-muted-foreground text-xs">{user.email}</div>
          </div>
        ),
      },
      {
        header: "Status",
        render: (user) => (
          <Badge variant={user.banned ? "destructive" : "outline"}>
            {user.banned ? "Suspended" : "Active"}
          </Badge>
        ),
      },
      {
        header: "Roles",
        render: (user) => (
          <div className="flex flex-wrap gap-1">
            {user.roles.length
              ? user.roles.map((role) => (
                  <Badge key={role.roleId} variant="secondary">
                    {role.roleName}
                  </Badge>
                ))
              : "No role"}
          </div>
        ),
      },
      {
        className: "w-16 text-right",
        header: "Actions",
        render: (user) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button aria-label={`Manage ${user.name}`} size="icon" variant="ghost">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSelected(user)}>Manage access</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => revokeSessions.mutate({ userId: user.id })}>
                Revoke sessions
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [revokeSessions],
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
          <h2 className="font-bold text-2xl tracking-tight">User List</h2>
          <p className="text-muted-foreground">
            Manage users, roles, account status, and sessions.
          </p>
        </div>
        <BusinessDataTable
          columns={columns}
          data={users}
          empty="No users found."
          filter={filterUser}
          getRowId={(user) => user.id}
          placeholder="Filter users..."
        />
      </Main>
      <Dialog onOpenChange={handleOpenChange} open={selected !== null}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage {selected?.name}</DialogTitle>
            <DialogDescription>Assign roles and control account access.</DialogDescription>
          </DialogHeader>
          <div className="divide-y rounded-md border">
            {roles.map((role) => (
              <div className="flex min-h-12 items-center gap-3 px-3" key={role.id}>
                <Checkbox
                  checked={selected?.roles.some((item) => item.roleId === role.id)}
                  onCheckedChange={(checked) => toggleRole(role.id, checked === true)}
                />
                <span>{role.name}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={revoke} variant="outline">
              Revoke sessions
            </Button>
            <Button onClick={toggleBan} variant={selected?.banned ? "secondary" : "destructive"}>
              {selected?.banned ? "Enable account" : "Suspend account"}
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={closeDialog}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
