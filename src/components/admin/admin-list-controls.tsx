"use client";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import type { AdminListMeta } from "@/lib/admin-list";

export type FilterField = {
  key: string;
  label: string;
  type?: "select" | "text" | "date";
  options?: Array<{ label: string; value: string }>;
};

type AdminFilterBarProps = {
  search: string;
  searchPlaceholder: string;
  onSearchChange: (value: string) => void;
  values: URLSearchParams | ReadonlyURLSearchParams;
  fields?: FilterField[];
  onFilterChange: (key: string, value: string) => void;
  onClear: () => void;
  hasFilters: boolean;
};

type ReadonlyURLSearchParams = Pick<URLSearchParams, "get">;

export function AdminFilterBar({
  search,
  searchPlaceholder,
  onSearchChange,
  values,
  fields = [],
  onFilterChange,
  onClear,
  hasFilters,
}: AdminFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-56 flex-1 sm:max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className="pr-8 pl-8"
        />
        {search ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="absolute top-1/2 right-1 -translate-y-1/2"
            onClick={() => onSearchChange("")}
            aria-label="Clear search"
          >
            <X />
          </Button>
        ) : null}
      </div>
      {fields.map((field) =>
        field.type === "text" || field.type === "date" ? (
          <div key={field.key} className="flex items-center gap-1">
            <Input
              type={field.type ?? "text"}
              value={values.get(field.key) ?? ""}
              onChange={(event) => onFilterChange(field.key, event.target.value)}
              placeholder={field.label}
              aria-label={field.label}
              className="w-40"
            />
            {values.get(field.key) ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => onFilterChange(field.key, "")}
                aria-label={`Clear ${field.label.toLowerCase()}`}
              >
                <X />
              </Button>
            ) : null}
          </div>
        ) : (
          <NativeSelect
            key={field.key}
            value={values.get(field.key) ?? ""}
            onChange={(event) => onFilterChange(field.key, event.target.value)}
            aria-label={field.label}
            className="w-auto min-w-36"
          >
            <NativeSelectOption value="">All {field.label.toLowerCase()}</NativeSelectOption>
            {field.options?.map((option) => (
              <NativeSelectOption key={option.value} value={option.value}>
                {option.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        ),
      )}
      {hasFilters ? (
        <Button type="button" variant="ghost" size="sm" onClick={onClear}>
          <X /> Clear filters
        </Button>
      ) : null}
    </div>
  );
}

export function AdminListPagination({ meta, onPageChange }: { meta: AdminListMeta; onPageChange: (page: number) => void }) {
  if (meta.pageCount <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t px-4 py-3 text-sm">
      <span className="text-muted-foreground">{meta.total} records</span>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={meta.page <= 1} onClick={() => onPageChange(meta.page - 1)}>
          Previous
        </Button>
        <span className="tabular-nums">Page {meta.page} of {meta.pageCount}</span>
        <Button
          variant="outline"
          size="sm"
          disabled={meta.page >= meta.pageCount}
          onClick={() => onPageChange(meta.page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
