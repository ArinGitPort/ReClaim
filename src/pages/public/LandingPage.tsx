// @ts-ignore - Local JSX component missing exact declaration map
import Particles from "@/components/Particles"
import CardSwap, { Card } from "@/components/ui/CardSwap"
import { LoginForm } from "@/features/auth/LoginForm"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/layouts/ThemeToggle"
import { useState } from "react"
import { Link } from "react-router-dom"
import { CampusDropOffModal } from "@/components/user/CampusDropOffModal"
import { Plus } from "lucide-react"

import firstImage from "@/assets/firstImage.png"
import secondImage from "@/assets/secondImage.png"
import thirdImage from "@/assets/thirdImage.png"

export function LandingPage() {
  const [showDropOffModal, setShowDropOffModal] = useState(false)

  return (
    <div className="min-h-screen flex w-full bg-background-app font-sans relative">
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>
      
      {/* Left Side: Branding / Info */}
      <div className="hidden lg:flex flex-1 bg-background-subtle relative overflow-hidden flex-col justify-center px-16 xl:px-24">
        {/* Decorative background accent with Particles */}
        <div className="absolute inset-0 z-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
          <Particles
            particleCount={120}
            particleSpread={10}
            speed={0.03}
            particleColors={["#2563EB", "#10B981", "#64748B"]}
            moveParticlesOnHover
            particleHoverFactor={1.5}
            alphaParticles
            particleBaseSize={80}
            sizeRandomness={1}
            cameraDistance={25}
            disableRotation={false}
          />
        </div>
        
        <div className="absolute -top-40 -left-40 w-[800px] h-[800px] bg-brand/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-brand/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 w-full flex items-center justify-between gap-12">
          <div className="max-w-xl xl:max-w-2xl text-left">
            <h1 className="text-7xl font-extrabold tracking-tight text-text-primary mb-6">
              Campus Lost & Found Portal
            </h1>
            <p className="text-xl text-text-secondary leading-relaxed max-w-2xl">
              A secure platform to report missing belongings, Lose something? File a report. See your item? Submit a claim to get it back.
            </p>
            
            <div className="mt-12 flex flex-wrap items-center gap-5">
              <Link to="/gallery">
                <Button size="lg" className="rounded-full shadow-sm text-base font-semibold px-8 h-12 bg-brand hover:bg-brand/90 transition-colors text-white">
                  View Found Items
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="rounded-full h-12 px-6 text-base font-semibold border-brand text-brand shadow-sm transition-colors hover:bg-brand/5 hover:text-brand">
                Report Lost Item
              </Button>
              <Button 
                onClick={() => setShowDropOffModal(true)}
                variant="ghost" 
                size="lg" 
                className="rounded-full h-12 px-6 text-base font-bold text-slate-500 hover:text-brand hover:bg-brand/5 transition-all flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                I Found an Item
              </Button>
            </div>
          </div>

          <div className="hidden xl:block w-[650px] h-[520px] relative shrink-0 mt-20 mr-12">
            <CardSwap
              xOffset={45}
              yOffset={-45}
              scaleOffset={0}
              delay={4000}
              pauseOnHover={true}
            >
              <Card className="flex flex-col p-0 drop-shadow-2xl">
                <div className="w-full h-[420px] bg-white rounded-xl border border-slate-200/60 relative overflow-hidden">
                  <img src={firstImage} alt="Feature 1" className="w-full h-full object-cover object-left" />
                </div>
              </Card>

              <Card className="flex flex-col p-0 drop-shadow-2xl">
                <div className="w-full h-[420px] bg-white rounded-xl border border-slate-200/60 relative overflow-hidden">
                  <img src={secondImage} alt="Feature 2" className="w-full h-full object-cover object-left" />
                </div>
              </Card>

              <Card className="flex flex-col p-0 drop-shadow-2xl">
                <div className="w-full h-[420px] bg-white rounded-xl border border-slate-200/60 relative overflow-hidden">
                  <img src={thirdImage} alt="Feature 3" className="w-full h-full object-cover object-left" />
                </div>
              </Card>
            </CardSwap>
          </div>
        </div>
      </div>

      {showDropOffModal && (
        <CampusDropOffModal onClose={() => setShowDropOffModal(false)} />
      )}

      {/* Right Side: Login Form */}
      <div className="flex-none w-full lg:w-[460px] xl:w-[500px] flex flex-col items-center justify-center p-8 lg:p-12 xl:p-16 bg-background-app border-l border-border-divider/50 shadow-[-15px_0_30px_-15px_rgba(0,0,0,0.03)] z-20">
        <div className="w-full max-w-sm flex flex-col items-center">
          {/* Mobile Logo Visibility */}
          <div className="mb-12 text-center mt-8">
            <h1 className="text-5xl font-extrabold tracking-tight text-text-primary mb-3">
              <span className="text-brand">NU </span>Return
            </h1>
            <p className="text-sm font-medium text-text-secondary">Lost & Found System</p>
          </div>
          
          <LoginForm />
          
          <div className="mt-8 text-center text-sm text-text-secondary">
            <p>New to NU Return? <Link to="/register" className="text-brand font-semibold hover:underline transition-all">Create an Account</Link></p>
          </div>
        </div>
      </div>

    </div>
  )
}

