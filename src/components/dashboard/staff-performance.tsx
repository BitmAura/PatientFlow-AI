'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, Phone, CheckCircle2, Zap } from 'lucide-react'

interface StaffKPI {
  name: string
  role: string
  bookings: number
  tasksCompleted: number
  conversionRate: number
}

const MOCK_STAFF: StaffKPI[] = [
  { name: 'Priya S.', role: 'Senior Receptionist', bookings: 24, tasksCompleted: 142, conversionRate: 88 },
  { name: 'Arjun K.', role: 'Front Desk', bookings: 18, tasksCompleted: 98, conversionRate: 72 },
]

export function StaffPerformanceCard() {
  return (
    <Card className="border-slate-100 dark:border-slate-900/20 bg-white dark:bg-slate-900/50 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500">
          Staff Leaderboard
        </CardTitle>
        <Trophy className="h-4 w-4 text-amber-500" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {MOCK_STAFF.map((staff, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                  {staff.name[0]}
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900 dark:text-white">{staff.name}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">{staff.role}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-right">
                <div>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-black uppercase justify-end">
                    <CheckCircle2 className="h-3 w-3" />
                   {staff.bookings} Booked
                  </div>
                  <div className="text-[9px] text-slate-400 font-bold uppercase">
                    {staff.conversionRate}% Conv.
                  </div>
                </div>
                <div className="h-10 w-[2px] bg-slate-200 dark:bg-slate-800 mx-1" />
                <div className="w-12 text-center">
                   <p className="text-xs font-black text-blue-500">{staff.tasksCompleted}</p>
                   <p className="text-[8px] text-slate-400 font-bold uppercase">Tasks</p>
                </div>
              </div>
            </div>
          ))}
          
          <div className="mt-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30">
            <div className="flex items-center gap-2 text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
              <Zap className="h-3 w-3" />
              Bonus Target: 5 more bookings to hit Clinic Daily Goal!
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
