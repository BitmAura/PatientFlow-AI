'use client'

import React from 'react'
import { PageContainer } from '@/components/layout/page-container'
import { PageHeader, PageCard } from '@/components/dashboard/PageStructure'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card'
import { 
  Trophy, 
  TrendingUp, 
  Users, 
  Target,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

/**
 * Staff Performance Audit Page
 * 🚀 Persona: Founder/CEO & Frontend Developer
 * 💎 Emerald / Gold Aesthetic - The "Leaderboard"
 */
export default function StaffPerformancePage() {
  // Mock data representing what will come from v_staff_performance
  const performanceData = [
    { id: 1, name: 'Dr. Rajesh Kumar', leads: 42, converted: 28, revenue: 350000, tier1: 12, rank: 1 },
    { id: 2, name: 'Dr. Anjali Sharma', leads: 38, converted: 22, revenue: 210000, tier1: 5, rank: 2 },
    { id: 3, name: 'Dr. Vikram Singh', leads: 25, converted: 12, revenue: 110000, tier1: 2, rank: 3 },
  ]

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={<Breadcrumbs />}
        title="Staff Performance Audit"
        description="Track which doctors are converting AI-generated leads into high-ticket revenue."
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mt-6">
         <MetricCard 
            icon={<Trophy className="h-5 w-5 text-amber-500" />} 
            label="Top Converter" 
            value="Dr. Rajesh" 
            subValue="28 Closes"
         />
         <MetricCard 
            icon={<TrendingUp className="h-5 w-5 text-emerald-500" />} 
            label="Avg. Conversion" 
            value="64%" 
            subValue="+12% from last month"
         />
         <MetricCard 
            icon={<Target className="h-5 w-5 text-blue-500" />} 
            label="High-Ticket Focus" 
            value="19 Cases" 
            subValue="Tier 1 Implants/Ortho"
         />
         <MetricCard 
            icon={<Users className="h-5 w-5 text-purple-500" />} 
            label="Total Impact" 
            value="₹6.7L" 
            subValue="AI-Recovered Revenue"
         />
      </div>

      <div className="mt-8">
        <Card className="border-emerald-100 bg-white/50 backdrop-blur-sm dark:border-emerald-900/20 dark:bg-slate-900/50 shadow-xl shadow-emerald-500/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black">Doctor Leaderboard</CardTitle>
                <CardDescription>Ranked by "Confirmed Revenue Recovery"</CardDescription>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                <ShieldCheck className="h-3 w-3" />
                Audit Mode Active
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
               {performanceData.map((doc, i) => (
                 <div key={doc.id} className="group relative flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-6 transition-all hover:border-emerald-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/50">
                    <div className="flex items-center gap-6">
                       {/* Rank Badge */}
                       <div className={cn(
                         "flex h-12 w-12 items-center justify-center rounded-xl font-black text-lg",
                         i === 0 ? "bg-amber-100 text-amber-700 shadow-sm" : 
                         i === 1 ? "bg-slate-100 text-slate-700" : "bg-orange-50 text-orange-800"
                       )}>
                          #{doc.rank}
                       </div>
                       
                       {/* Doctor Info */}
                       <div>
                          <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                            {doc.name}
                          </h3>
                          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-0.5">
                            {doc.leads} Leads Assigned • {doc.converted} Closes
                          </p>
                       </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-12 text-right">
                       <div className="hidden md:block">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">High-Ticket</p>
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{doc.tier1} cases</p>
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Revenue Contribution</p>
                          <div className="flex items-center justify-end gap-1.5">
                             <span className="text-xl font-black text-slate-900 dark:text-white">₹{doc.revenue.toLocaleString()}</span>
                             <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                          </div>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center bg-slate-950 p-8 rounded-3xl border border-white/5">
         <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Founder Strategy Tip</p>
         <h3 className="text-xl font-black text-white mt-2 italic">
            "Your highest-ticket conversion comes from <span className="text-emerald-400">Dr. Rajesh Kumar</span>. <br />
            Consider assigning all new 'Implant' leads to him for maximum ROI."
         </h3>
      </div>
    </PageContainer>
  )
}

function MetricCard({ icon, label, value, subValue }: { icon: React.ReactNode, label: string, value: string, subValue: string }) {
  return (
    <Card className="border-slate-100 hover:border-emerald-200 transition-colors dark:border-slate-800">
       <CardContent className="pt-6">
          <div className="flex items-start justify-between">
             <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</p>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white">{value}</h4>
                <p className="text-[10px] font-medium text-emerald-600 uppercase tracking-tighter">{subValue}</p>
             </div>
             <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                {icon}
             </div>
          </div>
       </CardContent>
    </Card>
  )
}
