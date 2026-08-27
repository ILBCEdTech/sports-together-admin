"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const fixturePaths = ["/fixtures", "/football", "/volleyball", "/swimming", "/basketball", "/badminton"];

export function ActiveNavLink({
  label,
  href,
  mobile = false,
}: {
  label: string;
  href: string;
  mobile?: boolean;
}) {
  const pathname = usePathname();
  const [hash, setHash] = useState("");

  useEffect(() => {
    const updateHash = () => setHash(window.location.hash);
    window.addEventListener("hashchange", updateHash);
    return () => window.removeEventListener("hashchange", updateHash);
  }, []);

  useEffect(() => {
    setHash(window.location.hash);
  }, [pathname]);

  let active = pathname === href || pathname.startsWith(`${href}/`);

  if (label === "Fixtures") {
    active = fixturePaths.includes(pathname);
  } else if (label === "Results") {
    active = pathname === "/results" || pathname.startsWith("/results/");
  } else if (label === "Safeguarding") {
    active = pathname === "/" && hash === "#safeguarding";
  }

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={
        mobile
          ? `border-l-4 px-3 py-3 font-bold text-sm uppercase ${active ? "border-sky-700 bg-sky-50 text-sky-800" : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-sky-900"}`
          : `font-bold text-xs uppercase tracking-[0.14em] ${active ? "text-sky-700" : "text-slate-500 hover:text-sky-900"}`
      }
    >
      {label}
    </Link>
  );
}
