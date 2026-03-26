import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, CheckCircle2, Stethoscope, Briefcase } from "lucide-react"
import Link from 'next/link'

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
                <span className="font-semibold text-gray-900">Free trial, then ₹999/month</span>
              </div>
              <Link href="/signup">
                <Button size="lg" className="w-full bg-green-600 hover:bg-green-700">
                  Start Free 14-Day Trial
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <Card className="border-blue-200 bg-blue-50/40">
            <CardHeader>
              <div className="flex items-center gap-2 text-blue-700">
                <Briefcase className="w-4 h-4" />
                <span className="text-sm font-medium">Digital Marketing Services (Optional)</span>
              </div>
              <CardDescription className="text-gray-700">
                Need patient acquisition too? Our marketing team can support SEO, ads, and local visibility.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="https://wa.me/919148868413?text=Hi%2C%20I%20need%20digital%20marketing%20support%20for%20my%20clinic.">
                <Button variant="outline" className="w-full border-blue-300 text-blue-700 hover:bg-blue-100">
                  Explore Marketing Services
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