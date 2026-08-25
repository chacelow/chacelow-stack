import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Check, ChevronsUpDown, Copy, MailPlus, Plus, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { ThemeSwitch } from "@/components/theme-switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { authClient } from "@/lib/auth-client";
import { useTRPC } from "@/lib/trpc";

export function Organizations() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const organizations = authClient.useListOrganizations();
  const activeOrganization = authClient.useActiveOrganization();
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [memberId, setMemberId] = useState<string | null>(null);
  const [role, setRole] = useState("member");
  const members = useQuery({
    ...trpc.organization.members.queryOptions(),
    enabled: Boolean(activeOrganization.data?.id),
  });
  const invitations = useQuery({
    ...trpc.organization.invitations.queryOptions(),
    enabled: Boolean(activeOrganization.data?.id),
  });
  const roles = useQuery({
    ...trpc.organization.roles.queryOptions(),
    enabled: Boolean(activeOrganization.data?.id),
  });
  const updateRole = useMutation(
    trpc.organization.updateMemberRole.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: trpc.organization.members.queryKey() });
        setMemberId(null);
        toast.success("Member role updated");
      },
    }),
  );
  const availableRoles = useMemo(
    () => ["owner", "admin", "member", ...(roles.data ?? []).map((item) => item.role)],
    [roles.data],
  );

  const createOrganization = async () => {
    const result = await authClient.organization.create({ name: name.trim(), slug: slug.trim() });
    if (result.error) {
      toast.error(result.error.message ?? "Could not create organization");
      return;
    }
    await authClient.organization.setActive({ organizationId: result.data.id });
    await organizations.refetch();
    setCreateOpen(false);
    setName("");
    setSlug("");
  };
  const createInvitation = async () => {
    const result = await authClient.organization.inviteMember({
      email: inviteEmail.trim(),
      role: inviteRole,
    });
    if (result.error) {
      toast.error(result.error.message ?? "Could not create invitation");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: trpc.organization.invitations.queryKey() });
    setInviteOpen(false);
    setInviteEmail("");
    setInviteRole("member");
    toast.success("Invitation created. Copy its link from the pending invitations list.");
  };

  const copyInvitationLink = async (invitationId: string) => {
    const link = `${window.location.origin}/accept-invitation/${invitationId}`;
    await navigator.clipboard.writeText(link);
    toast.success("Invitation link copied");
  };

  const setActiveOrganization = async (organizationId: string) => {
    const result = await authClient.organization.setActive({ organizationId });
    if (result.error) {
      toast.error(result.error.message ?? "Could not switch organization");
      return;
    }
    await Promise.all([
      activeOrganization.refetch(),
      queryClient.invalidateQueries({ queryKey: trpc.organization.members.queryKey() }),
      queryClient.invalidateQueries({ queryKey: trpc.organization.invitations.queryKey() }),
    ]);
  };

  return (
    <>
      <Header fixed>
        <div className="flex flex-1 items-center gap-2">
          <Building2 className="size-4 text-muted-foreground" />
          <span className="font-medium text-sm">Organization administration</span>
        </div>
        <ThemeSwitch />
        <ProfileDropdown />
      </Header>
      <Main>
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-bold text-2xl tracking-tight">Organizations</h1>
            <p className="text-muted-foreground">Manage real workspaces, members, invitations, and tenant roles.</p>
          </div>
          <Button onClick={() => setCreateOpen(true)}><Plus />Create organization</Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Your organizations</CardTitle>
              <CardDescription>Select the active tenant for all scoped API requests.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {(organizations.data ?? []).map((item) => (
                <button
                  className="flex w-full items-center justify-between rounded-md border p-3 text-left hover:bg-accent"
                  key={item.id}
                  onClick={() => setActiveOrganization(item.id)}
                  type="button"
                >
                  <span><strong className="block text-sm">{item.name}</strong><small className="text-muted-foreground">{item.slug}</small></span>
                  {activeOrganization.data?.id === item.id ? <Check className="size-4" /> : <ChevronsUpDown className="size-4 text-muted-foreground" />}
                </button>
              ))}
              {organizations.data?.length === 0 ? <p className="py-8 text-center text-muted-foreground text-sm">No organizations yet.</p> : null}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader className="flex-row items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2"><Users className="size-4" />Members</CardTitle>
                <Button disabled={!activeOrganization.data} onClick={() => setInviteOpen(true)} size="sm" variant="outline"><MailPlus />Invite member</Button>
              </CardHeader>
              <CardContent className="divide-y">
                {(members.data ?? []).map((item) => (
                  <div className="flex min-h-16 items-center justify-between gap-3" key={item.id}>
                    <div><strong className="block text-sm">{item.name}</strong><small className="text-muted-foreground">{item.email}</small></div>
                    <Button variant="outline" onClick={() => { setMemberId(item.id); setRole(item.role); }}>{item.role}</Button>
                  </div>
                ))}
                {activeOrganization.data && members.data?.length === 0 ? <p className="py-8 text-center text-muted-foreground text-sm">No members found.</p> : null}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Pending invitations</CardTitle><CardDescription>Email delivery is not configured by default. Copy the real acceptance link and send it securely.</CardDescription></CardHeader>
              <CardContent className="divide-y">
                {(invitations.data ?? []).map((item) => (
                  <div className="flex min-h-14 items-center justify-between gap-3" key={item.id}>
                    <span className="min-w-0 truncate text-sm">{item.email}</span>
                    <div className="flex items-center gap-2"><Badge variant="secondary">{item.status}</Badge><Button aria-label={`Copy invitation link for ${item.email}`} onClick={() => copyInvitationLink(item.id)} size="icon" variant="ghost"><Copy /></Button></div>
                  </div>
                ))}
                {activeOrganization.data && invitations.data?.length === 0 ? <p className="py-8 text-center text-muted-foreground text-sm">No pending invitations.</p> : null}
              </CardContent>
            </Card>
          </div>
        </div>
      </Main>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent><DialogHeader><DialogTitle>Create organization</DialogTitle><DialogDescription>Create a real Better Auth organization and become its owner.</DialogDescription></DialogHeader>
          <div className="grid gap-4"><div className="grid gap-2"><Label htmlFor="organization-name">Name</Label><Input id="organization-name" value={name} onChange={(event) => { setName(event.target.value); setSlug(event.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-")); }} /></div><div className="grid gap-2"><Label htmlFor="organization-slug">Slug</Label><Input id="organization-slug" value={slug} onChange={(event) => setSlug(event.target.value)} /></div></div>
          <DialogFooter><Button disabled={!name.trim() || !slug.trim()} onClick={createOrganization}>Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent><DialogHeader><DialogTitle>Invite member</DialogTitle><DialogDescription>Create a real Better Auth invitation. This template exposes a copyable link because email delivery is not configured.</DialogDescription></DialogHeader>
          <div className="grid gap-4"><div className="grid gap-2"><Label htmlFor="invitation-email">Email</Label><Input id="invitation-email" type="email" value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} /></div><div className="grid gap-2"><Label htmlFor="invitation-role">Role</Label><Select value={inviteRole} onValueChange={setInviteRole}><SelectTrigger id="invitation-role"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="member">member</SelectItem><SelectItem value="admin">admin</SelectItem></SelectContent></Select></div></div>
          <DialogFooter><Button disabled={!inviteEmail.trim()} onClick={createInvitation}>Create invitation</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={memberId !== null} onOpenChange={(open) => { if (!open) setMemberId(null); }}>
        <DialogContent><DialogHeader><DialogTitle>Update member role</DialogTitle><DialogDescription>Roles are scoped to the active organization.</DialogDescription></DialogHeader>
          <Select value={role} onValueChange={setRole}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{availableRoles.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select>
          <DialogFooter><Button disabled={!memberId || updateRole.isPending} onClick={() => { if (memberId) updateRole.mutate({ memberId, role }); }}>Save role</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
