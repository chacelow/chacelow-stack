import { useLocation, useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { authClient } from "@/lib/auth-client";

interface SignOutDialogProps {
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const handleSignOut = useCallback(async () => {
    await authClient.signOut();
    const currentPath = location.href;
    await navigate({
      replace: true,
      search: { redirect: currentPath },
      to: "/sign-in",
    });
  }, [location.href, navigate]);

  return (
    <ConfirmDialog
      className="sm:max-w-sm"
      confirmText="Sign out"
      desc="Are you sure you want to sign out? You will need to sign in again to access your account."
      destructive
      handleConfirm={handleSignOut}
      onOpenChange={onOpenChange}
      open={open}
      title="Sign out"
    />
  );
}
