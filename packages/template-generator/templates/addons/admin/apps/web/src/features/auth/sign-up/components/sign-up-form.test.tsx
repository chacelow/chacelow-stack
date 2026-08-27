import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, type RenderResult } from "vitest-browser-react";
import { type Locator, userEvent } from "vitest/browser";

import { SignUpForm } from "./sign-up-form";

const FORM_MESSAGES = {
  emailEmpty: "Please enter your email.",
  passwordEmpty: "Please enter your password.",
  confirmPasswordEmpty: "Please confirm your password.",
  passwordMismatch: "Passwords don't match.",
} as const;

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  signUp: vi.fn(async () => ({ error: null })),
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: { signUp: { email: mocks.signUp } },
}));
vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-router")>();
  return { ...actual, useNavigate: () => mocks.navigate };
});
vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

describe("SignUpForm", () => {
  let screen: RenderResult;
  let emailInput: Locator;
  let passwordInput: Locator;
  let confirmPasswordInput: Locator;
  let submitButton: Locator;

  beforeEach(async () => {
    vi.clearAllMocks();
    mocks.signUp.mockResolvedValue({ error: null });

    screen = await render(<SignUpForm />);
    emailInput = screen.getByRole("textbox", { name: /^Email$/i });
    passwordInput = screen.getByLabelText(/^Password$/i);
    confirmPasswordInput = screen.getByLabelText(/^Confirm Password$/i);
    submitButton = screen.getByRole("button", { name: /^Create Account$/i });
  });

  it("渲染注册字段与提交按钮", async () => {
    await expect.element(emailInput).toBeInTheDocument();
    await expect.element(passwordInput).toBeInTheDocument();
    await expect.element(confirmPasswordInput).toBeInTheDocument();
    await expect.element(submitButton).toBeInTheDocument();
  });

  it("提交空表单时显示校验信息", async () => {
    await userEvent.click(submitButton);

    await expect.element(screen.getByText(FORM_MESSAGES.emailEmpty)).toBeInTheDocument();
    await expect.element(screen.getByText(FORM_MESSAGES.passwordEmpty)).toBeInTheDocument();
    await expect.element(screen.getByText(FORM_MESSAGES.confirmPasswordEmpty)).toBeInTheDocument();
  });

  it("两次密码不一致时显示校验信息", async () => {
    await userEvent.fill(emailInput, "a@b.com");
    await userEvent.fill(passwordInput, "1234567");
    await userEvent.fill(confirmPasswordInput, "7654321");

    await userEvent.click(submitButton);
    await expect.element(screen.getByText(FORM_MESSAGES.passwordMismatch)).toBeInTheDocument();
  });

  it("提交期间禁用按钮并在请求完成后恢复", async () => {
    let signUpComplete = false;
    mocks.signUp.mockImplementationOnce(async () => {
      await vi.waitFor(() => expect(signUpComplete).toBe(true));
      return { error: null };
    });
    await userEvent.fill(screen.getByRole("textbox", { name: /^Name$/i }), "Alice");
    await userEvent.fill(emailInput, "a@b.com");
    await userEvent.fill(passwordInput, "12345678");
    await userEvent.fill(confirmPasswordInput, "12345678");

    await userEvent.click(submitButton);
    await expect.element(submitButton).toBeDisabled();
    signUpComplete = true;
    await expect.element(submitButton).toBeEnabled();
    expect(mocks.signUp).toHaveBeenCalledOnce();
    expect(mocks.navigate).toHaveBeenCalledWith({ replace: true, to: "/" });
  });
});
