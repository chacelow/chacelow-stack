import { useNavigate, useParams } from "@tanstack/react-router";
import { Building2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

export function AcceptInvitation() {
  const { invitationId } = useParams({ from: "/_authenticated/accept-invitation/$invitationId" });
  const navigate = useNavigate();
  const [isAccepting, setIsAccepting] = useState(false);

  const accept = async () => {
    setIsAccepting(true);
    const result = await authClient.organization.acceptInvitation({ invitationId });
    setIsAccepting(false);
    if (result.error) {
      toast.error(result.error.message ?? "Could not accept invitation");
      return;
    }
    toast.success("Invitation accepted");
    await navigate({ replace: true, to: "/organizations" });
  };

  return (
    <main className="grid min-h-svh place-items-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Building2 className="mb-2 size-8 text-primary" />
          <CardTitle>Organization invitation</CardTitle>
          <CardDescription>
            Join the organization using the invitation issued for your signed-in email address.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" disabled={isAccepting} onClick={accept}>
            {isAccepting ? <Loader2 className="animate-spin" /> : null}
            Accept invitation
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
