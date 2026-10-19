import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./env";

const LOGIN_PATH = "/admin/login";

function isProtectedAdminPath(pathname: string) {
  return pathname.startsWith("/admin") && !pathname.startsWith(LOGIN_PATH);
}

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = LOGIN_PATH;
  url.search = "";
  url.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

/**
 * Renova a sessão do Supabase a cada requisição e bloqueia o acesso ao
 * painel (/admin/*) para quem não estiver autenticado.
 */
export async function updateSession(request: NextRequest) {
  const env = getSupabaseEnv();

  // Sem Supabase configurado não existe login possível: o painel fica fechado.
  if (!env) {
    return isProtectedAdminPath(request.nextUrl.pathname)
      ? redirectToLogin(request)
      : NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // Não colocar código entre createServerClient e getUser(): é essa chamada
  // que valida o token e dispara a renovação dos cookies.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && isProtectedAdminPath(request.nextUrl.pathname)) {
    return redirectToLogin(request);
  }

  return response;
}
