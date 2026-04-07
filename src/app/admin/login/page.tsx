import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const metadata = {
  title: "Login · Painel Admin",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
