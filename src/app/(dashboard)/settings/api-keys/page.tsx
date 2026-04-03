'use client'

import * as React from 'react'
import { Key, Plus, Trash2, Copy, Check, AlertTriangle, Lock, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { format } from 'date-fns'

type ApiKey = {
  id: string
  name: string
  key_prefix: string
  scopes: string[]
  last_used_at: string | null
  expires_at: string | null
  created_at: string
}

export default function ApiKeysPage() {
  const [keys, setKeys] = React.useState<ApiKey[]>([])
  const [loading, setLoading] = React.useState(true)
  const [forbidden, setForbidden] = React.useState(false)
  const [createOpen, setCreateOpen] = React.useState(false)
  const [newKeyName, setNewKeyName] = React.useState('')
  const [newKeyScopes, setNewKeyScopes] = React.useState<string[]>(['read'])
  const [creating, setCreating] = React.useState(false)
  const [createError, setCreateError] = React.useState<string | null>(null)
  const [revealedKey, setRevealedKey] = React.useState<string | null>(null)
  const [copied, setCopied] = React.useState(false)
  const [revokeId, setRevokeId] = React.useState<string | null>(null)
  const [revoking, setRevoking] = React.useState(false)

  React.useEffect(() => {
    fetch('/api/developer/keys')
      .then(r => {
        if (r.status === 403) { setForbidden(true); return null }
        return r.json()
      })
      .then(d => { if (d) setKeys(d.keys ?? []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleCreate() {
    if (!newKeyName.trim()) return
    setCreating(true)
    setCreateError(null)
    try {
      const res = await fetch('/api/developer/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName.trim(), scopes: newKeyScopes }),
      })
      const data = await res.json()
      if (!res.ok) {
        setCreateError(data.error ?? 'Failed to create key')
      } else {
        setRevealedKey(data.key.plaintext)
        setKeys(prev => [data.key, ...prev])
        setCreateOpen(false)
        setNewKeyName('')
        setNewKeyScopes(['read'])
      }
    } catch {
      setCreateError('Network error. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  async function handleRevoke() {
    if (!revokeId) return
    setRevoking(true)
    try {
      await fetch(`/api/developer/keys/${revokeId}`, { method: 'DELETE' })
      setKeys(prev => prev.filter(k => k.id !== revokeId))
    } catch {}
    setRevoking(false)
    setRevokeId(null)
  }

  function copyKey() {
    if (!revealedKey) return
    navigator.clipboard.writeText(revealedKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function toggleScope(scope: string) {
    setNewKeyScopes(prev =>
      prev.includes(scope) ? prev.filter(s => s !== scope) : [...prev, scope]
    )
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="h-32 bg-muted rounded-xl" />
      </div>
    )
  }

  if (forbidden) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
        <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center">
          <Lock className="h-8 w-8 text-amber-500" />
        </div>
        <h2 className="text-xl font-semibold">Pro Plan Feature</h2>
        <p className="text-muted-foreground max-w-sm">
          API access is available on the Pro plan. Upgrade to integrate PatientFlow AI with your EMR, billing system, or custom tools.
        </p>
        <Button asChild className="mt-2">
          <a href="/settings/billing">Upgrade to Pro</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">API Keys</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Use API keys to access PatientFlow AI programmatically — connect your EMR, billing system, or custom tools.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          New Key
        </Button>
      </div>

      {/* Docs notice */}
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 flex items-start gap-3">
        <ExternalLink className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
        <p className="text-sm text-blue-700">
          Pass your API key in the <code className="font-mono bg-blue-100 px-1 rounded">X-API-Key</code> header on all requests.
          Base URL: <code className="font-mono bg-blue-100 px-1 rounded">https://app.patientflow.ai/api/v1</code>
        </p>
      </div>

      {/* Key list */}
      {keys.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <Key className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
          <p className="font-medium">No API keys yet</p>
          <p className="text-sm text-muted-foreground mt-1">Create your first key to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {keys.map(key => (
            <div key={key.id} className="rounded-xl border bg-card p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Key className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate">{key.name}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">{key.key_prefix}••••••••••••••••••••</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="hidden sm:flex gap-1">
                  {key.scopes.map(s => (
                    <Badge key={s} variant="secondary" className="text-xs capitalize">{s}</Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground hidden md:block">
                  {key.last_used_at
                    ? `Used ${format(new Date(key.last_used_at), 'dd MMM yyyy')}`
                    : 'Never used'}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive h-8 w-8"
                  onClick={() => setRevokeId(key.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Security note */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
        <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
        <p className="text-sm text-amber-700">
          Keep your API keys secret. Never expose them in client-side code or public repositories.
          If a key is compromised, revoke it immediately and create a new one.
        </p>
      </div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create new API key</DialogTitle>
            <DialogDescription>Give this key a descriptive name so you know what it's used for.</DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label htmlFor="key-name">Key name <span className="text-red-500">*</span></Label>
              <Input
                id="key-name"
                placeholder="e.g. EMR Integration, Billing System"
                value={newKeyName}
                onChange={e => setNewKeyName(e.target.value)}
              />
            </div>
            <div className="space-y-3">
              <Label>Permissions</Label>
              {(['read', 'write', 'admin'] as const).map(scope => (
                <div key={scope} className="flex items-start gap-3">
                  <Checkbox
                    id={`scope-${scope}`}
                    checked={newKeyScopes.includes(scope)}
                    onCheckedChange={() => toggleScope(scope)}
                    className="mt-0.5"
                  />
                  <div>
                    <Label htmlFor={`scope-${scope}`} className="capitalize cursor-pointer font-medium">{scope}</Label>
                    <p className="text-xs text-muted-foreground">
                      {scope === 'read' && 'Read appointments, patients, reminders'}
                      {scope === 'write' && 'Create and update appointments and patients'}
                      {scope === 'admin' && 'Full access including clinic settings'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {createError && <p className="text-sm text-red-500">{createError}</p>}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={creating || !newKeyName.trim() || newKeyScopes.length === 0}>
              {creating ? 'Creating…' : 'Create key'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revealed key Dialog */}
      <Dialog open={!!revealedKey} onOpenChange={() => setRevealedKey(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Your new API key</DialogTitle>
            <DialogDescription>
              Copy this key now. For security, it will not be shown again.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-lg bg-muted px-3 py-2 text-sm font-mono break-all">
                {revealedKey}
              </code>
              <Button variant="outline" size="icon" onClick={copyKey} className="shrink-0">
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700">Store this in a secure secrets manager. It cannot be recovered after closing this dialog.</p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setRevealedKey(null)}>I've saved it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Confirm */}
      <AlertDialog open={!!revokeId} onOpenChange={() => setRevokeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke this API key?</AlertDialogTitle>
            <AlertDialogDescription>
              Any integrations using this key will stop working immediately. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevoke}
              disabled={revoking}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {revoking ? 'Revoking…' : 'Revoke key'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
