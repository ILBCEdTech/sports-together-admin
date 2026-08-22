import Link from "next/link";

const links = [
  ["Fixtures", "/fixtures"],
  ["Football", "/football"],
  ["Volleyball", "/volleyball"],
  ["Basketball", "/basketball"],
  ["Badminton", "/badminton"],
  ["Swimming", "/swimming"],
  ["Results", "/results"],
];

export default function PublicLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-6">
          <Link href="/" className="font-semibold text-lg tracking-tight">
            Sports Together
          </Link>
          <nav aria-label="Public navigation" className="flex flex-wrap gap-x-5 gap-y-2 text-muted-foreground text-sm">
            {links.map(([label, href]) => (
              <Link key={href} href={href} className="transition-colors hover:text-foreground">
                {label}
              </Link>
            ))}
            <Link href="/admin/dashboard" className="font-medium text-foreground">
              Admin
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-6">{children}</main>
    </div>
  );
}
