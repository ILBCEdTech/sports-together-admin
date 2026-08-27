import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Menu } from "lucide-react";
import { siFacebook, siInstagram, siTiktok, siYoutube, type SimpleIcon } from "simple-icons";

import logo from "../../../logo.png";
import { ActiveNavLink } from "./_components/active-nav-link";
import { FixturesNav } from "./_components/fixtures-nav";
import { PastResultsNav } from "./_components/past-results-nav";
import { studentLinks } from "./_components/student-links";
import { StudentsNav } from "./_components/students-nav";
import { teacherLinks } from "./_components/teacher-links";
import { TeachersNav } from "./_components/teachers-nav";

const links = [["Students", "/students"], ["Teachers", "/teachers"], ["Fixtures", "/fixtures"], ["Results", "/results"], ["School Life", "/school-life"], ["Safeguarding", "/#safeguarding"]] as const;

function Brand({ inverted = false }: { inverted?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-3" aria-label="ILBC International School home">
      <Image
        src={logo}
        alt=""
        className={inverted ? "size-20 object-contain" : "size-16 object-contain"}
        preload={!inverted}
      />
      <span className={inverted ? "text-white" : "text-sky-950"}>
        <span className={`block font-serif font-bold leading-none ${inverted ? "text-3xl" : "text-2xl"}`}>ILBC</span>
        <span className={`mt-1 block font-serif font-bold leading-tight ${inverted ? "text-base" : "text-xs sm:text-sm"}`}>
          International School
        </span>
      </span>
    </Link>
  );
}

function SocialIcon({ icon, href }: { icon: SimpleIcon; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="transition-colors hover:text-white"
      aria-label={`ILBC on ${icon.title}`}
    >
      <svg className="size-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
        <path d={icon.path} />
      </svg>
      <span className="sr-only">{icon.title}</span>
    </a>
  );
}

export default function PublicLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="public-site min-h-screen bg-white text-slate-950">
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur"><div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8"><Brand />
      <nav aria-label="Public navigation" className="hidden items-center gap-8 lg:flex">{links.map(([label, href]) => label === "Students" ? <StudentsNav key={label} /> : label === "Teachers" ? <TeachersNav key={label} /> : label === "Fixtures" ? <FixturesNav key={label} /> : label === "Results" ? <PastResultsNav key={label} /> : <ActiveNavLink key={label} label={label} href={href} />)}</nav>
      <Link href="/admin/dashboard" className="hidden h-11 items-center bg-amber-400 px-6 font-black text-slate-950 text-xs uppercase tracking-[0.14em] hover:bg-amber-300 sm:flex">Portal login <ChevronRight className="ml-2 size-4" /></Link>
      <details className="relative lg:hidden"><summary className="grid size-10 cursor-pointer list-none place-items-center border border-slate-200" aria-label="Open menu"><Menu className="size-5" /></summary><nav className="absolute top-12 right-0 flex w-64 flex-col border border-slate-200 bg-white p-3 shadow-xl">{links.map(([label, href]) => label === "Students" ? <div key={label}><span className="block px-3 pt-3 pb-1 font-bold text-slate-500 text-xs uppercase tracking-[0.14em]">Students</span>{studentLinks.map((item) => <ActiveNavLink key={item.href} label={item.label} href={item.href} mobile />)}</div> : label === "Teachers" ? <div key={label}><span className="block px-3 pt-3 pb-1 font-bold text-slate-500 text-xs uppercase tracking-[0.14em]">Teachers</span>{teacherLinks.map((item) => <ActiveNavLink key={item.href} label={item.label} href={item.href} mobile />)}</div> : <ActiveNavLink key={label} label={label} href={href} mobile />)}<Link href="/admin/dashboard" className="mt-2 bg-amber-400 px-3 py-3 font-black text-xs uppercase">Portal login</Link></nav></details>
    </div></header>
    <main>{children}</main>
    <footer className="bg-sky-900 text-white"><div className="mx-auto max-w-7xl px-5 py-16 lg:px-8"><div className="flex flex-col items-center gap-8"><Brand inverted /><nav className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm uppercase">{links.map(([label, href]) => <Link key={label} href={href}>{label}</Link>)}</nav></div><div className="mt-14 flex flex-col gap-5 border-white/15 border-t pt-7 text-white/70 text-xs sm:flex-row sm:items-center sm:justify-between"><p>© 2026 ILBC International School. All rights reserved.</p><nav className="flex gap-5" aria-label="Social media"><SocialIcon icon={siFacebook} href="https://www.facebook.com/ILBCEDU/" /><SocialIcon icon={siInstagram} href="https://www.instagram.com/ilbcofficial" /><SocialIcon icon={siYoutube} href="https://www.youtube.com/user/ILBCEDU" /><SocialIcon icon={siTiktok} href="https://www.tiktok.com/@ilbcofficial" /></nav></div></div></footer>
  </div>;
}
