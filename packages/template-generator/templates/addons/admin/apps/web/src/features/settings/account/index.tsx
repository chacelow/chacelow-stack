import { ContentSection } from "../components/content-section";
import { AccountForm } from "./account-form";

export function SettingsAccount() {
  return (
    <ContentSection
      desc="Change your password and revoke every other active session."
      title="Account security"
    >
      <AccountForm />
    </ContentSection>
  );
}
