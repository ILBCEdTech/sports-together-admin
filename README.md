# Sports Together

Sports Together is a responsive web application for publishing tournament schedules and providing an administration workspace for sports, teams, players, fixtures, results, and spreadsheet imports.

The public site currently presents the 2026-27 competition program for five sports: football, volleyball, swimming, basketball, and badminton. Each sport has a dedicated schedule with divisions, times, venues, pairings or activities, officials, equipment, and event notes where applicable.

## Current Status

The public fixture experience and the admin interface are implemented as a frontend prototype.

- Fixture schedules are read from static TypeScript data in `src/lib/fixture-data.ts`.
- The results page is an empty state until official results are connected.
- The tournaments, sports, fixtures, venues, and officials admin areas load and save records through the Sports Together backend
  API and PostgreSQL database.
- Spreadsheet selection is disabled until import processing and a backend are added.
- Authentication, authorization, database persistence, and external APIs are not currently configured.

## Features

- Public landing page with an overview of all competitions
- Combined fixtures directory
- Dedicated pages for football, volleyball, swimming, basketball, and badminton
- Responsive fixture tables with event details and official information
- Results publishing placeholder
- Separate responsive admin workspace
- Admin sections for sports, teams, players, fixtures, results, and imports
- Light and dark theme support with reusable theme presets
- Accessible components built with the local shadcn/ui `radix-nova` setup
- Vercel Analytics integration

## Tech Stack

- Next.js 16 App Router
- React 19 and TypeScript
- Tailwind CSS v4
- shadcn/ui with Radix UI and Base UI primitives
- Lucide React icons
- Zustand for persisted interface preferences
- Zod and React Hook Form
- TanStack Table and Recharts
- Biome for linting and formatting

## Routes

### Public

| Route | Purpose |
| --- | --- |
| `/` | Competition overview |
| `/fixtures` | All fixture schedules |
| `/results` | Published results area |
| `/football` | Football schedule |
| `/volleyball` | Volleyball schedule |
| `/swimming` | Swimming program |
| `/basketball` | Basketball schedule |
| `/badminton` | Badminton schedule |

### Administration

| Route | Purpose |
| --- | --- |
| `/admin` | Redirects to the admin dashboard |
| `/admin/dashboard` | Administration overview |
| `/admin/sports` | Sport configuration workspace |
| `/admin/tournaments` | Tournament management workspace |
| `/admin/teams` | Team management workspace |
| `/admin/players` | Player registration workspace |
| `/admin/fixtures` | Fixture management workspace |
| `/admin/venues` | Venue management workspace |
| `/admin/officials` | Official management workspace |
| `/admin/results` | Results and standings workspace |
| `/admin/import` | Spreadsheet import workspace |

## Getting Started

### Requirements

- Node.js 20.9 or newer
- npm

### Installation

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the public site or [http://localhost:3000/admin](http://localhost:3000/admin) for the administration workspace.

The admin API proxy uses `NEXT_PUBLIC_API_BASE_URL`. It defaults to `http://localhost:5000` for local development.

### Production

```bash
npm run build
npm run start
```

## Available Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Create a production build |
| `npm run start` | Run the production server |
| `npm run lint` | Run Biome lint checks |
| `npm run format` | Format the codebase with Biome |
| `npm run check` | Run Biome formatting, lint, and import checks |
| `npm run check:fix` | Apply safe Biome fixes |
| `npm run generate:presets` | Regenerate theme preset CSS |

## Project Structure

```text
src/
|-- app/
|   |-- (public)/          # Public competition pages
|   |-- admin/             # Administration routes and layout
|   |-- globals.css        # Tailwind and global styles
|   `-- layout.tsx         # Root providers and metadata
|-- components/
|   |-- admin/             # Shared admin components
|   `-- ui/                # Local shadcn/ui components
|-- config/                # Application metadata
|-- hooks/                 # Shared React hooks
|-- lib/
|   |-- fixture-data.ts    # Current sports and fixture source
|   `-- preferences/       # Theme and layout preferences
|-- navigation/            # Navigation definitions
|-- scripts/               # Theme boot and preset generation
|-- server/                # Server actions
|-- stores/                # Zustand stores and providers
`-- styles/presets/        # Theme preset styles
```

Public routes are grouped under `src/app/(public)` without adding a URL segment. Admin routes live under `src/app/admin` and use a separate navigation layout.

## Development Notes

- Keep route-specific components beside the route that owns them.
- Reuse components from `src/components/ui` without modifying their source.
- Use semantic theme tokens so changes work across light mode, dark mode, and presets.
- Follow the repository's Biome rules: double quotes, semicolons, two-space indentation, sorted imports, and a 120-character line width.
- Use conventional commit prefixes such as `feat:`, `fix:`, `refactor:`, `docs:`, and `chore:`.

See [CONTRIBUTING.md](CONTRIBUTING.md) and [AGENTS.md](AGENTS.md) for the full contribution and implementation guidelines.

## License

This project is distributed under the terms in [LICENSE](LICENSE).
