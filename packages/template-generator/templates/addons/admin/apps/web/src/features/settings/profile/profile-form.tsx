import { useCallback, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export function ProfileForm() {
  const { data: session, refetch } = authClient.useSession();
  const [pending, setPending] = useState(false);
  const submit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      setPending(true);
      const { error } = await authClient.updateUser({
        name: String(form.get("name") ?? "").trim(),
      });
      setPending(false);
      if (error) {
        toast.error(error.message ?? "Could not update profile");
        return;
      }
      await refetch();
      toast.success("Profile updated");
    },
    [refetch],
  );

  return (
    <form className="space-y-8" onSubmit={submit}>
      <div className="space-y-2">
        <Label htmlFor="profile-name">Display name</Label>
        <Input defaultValue={session?.user.name ?? ""} id="profile-name" name="name" required />
        <p className="text-muted-foreground text-sm">
          This is your public display name across the dashboard.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="profile-email">Email</Label>
        <Input disabled id="profile-email" value={session?.user.email ?? ""} />
        <p className="text-muted-foreground text-sm">Your verified sign-in address.</p>
      </div>
      <Button disabled={pending} type="submit">
        {pending ? "Updating…" : "Update profile"}
      </Button>
    </form>
  );
}
