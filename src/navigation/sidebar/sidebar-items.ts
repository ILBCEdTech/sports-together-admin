import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  CalendarRange,
  Images,
  LayoutDashboard,
  MapPin,
  Medal,
  Trophy,
  UserCog,
  UserRound,
  UsersRound,
} from "lucide-react";

export type NavBadge = "new" | "soon";
export interface NavSubItem {
  id: string;
  title: string;
  url: string;
  icon?: LucideIcon;
  badge?: NavBadge;
  disabled?: boolean;
  newTab?: boolean;
}
export interface NavMainLinkItem extends NavSubItem {
  subItems?: never;
}
export interface NavMainParentItem {
  id: string;
  title: string;
  icon?: LucideIcon;
  subItems: NavSubItem[];
}
export type NavMainItem = NavMainLinkItem | NavMainParentItem;
export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Administration",
    items: [
      { id: "dashboard", title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
      { id: "sports", title: "Sports", url: "/admin/sports", icon: Trophy },
      { id: "galleries", title: "Galleries", url: "/admin/galleries", icon: Images },
      { id: "tournaments", title: "Tournaments", url: "/admin/tournaments", icon: CalendarRange },
      { id: "teams", title: "Teams", url: "/admin/teams", icon: UsersRound },
      { id: "players", title: "Players", url: "/admin/players", icon: UserRound },
      { id: "sport-staff", title: "Sport Staff", url: "/admin/sport-staff", icon: UserCog },
      { id: "fixtures", title: "Fixtures", url: "/admin/fixtures", icon: CalendarDays },
      { id: "venues", title: "Venues", url: "/admin/venues", icon: MapPin },
      { id: "results", title: "Results", url: "/admin/results", icon: Medal },
    ],
  },
];
