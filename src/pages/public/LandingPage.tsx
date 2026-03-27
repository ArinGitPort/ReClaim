// @ts-ignore - Local JSX component missing exact declaration map
import Particles from "@/components/Particles"
import CardSwap, { Card } from "@/components/ui/CardSwap"
import { LoginForm } from "@/features/auth/LoginForm"
import { Button } from "@/components/ui/Button"
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
    <div style={{ minHeight: '100vh', display: 'flex', width: '100%', backgroundColor: '#F8FAFC', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 50 }}>
        <ThemeToggle />
      </div>
      
      {/* Left Side: Branding / Info */}
      <div style={{ display: 'flex', flex: 1, backgroundColor: '#FFFFFF', position: 'relative', overflow: 'hidden', flexDirection: 'column', justifyContent: 'center', padding: '0 4rem' }}>
        {/* Decorative background accent with Particles - Hidden on smaller screens but default here */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', width: '100%', height: '100%' }}>
          <Particles
            particleCount={120}
            particleSpread={10}
            speed={0.03}
            particleColors={["#1E2F85", "#10B981", "#64748B"]}
            moveParticlesOnHover
            particleHoverFactor={1.5}
            alphaParticles
            particleBaseSize={80}
            sizeRandomness={1}
            cameraDistance={25}
            disableRotation={false}
          />
        </div>
        
        <div style={{ position: 'absolute', top: '-10rem', left: '-10rem', width: '50rem', height: '50rem', backgroundColor: 'rgba(30, 47, 133, 0.1)', borderRadius: '50%', filter: 'blur(64px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: '37.5rem', height: '37.5rem', backgroundColor: 'rgba(30, 47, 133, 0.05)', borderRadius: '50%', filter: 'blur(64px)', pointerEvents: 'none' }} />
        
        <div style={{ position: 'relative', zIndex: 10, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '3rem' }}>
          <div style={{ maxWidth: '40rem', textAlign: 'left' }}>
            <h1 style={{ fontSize: '4.5rem', fontWeight: 800, letterSpacing: '-0.025em', color: '#0F172A', marginBottom: '1.5rem', lineHeight: '1', margin: 0 }}>
              Campus Lost & Found Portal
            </h1>
            <p style={{ fontSize: '1.25rem', color: '#64748B', lineHeight: '1.6', maxWidth: '40rem', margin: 0 }}>
              A secure platform to report missing belongings. Lose something? File a report. See your item? Submit a claim to get it back.
            </p>
            
            <div style={{ marginTop: '3rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.25rem' }}>
              <Link to="/gallery" style={{ textDecoration: 'none' }}>
                <Button style={{ borderRadius: '9999px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', fontSize: '1rem', fontWeight: 600, padding: '0 2rem', height: '3rem', backgroundColor: '#1E2F85', color: '#FFFFFF', border: 'none', cursor: 'pointer' }}>
                  View Found Items
                </Button>
              </Link>
              <Button 
                variant="outline" 
                style={{ borderRadius: '9999px', height: '3rem', padding: '0 1.5rem', fontSize: '1rem', fontWeight: 600, border: '1px solid #1E2F85', color: '#1E2F85', backgroundColor: 'transparent', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', cursor: 'pointer' }}
              >
                Report Lost Item
              </Button>
              <Button 
                onClick={() => setShowDropOffModal(true)}
                variant="ghost" 
                style={{ borderRadius: '9999px', height: '3rem', padding: '0 1.5rem', fontSize: '1rem', fontWeight: 700, color: '#64748B', backgroundColor: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
              >
                <Plus style={{ width: '1.25rem', height: '1.25rem' }} />
                I Found an Item
              </Button>
            </div>
          </div>

          <div style={{ position: 'relative', width: '46.875rem', height: '18.75rem', flexShrink: 0, marginTop: '30rem', marginRight: '-10rem', zIndex: 20 }}>
            <CardSwap
              cardDistance={40}
              verticalDistance={60}
              skewAmount={6}
              delay={4500}
              pauseOnHover={false}
              width={750}
              height={500}
            >
              <Card style={{ display: 'flex', flexDirection: 'column', padding: 0, filter: 'drop-shadow(0 25px 35px rgba(38, 61, 168, 0.15))', border: '1px solid rgba(255, 255, 255, 0.6)', backgroundColor: '#FFFFFF', borderRadius: '1rem', overflow: 'hidden' }}>
                <img src={firstImage} alt="Feature 1" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'left' }} />
              </Card>

              <Card style={{ display: 'flex', flexDirection: 'column', padding: 0, filter: 'drop-shadow(0 25px 35px rgba(38, 61, 168, 0.15))', border: '1px solid rgba(255, 255, 255, 0.6)', backgroundColor: '#FFFFFF', borderRadius: '1rem', overflow: 'hidden' }}>
                <img src={secondImage} alt="Feature 2" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'left' }} />
              </Card>

              <Card style={{ display: 'flex', flexDirection: 'column', padding: 0, filter: 'drop-shadow(0 25px 35px rgba(38, 61, 168, 0.15))', border: '1px solid rgba(255, 255, 255, 0.6)', backgroundColor: '#FFFFFF', borderRadius: '1rem', overflow: 'hidden' }}>
                <img src={thirdImage} alt="Feature 3" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'left' }} />
              </Card>
            </CardSwap>
          </div>
        </div>
      </div>

      {showDropOffModal && (
        <CampusDropOffModal onClose={() => setShowDropOffModal(false)} />
      )}

      {/* Right Side: Login Form */}
      <div style={{ flex: 'none', width: '500px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', backgroundColor: '#F8FAFC', borderLeft: '1px solid rgba(241, 245, 249, 0.5)', boxShadow: '-15px 0 30px -15px rgba(0, 0, 0, 0.03)', zIndex: 20 }}>
        <div style={{ width: '100%', maxWidth: '24rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Mobile Logo Visibility */}
          <div style={{ marginBottom: '3rem', textAlign: 'center', marginTop: '2rem' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.025em', color: '#0F172A', marginBottom: '0.75rem', margin: 0 }}>
              <span style={{ color: '#1E2F85' }}>Re</span>Claim
            </h1>
            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#64748B', margin: 0 }}>Lost & Found System</p>
          </div>
          
          <LoginForm />
          
          <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: '#64748B' }}>
            <p style={{ margin: 0 }}>New to ReClaim? <Link to="/register" style={{ color: '#1E2F85', fontWeight: 600, textDecoration: 'none' }}>Create an Account</Link></p>
          </div>
        </div>
      </div>

    </div>
  )
}
