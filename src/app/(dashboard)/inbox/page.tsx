'use client'

import * as React from 'react'
import { formatDistanceToNow, format } from 'date-fns'
import { Inbox, MessageSquare, User, Send, Loader2, CheckCheck, RefreshCw } from 'lucide-react'
import { PageContainer } from '@/components/layout/page-container'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils/cn'
import { useToast } from '@/hooks/use-toast'
import { useInboxMessages, useReplyToMessage } from '@/hooks/use-inbox'
import Link from 'next/link'

type StatusFilter = 'all' | 'received' | 'processed'

interface PatientMessage {
  id: string
  phone_number: string
  content: string
  status: 'received' | 'processing' | 'processed' | 'error'
  received_at: string
  patient_id: string | null
  patients: { id: string; full_name: string; phone: string } | null
}

export default function InboxPage() {
  const [filter, setFilter] = React.useState<StatusFilter>('all')
  const [selected, setSelected] = React.useState<PatientMessage | null>(null)
  const [replyText, setReplyText] = React.useState('')
  const { toast } = useToast()

  const { data, isLoading, refetch } = useInboxMessages(filter)
  const replyMutation = useReplyToMessage()

  const messages: PatientMessage[] = data?.messages ?? []
  const total = data?.total ?? 0
  const unreadCount = messages.filter((m) => m.status === 'received').length

  // Keep selected message in sync after refetch
  React.useEffect(() => {
    if (selected) {
      const updated = messages.find((m) => m.id === selected.id)
      if (updated) setSelected(updated)
    }
  }, [messages]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleReply = async () => {
    if (!selected || !replyText.trim()) return
    try {
      await replyMutation.mutateAsync({ messageId: selected.id, text: replyText.trim() })
      toast({ title: 'Reply sent' })
      setReplyText('')
    } catch (err: unknown) {
      toast({
        title: 'Failed to send',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <PageContainer>
      <Breadcrumbs />

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <Inbox className="h-7 w-7 text-primary" />
            Patient Inbox
          </h1>
          <p className="mt-1 text-muted-foreground">
            Incoming WhatsApp replies from your patients.
            {total > 0 && <span className="ml-2 font-medium text-foreground">{total} messages</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Badge className="bg-blue-600 px-3 py-1 text-sm text-white">
              {unreadCount} unread
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="mb-4 flex gap-2">
        {(['all', 'received', 'processed'] as StatusFilter[]).map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setFilter(f); setSelected(null) }}
            className="capitalize"
          >
            {f === 'all' ? 'All Messages' : f === 'received' ? 'Unread' : 'Replied'}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ── Message List ─────────────────────────────────────── */}
        <div className="space-y-2 lg:col-span-1">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <Card className="py-16">
              <CardContent className="flex flex-col items-center gap-3 text-center">
                <MessageSquare className="h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No messages yet.</p>
                <p className="text-xs text-muted-foreground">
                  Patient replies to your WhatsApp reminders will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            messages.map((msg) => (
              <button
                key={msg.id}
                onClick={() => { setSelected(msg); setReplyText('') }}
                className={cn(
                  'w-full rounded-xl border p-4 text-left transition-all hover:border-primary/40 hover:bg-primary/5',
                  selected?.id === msg.id
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                    : 'border-border bg-card',
                  msg.status === 'received' && 'border-l-4 border-l-blue-500'
                )}
              >
                <div className="mb-1 flex items-start justify-between gap-2">
                  <span className="truncate text-sm font-semibold">
                    {msg.patients?.full_name ?? msg.phone_number}
                  </span>
                  <StatusBadge status={msg.status} />
                </div>
                <p className="truncate text-xs text-muted-foreground">{msg.content}</p>
                <p className="mt-1.5 text-xs text-muted-foreground/60">
                  {formatDistanceToNow(new Date(msg.received_at), { addSuffix: true })}
                </p>
              </button>
            ))
          )}
        </div>

        {/* ── Message Detail + Reply ────────────────────────────── */}
        <div className="lg:col-span-2">
          {selected ? (
            <Card className="h-full">
              <CardHeader className="border-b pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {selected.patients?.full_name ?? 'Unknown Patient'}
                    </CardTitle>
                    <CardDescription className="mt-0.5">
                      {selected.phone_number}
                      {selected.patients && (
                        <Link
                          href={`/patients/${selected.patients.id}`}
                          className="ml-3 text-primary underline-offset-2 hover:underline"
                        >
                          View profile →
                        </Link>
                      )}
                    </CardDescription>
                  </div>
                  <StatusBadge status={selected.status} />
                </div>
              </CardHeader>

              <CardContent className="space-y-5 pt-5">
                {/* Message bubble */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Patient message · {format(new Date(selected.received_at), 'MMM d, h:mm a')}
                  </p>
                  <div className="rounded-xl border bg-muted/50 px-4 py-3 text-sm">
                    {selected.content}
                  </div>
                </div>

                {/* Reply */}
                {selected.status !== 'processed' ? (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Reply via WhatsApp
                    </p>
                    <Textarea
                      placeholder="Type your reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={4}
                      className="resize-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleReply()
                      }}
                    />
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        Ctrl+Enter to send · {replyText.length}/4096
                      </p>
                      <Button
                        onClick={handleReply}
                        disabled={replyMutation.isPending || replyText.trim().length === 0}
                        size="sm"
                        className="gap-2"
                      >
                        {replyMutation.isPending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Send className="h-3.5 w-3.5" />
                        )}
                        Send Reply
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <CheckCheck className="h-4 w-4" />
                    <span>Replied — marked as done.</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="flex min-h-[400px] items-center justify-center">
              <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
                <Inbox className="h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">Select a message to read and reply</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageContainer>
  )
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'received':
      return <Badge className="shrink-0 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">Unread</Badge>
    case 'processing':
      return <Badge className="shrink-0 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300">Processing</Badge>
    case 'processed':
      return <Badge className="shrink-0 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">Replied</Badge>
    case 'error':
      return <Badge variant="destructive" className="shrink-0">Error</Badge>
    default:
      return <Badge variant="outline" className="shrink-0">{status}</Badge>
  }
}
