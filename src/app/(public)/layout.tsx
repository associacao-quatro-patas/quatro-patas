import { Suspense } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { WhatsAppFloat } from "@/components/layout/whatsapp-float";
import { Container } from "@/components/ui/container";

export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Container>{children}</Container>
      </main>
      <SiteFooter />
      <Suspense fallback={null}>
        <WhatsAppFloat />
      </Suspense>
    </>
  );
}
