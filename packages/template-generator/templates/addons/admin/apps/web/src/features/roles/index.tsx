// biome-ignore-all lint/performance/noJsxPropsBind: role table actions intentionally close over row identifiers.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Plus } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTRPC } from "@/lib/trpc";

interface PermissionItem {
  action: string;
  description: string;
  key: string;
  resource: string;
}
interface RoleItem {
  description: string | null;
  id: string;
  isSystem: boolean;
  name: string;
  permissionKeys: string[];
  slug: string;
  userCount: number;
}
interface RoleDraft {
  description: string;
  id?: string;
  isSystem: boolean;
  name: string;
  permissionKeys: string[];
  slug: string;
}

const EMPTY_ROLE: RoleDraft = {
  description: "",
  isSystem: false,
  name: "",
  permissionKeys: [],
  slug: "",
};
const filterRole = (role: RoleItem, query: string) =>
  !query ||
  role.name.toLowerCase().includes(query) ||
  role.description?.toLowerCase().includes(query) === true;
const getRoleId = (role: RoleItem) => role.id;
const toSlug = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export function Roles() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const rolesQuery = useQuery(trpc.admin.roles.queryOptions());
  const permissionsQuery = useQuery(trpc.admin.permissions.queryOptions());
  const roles = (rolesQuery.data ?? []) as RoleItem[];
  const permissions = (permissionsQuery.data ?? []) as PermissionItem[];
  const [draft, setDraft] = useState<RoleDraft | null>(null);
  const refresh = useCallback(
    () => queryClient.invalidateQueries({ queryKey: trpc.admin.roles.queryKey() }),
    [queryClient, trpc.admin.roles],
  );
  const createRole = useMutation(
    trpc.admin.createRole.mutationOptions({
      onSuccess: async () => {
        await refresh();
        setDraft(null);
        toast.success("Role created");
      },
    }),
  );
  const updateRole = useMutation(
    trpc.admin.updateRole.mutationOptions({
      onSuccess: async () => {
        await refresh();
        setDraft(null);
        toast.success("Role updated");
      },
    }),
  );
  const deleteRole = useMutation(
    trpc.admin.deleteRole.mutationOptions({
      onSuccess: async () => {
        await refresh();
        setDraft(null);
        toast.success("Role deleted");
      },
    }),
  );
  const openNew = useCallback(() => setDraft(EMPTY_ROLE), []);
  const close = useCallback(() => setDraft(null), []);
  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setDraft(null);
    }
  }, []);
  const changeName = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.value;
    setDraft((current) =>
      current ? { ...current, name, slug: current.id ? current.slug : toSlug(name) } : current,
    );
  }, []);
  const changeDescription = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraft((current) => (current ? { ...current, description: event.target.value } : current));
  }, []);
  const togglePermission = useCallback((key: string, checked: boolean) => {
    setDraft((current) => {
      if (!current) {
        return current;
      }
      return {
        ...current,
        permissionKeys: checked
          ? [...current.permissionKeys, key]
          : current.permissionKeys.filter((value) => value !== key),
      };
    });
  }, []);
  const save = useCallback(() => {
    if (!draft) {
      return;
    }
    if (draft.id) {
      updateRole.mutate({
        description: draft.description,
        id: draft.id,
        name: draft.name,
        permissionKeys: draft.permissionKeys,
      });
      return;
    }
    createRole.mutate({
      description: draft.description,
      name: draft.name,
      permissionKeys: draft.permissionKeys,
      slug: draft.slug,
    });
  }, [createRole, draft, updateRole]);
  const remove = useCallback(() => {
    if (draft?.id && !draft.isSystem) {
      deleteRole.mutate({ id: draft.id });
    }
  }, [deleteRole, draft]);
  const columns = useMemo<BusinessColumn<RoleItem>[]>(
    () => [
      {
        header: "Role",
        render: (role) => (
          <div>
            <div className="flex items-center gap-2 font-medium">
              {role.name}
              {role.isSystem ? <Badge variant="outline">Protected</Badge> : null}
            </div>
            <div className="text-muted-foreground text-xs">{role.description}</div>
          </div>
        ),
      },
      {
        header: "Permissions",
        render: (role) => (
          <div className="flex flex-wrap gap-1">
            {role.permissionKeys.slice(0, 3).map((key) => (
              <Badge key={key} variant="secondary">
                {key}
              </Badge>
            ))}
            {role.permissionKeys.length > 3 ? (
              <Badge variant="outline">+{role.permissionKeys.length - 3}</Badge>
            ) : null}
          </div>
        ),
      },
      { header: "Members", render: (role) => role.userCount },
      {
        className: "w-16 text-right",
        header: "Actions",
        render: (role) => (
          <Button
            aria-label={`Manage ${role.name}`}
            onClick={() =>
              setDraft({
                description: role.description ?? "",
                id: role.id,
                isSystem: role.isSystem,
                name: role.name,
                permissionKeys: role.permissionKeys,
                slug: role.slug,
              })
            }
            size="icon"
            variant="ghost"
          >
            <MoreHorizontal />
          </Button>
        ),
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
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-bold text-2xl tracking-tight">Roles & permissions</h2>
            <p className="text-muted-foreground">
              Define reusable access policies for your workspace.
            </p>
          </div>
          <Button onClick={openNew}>
            <Plus />
            Add role
          </Button>
        </div>
        <BusinessDataTable
          columns={columns}
          data={roles}
          empty="No roles found."
          filter={filterRole}
          getRowId={getRoleId}
          placeholder="Filter roles..."
        />
      </Main>
      <Dialog onOpenChange={handleOpenChange} open={draft !== null}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{draft?.id ? `Edit ${draft.name}` : "Add role"}</DialogTitle>
            <DialogDescription>Set role details and choose permissions.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="role-name">Role name</Label>
              <Input
                disabled={draft?.isSystem}
                id="role-name"
                onChange={changeName}
                value={draft?.name ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-description">Description</Label>
              <Textarea
                disabled={draft?.isSystem}
                id="role-description"
                onChange={changeDescription}
                value={draft?.description ?? ""}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Permissions</Label>
            <div className="grid max-h-72 gap-2 overflow-y-auto rounded-md border p-3 sm:grid-cols-2">
              {permissions.map((permission) => (
                <PermissionChoice
                  checked={draft?.permissionKeys.includes(permission.key) ?? false}
                  disabled={draft?.isSystem ?? false}
                  key={permission.key}
                  onToggle={togglePermission}
                  permission={permission}
                />
              ))}
            </div>
          </div>
          <DialogFooter>
            {draft?.id && !draft.isSystem ? (
              <Button onClick={remove} variant="destructive">
                Delete role
              </Button>
            ) : null}
            <Button onClick={close} variant="outline">
              Cancel
            </Button>
            <Button disabled={draft?.isSystem || !draft?.name || !draft.slug} onClick={save}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function PermissionChoice({
  checked,
  disabled,
  onToggle,
  permission,
}: {
  checked: boolean;
  disabled: boolean;
  onToggle: (key: string, checked: boolean) => void;
  permission: PermissionItem;
}) {
  const id = `permission-${permission.key}`;
  const handleToggle = useCallback(
    (value: boolean | "indeterminate") => onToggle(permission.key, value === true),
    [onToggle, permission.key],
  );
  return (
    <Label
      className="flex min-h-14 cursor-pointer items-start gap-3 rounded-md p-3 hover:bg-muted has-disabled:cursor-not-allowed has-disabled:opacity-60"
      htmlFor={id}
    >
      <Checkbox checked={checked} disabled={disabled} id={id} onCheckedChange={handleToggle} />
      <span className="grid gap-0.5">
        <span>
          {permission.resource}: {permission.action}
        </span>
        <span className="font-normal text-muted-foreground text-xs">{permission.description}</span>
      </span>
    </Label>
  );
}
