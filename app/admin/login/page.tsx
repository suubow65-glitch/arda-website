import type { Metadata } from "next";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Admin login",
};

export default function AdminLoginPage() {
  return <LoginForm />;
}
