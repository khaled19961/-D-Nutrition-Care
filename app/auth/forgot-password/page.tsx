import { SiteChrome } from "@/components/site-chrome";
import ForgotPasswordForm from "@/components/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <SiteChrome>
      <main
        dir="rtl"
        className="min-h-screen bg-[var(--background)] py-8 sm:py-12"
      >
        <div className="container flex min-h-[calc(100vh-180px)] items-center justify-center">
          <ForgotPasswordForm />
        </div>
      </main>
    </SiteChrome>
  );
}
