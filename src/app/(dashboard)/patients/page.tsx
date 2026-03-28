'use client'

import * as React from 'react'
import { PageContainer } from '@/components/layout/page-container'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PatientCard } from '@/components/patients/patient-card'
import { usePatients, useDeletePatient } from '@/hooks/use-patients'
import { Plus, Search, Filter, Upload } from 'lucide-react'
import Link from 'next/link'
import { ExportButton } from '@/components/shared/export-button'
import { ExportPatientsDialog } from '@/components/patients/export-patients-dialog'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useDebounce } from '@/hooks/use-debounce'
import { PageHeader, PageCard, EmptyState, SkeletonLoader } from '@/components/dashboard/PageStructure'

export default function PatientsPage() {
  const [search, setSearch] = React.useState('')
  const debouncedSearch = useDebounce(search, 500)
  
  // Filters
  const [isVip, setIsVip] = React.useState(false)
  const [requiresDeposit, setRequiresDeposit] = React.useState(false)
  const [showNoShows, setShowNoShows] = React.useState(false)
  const [exportOpen, setExportOpen] = React.useState(false)

  const { data: patientsData, isLoading } = usePatients({
    search: debouncedSearch,
    is_vip: isVip,
    requires_deposit: requiresDeposit,
    no_show_min: showNoShows ? 1 : undefined,
  })

  const deletePatient = useDeletePatient()

  const handleAction = async (action: string, patient: any) => {
    if (action === 'delete') {
      if (confirm('Are you sure? This will delete all history.')) {
        await deletePatient.mutateAsync(patient.id)
      }
    }
  }

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={<Breadcrumbs />}
        title="Patients"
        description={`${patientsData?.count || 0} total patients`}
        actions={(
          <>
            <ExportButton onExport={() => setExportOpen(true)} label="Export" formats={['excel', 'csv', 'pdf']} />
            <Button variant="outline" asChild>
              <Link href="/patients/import">
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Link>
            </Button>
            <Button asChild>
              <Link href="/patients/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Patient
              </Link>
            </Button>
          </>
        )}
        filters={(
          <div className="flex w-full flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone, or email..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuCheckboxItem checked={isVip} onCheckedChange={setIsVip}>
                  VIP Patients
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={requiresDeposit} onCheckedChange={setRequiresDeposit}>
                  Requires Deposit
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked={showNoShows} onCheckedChange={setShowNoShows}>
                  Has No-Shows
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      />

      {/* Content */}
      {isLoading ? (
        <SkeletonLoader variant="card" rows={6} />
      ) : patientsData?.data?.length === 0 ? (
        <EmptyState
          title="No patients found"
          description="Try adjusting your search or add a new patient."
          action={
            <Button asChild>
              <Link href="/patients/new">Add Patient</Link>
            </Button>
          }
        />
      ) : (
        <PageCard variant="minimal" className="grid gap-4 border-0 p-0 shadow-none md:grid-cols-2 lg:grid-cols-3">
          {patientsData?.data?.map((patient: any) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              onAction={handleAction}
            />
          ))}
        </PageCard>
      )}

      <ExportPatientsDialog 
        open={exportOpen} 
        onOpenChange={setExportOpen} 
      />
    </PageContainer>
  )
}
