"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function useAdminListQuery() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("q") ?? "";
  const [search, setSearch] = useState(urlSearch);
  const [isPending, startTransition] = useTransition();

  useEffect(() => setSearch(urlSearch), [urlSearch]);

  const replace = useCallback((params: URLSearchParams) => {
    const query = params.toString();
    startTransition(() => router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false }));
  }, [pathname, router]);

  const setFilter = useCallback((name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(name, value);
    else params.delete(name);
    params.delete("page");
    replace(params);
  }, [replace, searchParams]);

  useEffect(() => {
    if (search === urlSearch) return;
    const timeout = window.setTimeout(() => setFilter("q", search), 350);
    return () => window.clearTimeout(timeout);
  }, [search, setFilter, urlSearch]);

  const requestQuery = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (!params.has("page")) params.set("page", "1");
    if (!params.has("pageSize")) params.set("pageSize", "20");
    return params.toString();
  }, [searchParams]);

  const clearFilters = useCallback(() => {
    setSearch("");
    replace(new URLSearchParams());
  }, [replace]);

  const setPage = useCallback((page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page > 1) params.set("page", String(page));
    else params.delete("page");
    replace(params);
  }, [replace, searchParams]);

  return {
    search,
    setSearch,
    setFilter,
    clearFilters,
    setPage,
    requestQuery,
    isPending,
    values: searchParams,
    hasFilters: [...searchParams.keys()].some((key) => key !== "page" && key !== "pageSize"),
  };
}
