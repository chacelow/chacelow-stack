import { createFileRoute } from "@tanstack/react-router";
import { PermissionGuard } from "@/components/permission-guard";

import { Roles } from "@/features/roles";

export const Route = createFileRoute("/_authenticated/roles/")({
	component: () => (
		<PermissionGuard permission="role:read">
			<Roles />
		</PermissionGuard>
	),
});
