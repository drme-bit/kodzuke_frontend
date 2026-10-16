import {
  AuthRoute,
  type AuthRouteProps,
} from "@/features/auth/components/AuthRoute";

export default function Page(props: AuthRouteProps) {
  return <AuthRoute {...props} mode="register" />;
}
