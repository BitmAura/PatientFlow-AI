import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, CheckCircle2, Stethoscope } from "lucide-react"
import Link from 'next/link'
import { FREE_TRIAL_DAYS, PRICING_PLANS, formatPriceInrFromPaise } from "@/lib/billing/plans"

export default function ServiceSelectorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-gray-900">PatientFlow AI</h1>
                <p className="text-xs text-gray-600">No-show reduction and patient recall automation</p>
              </div>
            </div>
            <Link href="/login">
              <Button variant="outline" size="sm">Login</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <Badge variant="secondary" className="mb-4 bg-green-100 text-green-700">
            Healthcare Revenue Recovery Platform
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            PatientFlow AI for Modern Clinics
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Turn missed appointments and overdue follow-ups into confirmed visits with automated WhatsApp workflows.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span>Reduce no-shows by up to 75%</span>
            <span className="text-gray-300">•</span>
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span>Set up in minutes</span>
          </div>
        </div>
      </section>

      <section className="py-4 px-4">
        <div className="container mx-auto max-w-5xl">
          <Card className="border-green-200 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between mb-3">
                <Badge className="bg-green-100 text-green-700">Primary Product</Badge>
              </div>
              <CardTitle className="text-3xl text-gray-900">PatientFlow AI</CardTitle>
              <CardDescription className="text-lg text-gray-600">
                AI-powered patient recall and no-show prevention
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="grid md:grid-cols-2 gap-3 text-sm text-gray-700">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600" /> Automated WhatsApp reminders</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600" /> Smart recall campaigns</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600" /> Appointment no-show alerts</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600" /> Revenue and recovery analytics</li>
              </ul>
              <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                <span className="text-sm text-gray-600">Pricing</span>
                <span className="font-semibold text-gray-900">
                  Free {FREE_TRIAL_DAYS}-day trial, then {formatPriceInrFromPaise(PRICING_PLANS.starter.monthlyPricePaise)}/month
                </span>
              </div>
              <Link href="/signup?plan=starter">
                <Button size="lg" className="w-full bg-green-600 hover:bg-green-700">
                  Start Free {FREE_TRIAL_DAYS}-Day Trial
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}