import { TopNavBar } from "@/layouts/TopNavBar"

export function MyReportsPage() {
  return (
    <div className="w-full min-h-full pb-24">
      <TopNavBar title="My Lost Reports" />
      <div className="max-w-5xl mx-auto px-6 mt-8">
        <h2 className="text-2xl font-bold text-text-primary mb-4">Tracking & Status</h2>
        <p className="text-text-secondary mb-8">View the items you reported lost and their search status.</p>
        
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-border-divider/50 rounded-xl bg-background-app/50">
          <h3 className="text-xl font-bold text-text-primary mb-2">No reports filed</h3>
          <p className="text-text-secondary text-center">You haven't filed any lost item reports yet.</p>
        </div>
      </div>
    </div>
  )
}
