import { beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { userEvent } from "vitest/browser";

import { SignOutDialog } from "./sign-out-dialog";

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  signOut: vi.fn(async () => undefined),
}));

const MOCK_HREF = "https://app.test/dashboard?tab=1";

vi.mock("@/lib/auth-client", () => ({
  authClient: { signOut: mocks.signOut },
}));

vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-router")>();
  return {
    ...actual,
    useNavigate: () => mocks.navigate,
    useLocation: () => ({ href: MOCK_HREF }),
  };
});

describe("SignOutDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("退出认证会话后携带当前地址跳转到登录页", async () => {
    const { getByRole } = await render(<SignOutDialog open onOpenChange={vi.fn()} />);

    await userEvent.click(getByRole("button", { name: /^Sign out$/i }));

    expect(mocks.signOut).toHaveBeenCalledOnce();
    expect(mocks.navigate).toHaveBeenCalledWith({
      to: "/sign-in",
      search: { redirect: MOCK_HREF },
      replace: true,
    });
  });

  it("取消退出时不清除会话也不跳转", async () => {
    const { getByRole } = await render(<SignOutDialog open onOpenChange={vi.fn()} />);

    await userEvent.click(getByRole("button", { name: /^Cancel$/i }));

    expect(mocks.signOut).not.toHaveBeenCalled();
    expect(mocks.navigate).not.toHaveBeenCalled();
  });
});
