import {
  LayoutDashboard,
  Calendar,
  Users,
  Tag,
  MessageSquare,
  Settings,
  Bell,
  Megaphone,
  TrendingUp,
  Clock,
  LogOut,
  User,
  CreditCard,
  Building,
  Magnet,
  RefreshCcw,
} from 'lucide-react'

export interface NavItem {
  title: string
  href: string
  icon: any
  badge?: number
  items?: NavItem[]
}

export const MAIN_NAV: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Leads',
    href: '/leads',
    icon: Magnet,
  },
  {
    title: 'Recalls',
    href: '/recalls',
    icon: RefreshCcw,
  },
  {
    title: 'Appointments',
    href: '/appointments',
    icon: Calendar,
    items: [
      { title: 'All Appointments', href: '/appointments', icon: Calendar },
      { title: 'Calendar', href: '/appointments/calendar', icon: Calendar },
    ],
  },
  {
    title: 'Journeys',
    href: '/journeys',
    icon: LayoutDashboard, // Or another icon if available, e.g., Map or Route
  },
  {
    title: 'Patients',
    href: '/patients',
    icon: Users,
    items: [
      { title: 'All Patients', href: '/patients', icon: Users },
      { title: 'Import', href: '/patients/import', icon: Users },
    ],
  },
  {
    title: 'Services',
    href: '/services',
    icon: Tag,
  },
]

export const COMMUNICATION_NAV: NavItem[] = [
  {
    title: 'Reminders',
    href: '/reminders',
    icon: MessageSquare,
    items: [
      { title: 'Logs', href: '/reminders/logs', icon: MessageSquare },
      { title: 'Settings', href: '/settings/reminders', icon: Settings },
    ],
  },
  {
    title: 'Campaigns',
    href: '/campaigns',
    icon: Megaphone,
  },
  {
    title: 'Follow-ups',
    href: '/followups',
    icon: Bell,
  },
]

export const INSIGHTS_NAV: NavItem[] = [
  {
    title: 'Reports',
    href: '/reports',
    icon: TrendingUp,
    items: [
      { title: 'Overview', href: '/reports', icon: TrendingUp },
      { title: 'No-Shows', href: '/reports/no-shows', icon: LogOut },
      { title: 'Revenue', href: '/reports/revenue', icon: CreditCard },
    ],
  },
  {
    title: 'Waiting List',
    href: '/waiting-list',
    icon: Clock,
  },
]

export const SETTINGS_NAV: NavItem[] = [
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    items: [
      { title: 'General', href: '/settings', icon: Building },
      { title: 'Doctors & Staff', href: '/settings/doctors', icon: User },
      { title: 'WhatsApp', href: '/settings/whatsapp', icon: MessageSquare },
      { title: 'Reminders', href: '/settings/reminders', icon: Bell },
      { title: 'Billing', href: '/settings/billing', icon: CreditCard },
    ],
  },
]
