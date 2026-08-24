import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

const allowedResources = new Set([
  "badminton-courts",
  "fixture-players",
  "fixture-teams",
  "fixtures",
  "officials",
  "gallery-images",
  "players",
  "results",
  "sports",
  "swimming-events",
  "sport-galleries",
  "team-players",
  "teams",
  "tournaments",
  "venues",
]);

async function proxy(request: NextRequest, context: RouteContext<"/api/admin/[resource]/[[...segments]]">) {
  const { resource, segments = [] } = await context.params;
  const hasValidSegments =
    segments.every((segment) => /^\d+$/.test(segment)) ||
    (resource === "sport-galleries" &&
      segments.length === 2 &&
      /^\d+$/.test(segments[0]) &&
      segments[1] === "images");
  if (!allowedResources.has(resource) || !hasValidSegments) {
    return Response.json({ message: "Invalid admin API resource." }, { status: 400 });
  }

  const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000").replace(/\/$/, "");
  const contentType = request.headers.get("content-type");
  const body = request.method === "GET" ? undefined : await request.arrayBuffer();
  const accessToken = (await cookies()).get("admin_access_token")?.value;
  if (!accessToken) return Response.json({ message: "Authentication is required." }, { status: 401 });

  try {
    const query = request.nextUrl.search;
    const response = await fetch(`${baseUrl}/${resource}/${segments.join("/")}${query}`, {
      method: request.method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(contentType ? { "Content-Type": contentType } : {}),
      },
      body,
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
