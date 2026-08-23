import { useCallback, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export function AccountForm() {
  const [pending, setPending] = useState(false);
  const submit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const target = event.currentTarget;
    const data = new FormData(target);
    const newPassword = String(data.get("newPassword") ?? "");
    if (newPassword !== String(data.get("confirmPassword") ?? "")) {
      toast.error("New passwords do not match");
      return;
    }
    setPending(true);
    const { error } = await authClient.changePassword({
      currentPassword: String(data.get("currentPassword") ?? ""),
      newPassword,
      revokeOtherSessions: true,
    });
    setPending(false);
    if (error) {
      toast.error(error.message ?? "Could not change password");
      return;
    }
    target.reset();
    toast.success("Password changed and other sessions revoked");
  }, []);

  return (
    <form className="space-y-8" onSubmit={submit}>
      <div className="space-y-2">
        <Label htmlFor="current-password">Current password</Label>
        <Input
          autoComplete="current-password"
          id="current-password"
          name="currentPassword"
          required
          type="password"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="new-password">New password</Label>
        <Input
          autoComplete="new-password"
          id="new-password"
          minLength={8}
          name="newPassword"
          required
          type="password"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirm new password</Label>
        <Input
          autoComplete="new-password"
          id="confirm-password"
          minLength={8}
          name="confirmPassword"
          required
          type="password"
        />
      </div>
      <Button disabled={pending} type="submit">
        {pending ? "Updating…" : "Change password"}
      </Button>
    </form>
  );
}
