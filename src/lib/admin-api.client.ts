export async function adminApi<T>(resource: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/admin/${resource}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const payload = (await response.json().catch(() => null)) as { message?: string } | null;
  if (!response.ok) throw new Error(payload?.message ?? "The request could not be completed.");
  return payload as T;
}
