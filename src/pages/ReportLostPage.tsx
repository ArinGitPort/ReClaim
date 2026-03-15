import { TopNavBar } from "@/components/TopNavBar"

export function ReportLostPage() {
  return (
    <div className="w-full min-h-full pb-24">
      <TopNavBar title="Report a Lost Item" />
      <div className="max-w-3xl mx-auto px-6 mt-8">
        <h2 className="text-2xl font-bold text-text-primary mb-4">File a new report</h2>
        <p className="text-text-secondary">If you lost an item on campus, fill out this form to notify the administration.</p>
        {/* Registration form logic will go here eventually */}
      </div>
    </div>
  )
}
