import { createFileRoute } from "@tanstack/react-router";
import { PermissionGuard } from "@/components/permission-guard";

import { Users } from "@/features/users";

export const Route = createFileRoute("/_authenticated/users/")({
	component: () => (
		<PermissionGuard permission="user:read">
			<Users />
		</PermissionGuard>
	),
});
