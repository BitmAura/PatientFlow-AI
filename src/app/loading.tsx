import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="bg-blue-600 p-4 rounded-xl shadow-lg animate-pulse">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
        <p className="text-sm font-medium text-gray-500 animate-pulse">Loading PatientFlow AI...</p>
      </div>
    </div>
  )
}
