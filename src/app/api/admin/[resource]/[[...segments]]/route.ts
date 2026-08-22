import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

const allowedResources = new Set([
  "fixture-players",
  "fixture-teams",
  "fixtures",
  "players",
  "results",
  "sports",
  "team-players",
  "teams",
  "tournaments",
  "venues",
]);

async function proxy(request: NextRequest, context: RouteContext<"/api/admin/[resource]/[[...segments]]">) {
  const { resource, segments = [] } = await context.params;
  if (!allowedResources.has(resource) || segments.some((segment) => !/^\d+$/.test(segment))) {
    return Response.json({ message: "Invalid admin API resource." }, { status: 400 });
  }

  const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000").replace(/\/$/, "");
  const body = request.method === "GET" ? undefined : await request.text();
  const accessToken = (await cookies()).get("admin_access_token")?.value;
  if (!accessToken) return Response.json({ message: "Authentication is required." }, { status: 401 });

  try {
    const response = await fetch(`${baseUrl}/${resource}/${segments.join("/")}`, {
      method: request.method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body || undefined,
      cache: "no-store",
    });
    return new Response(await response.text(), {
      status: response.status,
      headers: { "Content-Type": response.headers.get("Content-Type") ?? "application/json" },
    });
  } catch {
    return Response.json({ message: "The Sports Together backend is unavailable." }, { status: 503 });
  }
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
