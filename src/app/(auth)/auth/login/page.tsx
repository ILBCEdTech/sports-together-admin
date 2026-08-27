import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ArrowLeft, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import logo from "../../../../../logo.png";

import { LoginForm } from "./_components/login-form";

export const metadata = {
  title: "Admin sign in | Sports Together",
  description: "Sign in to the Sports Together administration workspace.",
};

export default async function AdminLoginPage() {
  const cookieStore = await cookies();
  if (cookieStore.has("admin_access_token")) redirect("/admin/dashboard");

  return (
    <main className="admin-theme relative flex min-h-screen items-center justify-center overflow-hidden bg-muted/30 p-4 sm:p-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-primary" />
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Link href="/" className="flex items-center gap-3" aria-label="Sports Together home">
            <Image src={logo} alt="" className="size-14 object-contain" priority />
            <div>
              <p className="font-heading font-semibold text-lg text-primary leading-tight">Sports Together</p>
              <p className="text-muted-foreground text-sm">Administration</p>
            </div>
          </Link>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShieldCheck className="size-5" />
            </div>
            <CardTitle className="text-xl">Welcome back</CardTitle>
            <CardDescription>Use your administrator account to continue.</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>

        <div className="mt-5 flex justify-center">
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
            <Link href="/">
              <ArrowLeft />
              Back to public site
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
