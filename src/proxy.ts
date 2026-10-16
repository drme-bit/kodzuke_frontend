import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "@/i18n";

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // пропускаем api, _next, файлы
  if (pathname.startsWith("/api") || pathname.startsWith("/_next") || pathname.includes(".")) {
    return NextResponse.next();
  }
  const hasLocale = locales.some(l => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (hasLocale) {
    const headers = new Headers(req.headers);
    headers.set("x-kodzuke-locale",pathname.split("/")[1]);
    return NextResponse.next({ request: { headers } });
  }

  // редирект на дефолтную локаль (или по Accept-Language)
  const preferences=(req.headers.get("accept-language") ?? "").split(",").map(entry => {
    const [tag,quality]=entry.trim().split(";");
    return { tag:tag.split("-")[0].toLowerCase(), quality:quality?.startsWith("q=") ? Number(quality.slice(2)) : 1 };
  }).filter(entry => entry.quality>0).sort((a,b)=>b.quality-a.quality);
  const locale=preferences.find(entry => locales.some(locale => locale === entry.tag))?.tag ?? defaultLocale;
  req.nextUrl.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(req.nextUrl);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
