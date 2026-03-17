import { TopNavBar } from "@/layouts/TopNavBar"

export function MyClaimsPage() {
  return (
    <div className="w-full min-h-full pb-24">
      <TopNavBar title="My Claims" />
      <div className="max-w-5xl mx-auto px-6 mt-8">
        <h2 className="text-2xl font-bold text-text-primary mb-4">Tracking & Status</h2>
        <p className="text-text-secondary mb-8">View the status of items you have claimed from the gallery.</p>
        
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-border-divider/50 rounded-xl bg-background-app/50">
          <h3 className="text-xl font-bold text-text-primary mb-2">No claims active</h3>
          <p className="text-text-secondary text-center">You haven't claimed any items yet. Browse the gallery to find your missing items.</p>
        </div>
      </div>
    </div>
  )
}
