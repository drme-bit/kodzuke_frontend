import type { ReactNode } from "react";
import { AccountGallery } from "./AccountGallery";

interface AuthLayoutProps {
  locale: string;
  title: string;
  children: ReactNode;
}

export function AuthLayout({ locale, title, children }: AuthLayoutProps) {
  return (
    <main className="account-page">
      <AccountGallery locale={locale} />
      <section className="account-form-panel">
        <div className="account-content">
          <header className="account-heading">
            <h1>{title}</h1>
          </header>
          {children}
        </div>
      </section>
    </main>
  );
}
