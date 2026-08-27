import { createFileRoute } from "@tanstack/react-router";
import { PermissionGuard } from "@/components/permission-guard";

import { Audit } from "@/features/audit";

export const Route = createFileRoute("/_authenticated/audit/")({
	component: () => (
		<PermissionGuard permission="audit:read">
			<Audit />
		</PermissionGuard>
	),
});
