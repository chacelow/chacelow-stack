import type * as ReactRouter from "@tanstack/react-router";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";

import { PermissionGuard } from "@/components/permission-guard";
import { AccessProvider, type UserAccess } from "@/context/access-context";

vi.mock("@tanstack/react-router", async (importOriginal) => {
	const actual = await importOriginal<typeof ReactRouter>();
	return {
		...actual,
		Link: ({ children, to }: { children?: ReactNode; to: string }) => (
			<a href={to}>{children}</a>
		),
		useNavigate: () => vi.fn(),
		useRouter: () => ({ history: { go: vi.fn() } }),
	};
});

async function renderGuard(permissions: UserAccess["permissions"]) {
	return render(
		<AccessProvider access={{ isSuperAdmin: false, permissions, roles: [] }}>
			<PermissionGuard permission="user:read">
				<div>User administration</div>
			</PermissionGuard>
		</AccessProvider>,
	);
}

describe("PermissionGuard", () => {
	it("拒绝缺少权限的直接路由访问", async () => {
		const screen = await renderGuard([]);

		await expect
			.element(screen.getByText("403", { exact: true }))
			.toBeInTheDocument();
		await expect
			.element(screen.getByText("User administration"))
			.not.toBeInTheDocument();
	});

	it("允许具有所需权限的路由内容", async () => {
		const screen = await renderGuard(["user:read"]);

		await expect
			.element(screen.getByText("User administration"))
			.toBeInTheDocument();
		await expect
			.element(screen.getByText("403", { exact: true }))
			.not.toBeInTheDocument();
	});
});
