import { redirect } from "next/navigation";
import { defaultLocale } from "@/i18n";
import metadata from "next/dist/server/typescript/rules/metadata";

export default function RootPage() {
  redirect(`/${defaultLocale}`);
}
