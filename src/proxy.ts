import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// "proxy" é o novo nome do antigo "middleware" a partir do Next.js 16.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // Ignora arquivos estáticos, otimização de imagens e arquivos com extensão.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)",
  ],
};
