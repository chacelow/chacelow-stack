import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, type RenderResult } from "vitest-browser-react";
import { type Locator, userEvent } from "vitest/browser";

import { UserAuthForm } from "./user-auth-form";

const FORM_MESSAGES = {
  emailEmpty: "Please enter your email.",
  passwordEmpty: "Please enter your password.",
  passwordShort: "Password must be at least 8 characters long.",
} as const;

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  signIn: vi.fn(async () => ({ error: null })),
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: { signIn: { email: mocks.signIn } },
}));

vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-router")>();
  return {
    ...actual,
    useNavigate: () => mocks.navigate,
    Link: ({
      children,
      to,
      className,
      ...rest
    }: {
      children?: React.ReactNode;
      to: string;
      className?: string;
    }) => (
      <a href={to} className={className} {...rest}>
        {children}
      </a>
    ),
  };
});


describe("UserAuthForm", () => {
  describe("Rendering without redirectTo", () => {
    let screen: RenderResult;
    let emailInput: Locator;
    let passwordInput: Locator;
    let signInButton: Locator;

    beforeEach(async () => {
      vi.clearAllMocks();
      screen = await render(<UserAuthForm />);
      emailInput = screen.getByRole("textbox", { name: /^Email$/i });
      passwordInput = screen.getByLabelText(/^Password$/i);
      signInButton = screen.getByRole("button", { name: /^Sign in$/i });
    });

    it("渲染登录字段与提交按钮", async () => {
      await expect.element(emailInput).toBeInTheDocument();
      await expect.element(passwordInput).toBeInTheDocument();
      await expect.element(signInButton).toBeInTheDocument();
    });

    it("shows validation messages when submitting empty form", async () => {
      await userEvent.click(signInButton);

      await expect.element(screen.getByText(FORM_MESSAGES.emailEmpty)).toBeInTheDocument();
      await expect.element(screen.getByText(FORM_MESSAGES.passwordEmpty)).toBeInTheDocument();
    });

    it("认证成功后跳转到默认路由", async () => {
      await userEvent.fill(emailInput, "a@b.com");
      await userEvent.fill(passwordInput, "12345678");

      await userEvent.click(signInButton);

      await vi.waitFor(() => expect(mocks.signIn).toHaveBeenCalledOnce());
      expect(mocks.signIn).toHaveBeenCalledWith({
        email: "a@b.com",
        password: "12345678",
      });
      await vi.waitFor(() =>
        expect(mocks.navigate).toHaveBeenCalledWith({ to: "/", replace: true }),
      );
    });
  });

  it("提供 redirectTo 时跳转到指定路由", async () => {
    vi.clearAllMocks();

    const { getByRole, getByLabelText } = await render(
      <UserAuthForm redirectTo="/settings" />,
    );

    await userEvent.fill(getByRole("textbox", { name: /Email/i }), "a@b.com");
    await userEvent.fill(getByLabelText("Password"), "12345678");
    await userEvent.click(getByRole("button", { name: /Sign in/i }));

    await vi.waitFor(() => expect(mocks.signIn).toHaveBeenCalledOnce());
    await vi.waitFor(() =>
      expect(mocks.navigate).toHaveBeenCalledWith({
        to: "/settings",
        replace: true,
      }),
    );
  });
});
