'use client';

import { useRouter } from 'next/navigation';
import {
  Settings,
  Bell,
  MessageSquare,
  Users,
  CreditCard,
  ChevronRight,
} from 'lucide-react';
import { PageHeader, PageCard } from '@/components/dashboard/PageStructure';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';

interface SettingCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  badge?: { label: string; variant: 'success' | 'warning' | 'info' };
}

const settingCards: SettingCard[] = [
  {
    id: 'clinic',
    title: 'Clinic Information',
    description: 'Manage clinic details, hours, and contact information',
    icon: <Settings className="w-8 h-8 text-medical-500" />,
    href: '/settings',
  },
  {
    id: 'reminders',
    title: 'Reminders & Notifications',
    description: 'Configure patient reminders, email templates, and notifications',
    icon: <Bell className="w-8 h-8 text-medical-500" />,
    href: '/settings/reminders',
  },
  {
    id: 'whatsapp',
    title: 'WhatsApp Integration',
    description: 'Manage WhatsApp templates and messaging settings',
    icon: <MessageSquare className="w-8 h-8 text-medical-500" />,
    href: '/settings/whatsapp',
  },
  {
    id: 'doctors',
    title: 'Doctors & Staff',
    description: 'Add, edit, and manage doctor profiles and availability',
    icon: <Users className="w-8 h-8 text-medical-500" />,
    href: '/settings/doctors',
  },
  {
    id: 'billing',
    title: 'Subscription & Billing',
    description: 'Manage subscription plan, payment methods, and invoices',
    icon: <CreditCard className="w-8 h-8 text-medical-500" />,
    href: '/settings/billing',
  },
];

export default function SettingsPage() {
  const router = useRouter();

  const handleCardClick = (href: string) => {
    router.push(href);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        breadcrumb={<Breadcrumbs />}
        title="Settings"
        description="Configure your clinic settings, doctors, integrations, and billing"
      />

      {/* Settings Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settingCards.map((setting) => (
          <button
            key={setting.id}
            onClick={() => handleCardClick(setting.href)}
            className="text-left hover:shadow-md transition-shadow"
          >
            <PageCard variant="default" padding>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex-shrink-0 mt-1">
                    {setting.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {setting.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      {setting.description}
                    </p>
                    {setting.badge && (
                      <div className="mt-3 inline-block">
                        <span
                          className={
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ' +
                            (setting.badge.variant === 'success'
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                              : setting.badge.variant === 'warning'
                              ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                              : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200')
                          }
                        >
                          {setting.badge.label}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0 ml-2" />
              </div>
            </PageCard>
          </button>
        ))}
      </div>

      {/* Quick Stats */}
      <PageCard variant="default" padding>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
          Quick Stats
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-medical-500">3</div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Active Doctors</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-medical-500">Active</div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Subscription</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-medical-500">5/5</div>
            <p className="text-sm text-slate-600 dark:text-slate-400">Setup Complete</p>
          </div>
        </div>
      </PageCard>
    </div>
  );
}
