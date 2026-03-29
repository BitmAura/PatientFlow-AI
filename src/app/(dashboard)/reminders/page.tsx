'use client';

import { useState } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { Send, Filter, Bell } from 'lucide-react';
import { PageHeader, PageCard, EmptyState, SkeletonLoader } from '@/components/dashboard/PageStructure';
import { Button } from '@/components/dashboard/FormComponents';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { cn } from '@/lib/design-tokens';
import { useReminderLogs, useResendMessage } from '@/hooks/use-reminder-logs';
import { useToast } from '@/hooks/use-toast';

export default function RemindersPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'sent' | 'failed'>('all');
  const { toast } = useToast();

  const { data, isLoading, isFetching, refetch } = useReminderLogs({
    page: 1,
    limit: 100,
    statuses: filter === 'all' ? undefined : [filter],
  });
  const resendMutation = useResendMessage();

  const reminders = data?.data || [];

  const handleSendNow = async (id: string) => {
    try {
      await resendMutation.mutateAsync(id);
      toast({ title: 'Reminder queued', description: 'Reminder is scheduled for resend.' });
      await refetch();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to resend',
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400';
      case 'failed':
        return 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400';
      default:
        return 'bg-slate-50 dark:bg-slate-900/20 text-slate-700 dark:text-slate-400';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'whatsapp':
        return '🟢';
      case 'sms':
        return '📱';
      case 'email':
        return '📧';
      default:
        return '📨';
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        breadcrumb={<Breadcrumbs />}
        title="Appointment Reminders"
        description="View and manage scheduled appointment reminders"
        filters={
          <div className="flex gap-2 flex-wrap">
            {(['all', 'pending', 'sent', 'failed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  filter === status
                    ? 'bg-medical-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                )}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                <span className="ml-2 text-xs opacity-75">
                  ({reminders.filter((r) => r.status === (status === 'all' ? r.status : status)).length})
                </span>
              </button>
            ))}
          </div>
        }
      />

      {/* Reminders Table */}
      {isLoading ? (
        <SkeletonLoader rows={5} variant="table" />
      ) : reminders.length > 0 ? (
        <PageCard variant="default" padding={false} className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wide">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wide">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wide">
                    Message
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wide">
                    Scheduled
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {reminders.map((reminder) => (
                  <tr
                    key={reminder.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm">
                      <span className="text-lg mr-2">{getTypeColor(reminder.type)}</span>
                      <span className="capitalize text-slate-700 dark:text-slate-300">
                        {reminder.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {reminder.patients?.full_name || 'Unknown patient'}
                      </div>
                      <div className="text-slate-600 dark:text-slate-400">
                        {reminder.patients?.phone || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 max-w-sm truncate" title={reminder.message}>
                      {reminder.message}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {formatDistanceToNow(new Date(reminder.created_at), { addSuffix: true })}
                      <div className="text-xs text-slate-500 dark:text-slate-500">
                        {format(new Date(reminder.created_at), 'MMM d, yyyy h:mm a')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={cn(
                          'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
                          getStatusColor(reminder.status)
                        )}
                      >
                        {reminder.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => void handleSendNow(reminder.id)}
                          title="Send now"
                          disabled={resendMutation.isPending || isFetching}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors disabled:opacity-50"
                        >
                          <Send className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer with Bulk Actions */}
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Showing {reminders.length} reminder logs
              </p>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm">
                  Download CSV
                </Button>
              </div>
            </div>
          </div>
        </PageCard>
      ) : (
        <EmptyState
          icon={<Bell className="w-12 h-12 text-slate-300" />}
          title="No reminders scheduled"
          description={
            filter === 'all'
              ? "You don't have any reminders yet. Create appointments to schedule reminders."
              : `No ${filter} reminders found.`
          }
          action={
            <Button variant="primary" size="md">
              Create Appointment
            </Button>
          }
        />
      )}

      {/* Info Box */}
      <PageCard variant="default" padding className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <div className="flex gap-3">
          <Filter className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-200">
              Reminder Management
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-300 mt-1">
              Reminders are automatically scheduled when you create appointments. You can resend failed reminders or delete pending ones from this page.
            </p>
          </div>
        </div>
      </PageCard>
    </div>
  );
}
