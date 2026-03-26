'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  demoChats,
  demoClinic,
  demoLeads,
  demoStats,
  type DemoLead,
} from '@/lib/demo/demo-data'

const stageStyle: Record<DemoLead['stage'], string> = {
  New: 'bg-blue-100 text-blue-700',
  Contacted: 'bg-amber-100 text-amber-700',
  Interested: 'bg-violet-100 text-violet-700',
  Booked: 'bg-emerald-100 text-emerald-700',
}

export default function DemoPage() {
  const [selectedLeadId, setSelectedLeadId] = useState(demoLeads[0]?.id ?? '')
  const [activeTab, setActiveTab] = useState<'dashboard' | 'leads' | 'whatsapp'>(
    'dashboard'
  )

  const selectedLead = useMemo(
    () => demoLeads.find(lead => lead.id === selectedLeadId) ?? demoLeads[0],
    [selectedLeadId]
  )

  const messages = selectedLead ? demoChats[selectedLead.id] ?? [] : []

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 md:px-8">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <p className="font-semibold">Demo Mode: Read-only</p>
          <p>
            You are exploring a live simulation of PatientFlow AI. Actions are
            intentionally disabled.
          </p>
        </div>

        <header className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-500">Demo Clinic</p>
            <h1 className="text-2xl font-bold">{demoClinic.name}</h1>
            <p className="text-sm text-zinc-600">
              {demoClinic.speciality} | {demoClinic.location} | Owner:{' '}
              {demoClinic.doctor}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/login"
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100"
            >
              Exit Demo
            </Link>
            <button
              type="button"
              disabled
              className="cursor-not-allowed rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white opacity-60"
            >
              Upgrade to Real Account
            </button>
          </div>
        </header>

        <div className="flex flex-wrap gap-2">
          {(['dashboard', 'leads', 'whatsapp'] as const).map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                activeTab === tab
                  ? 'bg-zinc-900 text-white'
                  : 'bg-white text-zinc-700 hover:bg-zinc-100'
              }`}
            >
              {tab === 'dashboard'
                ? 'Dashboard'
                : tab === 'leads'
                  ? 'Leads'
                  : 'WhatsApp'}
            </button>
          ))}
        </div>

        {activeTab === 'dashboard' && (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {demoStats.map(stat => (
              <article
                key={stat.label}
                className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
              >
                <p className="text-sm text-zinc-500">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold">{stat.value}</p>
                <p className="mt-3 text-xs font-medium text-emerald-600">
                  {stat.trend}
                </p>
              </article>
            ))}
          </section>
        )}

        {activeTab === 'leads' && (
          <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Preloaded Leads</h2>
              <button
                type="button"
                disabled
                className="cursor-not-allowed rounded-lg border border-zinc-300 px-3 py-2 text-sm opacity-60"
              >
                Add Lead
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left">
                <thead>
                  <tr className="border-b border-zinc-200 text-sm text-zinc-500">
                    <th className="px-3 py-3">Name</th>
                    <th className="px-3 py-3">Phone</th>
                    <th className="px-3 py-3">Source</th>
                    <th className="px-3 py-3">Stage</th>
                    <th className="px-3 py-3">Last Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {demoLeads.map(lead => (
                    <tr key={lead.id} className="border-b border-zinc-100 text-sm">
                      <td className="px-3 py-3 font-medium">{lead.name}</td>
                      <td className="px-3 py-3">{lead.phone}</td>
                      <td className="px-3 py-3">{lead.source}</td>
                      <td className="px-3 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${stageStyle[lead.stage]}`}
                        >
                          {lead.stage}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-zinc-600">{lead.lastContact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === 'whatsapp' && (
          <section className="grid gap-4 lg:grid-cols-[300px_1fr]">
            <div className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm">
              <h2 className="mb-3 px-2 text-base font-semibold">Chats</h2>
              <div className="space-y-1">
                {demoLeads.map(lead => (
                  <button
                    key={lead.id}
                    type="button"
                    onClick={() => setSelectedLeadId(lead.id)}
                    className={`w-full rounded-lg px-3 py-2 text-left ${
                      selectedLead?.id === lead.id
                        ? 'bg-zinc-900 text-white'
                        : 'hover:bg-zinc-100'
                    }`}
                  >
                    <p className="font-medium">{lead.name}</p>
                    <p
                      className={`text-xs ${
                        selectedLead?.id === lead.id
                          ? 'text-zinc-200'
                          : 'text-zinc-500'
                      }`}
                    >
                      {lead.phone}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold">
                WhatsApp Thread: {selectedLead?.name}
              </h3>
              <div className="flex max-h-[420px] flex-col gap-3 overflow-y-auto rounded-xl bg-zinc-50 p-4">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                      message.from === 'clinic'
                        ? 'self-end bg-emerald-100 text-emerald-900'
                        : 'self-start bg-white'
                    }`}
                  >
                    <p>{message.text}</p>
                    <p className="mt-1 text-[11px] text-zinc-500">{message.timestamp}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <input
                  disabled
                  placeholder="Demo mode is read-only"
                  className="w-full rounded-lg border border-zinc-300 bg-zinc-100 px-3 py-2 text-sm text-zinc-500"
                />
                <button
                  type="button"
                  disabled
                  className="cursor-not-allowed rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white opacity-50"
                >
                  Send
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
