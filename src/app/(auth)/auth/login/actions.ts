"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type LoginState = {
  message?: string;
  errors?: {
    email?: string;
    password?: string;
  };
};

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

type ErrorResponse = {
  message?: string | string[];
};

export async function login(_state: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const errors: LoginState["errors"] = {};

  if (!email) errors.email = "Enter your email address.";
  else if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = "Enter a valid email address.";
  if (!password) errors.password = "Enter your password.";

  if (Object.keys(errors).length > 0) return { errors };

  const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000").replace(/\/$/, "");
  let response: Response;

  try {
    response = await fetch(`${baseUrl}/auth/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
  } catch {
    return { message: "The Sports Together authentication service is unavailable. Please try again." };
  }

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as ErrorResponse | null;
    const backendMessage = Array.isArray(payload?.message) ? payload.message[0] : payload?.message;
    return {
      message:
        response.status === 401
          ? "The email or password is incorrect, or this account cannot access administration."
          : (backendMessage ?? "Unable to sign in. Please try again."),
    };
  }

  const payload = (await response.json()) as LoginResponse;
  if (!payload.accessToken || !payload.refreshToken || !Number.isFinite(payload.expiresIn)) {
    return { message: "The authentication service returned an invalid response." };
  }

  const cookieStore = await cookies();
  const secure = process.env.NODE_ENV === "production";
  cookieStore.set("admin_access_token", payload.accessToken, {
    httpOnly: true,
    maxAge: payload.expiresIn,
    path: "/",
    sameSite: "lax",
    secure,
  });
  cookieStore.set("admin_refresh_token", payload.refreshToken, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    sameSite: "lax",
    secure,
  });

  redirect("/admin/dashboard");
}
