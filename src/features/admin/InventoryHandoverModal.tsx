import { X, ShieldCheck, User, QrCode, ClipboardCheck, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useState } from "react"

interface InventoryHandoverModalProps {
  item: any
  onClose: () => void
  onCompleted: () => void
}

export function InventoryHandoverModal({ item, onClose, onCompleted }: InventoryHandoverModalProps) {
  const [step, setStep] = useState(1)
  const [isVerifying, setIsVerifying] = useState(false)

  const handleNextStep = () => {
    if (step === 2) {
      setIsVerifying(true)
      setTimeout(() => {
        setIsVerifying(false)
        onCompleted()
      }, 1500)
    } else {
      setStep(step + 1)
    }
  }

  return (
    <div style={{ backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '90vh' }}>
      <div style={{ padding: '2rem', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(236, 253, 245, 0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
           <div style={{ width: '3rem', height: '3rem', backgroundColor: '#FFFFFF', borderRadius: '1rem', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: '1px solid #D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck style={{ width: '1.5rem', height: '1.5rem', color: '#059669' }} />
           </div>
           <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.025em', margin: 0 }}>Final Handover Protocol</h2>
              <p style={{ color: '#64748B', fontSize: '0.75rem', fontWeight: '500', fontStyle: 'italic', margin: 0 }}>Handing over <span style={{ fontWeight: 'bold' }}>{item.code}</span> to claimant.</p>
           </div>
        </div>
        <button onClick={onClose} style={{ padding: '0.5rem', backgroundColor: 'transparent', border: '1px solid transparent', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <X style={{ width: '1.25rem', height: '1.25rem', color: '#94A3B8' }} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
         {step === 1 ? (
            <div style={{ width: '100%', maxWidth: '24rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ width: '5rem', height: '5rem', backgroundColor: '#F8FAFC', borderRadius: '1.5rem', marginLeft: 'auto', marginRight: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #F1F5F9' }}>
                     <QrCode style={{ width: '2.5rem', height: '2.5rem', color: '#94A3B8' }} />
                  </div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 900, color: '#0F172A', marginTop: '1rem', margin: 0 }}>Scan Redemption QR</h3>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#64748B', lineHeight: '1.6', padding: '0 1rem', margin: 0 }}>Student must present their unique redemption QR code from their mobile app.</p>
               </div>
               <div style={{ aspectRatio: '1/1', width: '12rem', marginLeft: 'auto', marginRight: 'auto', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderStyle: 'dashed', borderRadius: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5, position: 'relative', cursor: 'pointer' }}>
                  <div style={{ position: 'absolute', top: '1rem', right: '1rem', bottom: '1rem', left: '1rem', border: '2px solid rgba(16, 185, 129, 0.2)', borderRadius: '1rem' }} />
                  <span style={{ fontSize: '10px', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Awaiting Scan...</span>
               </div>
            </div>
         ) : (
            <div style={{ width: '100%', maxWidth: '24rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
               <div style={{ backgroundColor: '#F8FAFC', borderRadius: '2.5rem', padding: '2.5rem', border: '1px solid #E2E8F0', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '-1.5rem', left: '50%', transform: 'translateX(-50%)', width: '3rem', height: '3rem', backgroundColor: '#059669', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                     <User style={{ width: '1.5rem', height: '1.5rem' }} />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', marginTop: '1rem', margin: 0 }}>Identify Verification</h3>
                  <p style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#059669', marginBottom: '1.5rem', margin: 0 }}>MATCH CONFIRMED</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
                     <VerificationRow label="Student Name" value="Johnathan Doe" />
                     <VerificationRow label="ID Suffix" value="**** 4920" />
                     <VerificationRow label="Item Claimed" value={item.title} />
                  </div>
               </div>
               
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: '#FFFBEB', padding: '1.25rem', borderRadius: '1rem', border: '1px solid #FEF3C7', textAlign: 'left' }}>
                  <ClipboardCheck style={{ width: '1.5rem', height: '1.5rem', color: '#D97706', flexShrink: 0 }} />
                  <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#92400E', lineHeight: '1.6', textTransform: 'uppercase', letterSpacing: '-0.025em', margin: 0 }}>
                     ADMIN ACTION: PHYSICALLY HAND OVER THE ITEM AND CONFIRM RECEIPT.
                  </p>
               </div>
            </div>
         )}
      </div>

      <div style={{ padding: '2rem', borderTop: '1px solid #F1F5F9', backgroundColor: 'rgba(248, 250, 252, 0.5)', display: 'flex', gap: '1rem' }}>
         <Button 
            variant="outline" 
            onClick={onClose}
            style={{ flex: 1, height: '3.5rem', borderRadius: '1rem', border: '1px solid #E2E8F0', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '10px', backgroundColor: '#FFFFFF', cursor: 'pointer' }}
         >
            Abort Protocol
         </Button>
         <Button 
            onClick={handleNextStep}
            disabled={isVerifying}
            style={{ 
               flex: 2, 
               height: '3.5rem', 
               borderRadius: '1rem', 
               backgroundColor: '#059669', 
               color: '#FFFFFF', 
               fontWeight: 900, 
               textTransform: 'uppercase', 
               letterSpacing: '0.1em', 
               fontSize: '11px', 
               boxShadow: '0 10px 15px -3px rgba(5, 150, 105, 0.1)', 
               display: 'flex', 
               alignItems: 'center', 
               justifyContent: 'center', 
               gap: '0.5rem',
               border: 'none',
               cursor: 'pointer',
               opacity: isVerifying ? 0.7 : 1
            }}
         >
            {isVerifying ? (
               <div style={{ width: '1.25rem', height: '1.25rem', border: '2px solid rgba(255, 255, 255, 0.3)', borderTopColor: '#FFFFFF', borderRadius: '50%' }} />
            ) : (
               <>
                  {step === 1 ? "Next Verification" : "Complete Secure Handover"}
                  <ArrowRight style={{ width: '1rem', height: '1rem' }} />
               </>
            )}
         </Button>
      </div>
    </div>
  )
}

function VerificationRow({ label, value }: { label: string, value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', borderBottom: '1px solid rgba(226, 232, 240, 0.5)', paddingBottom: '0.75rem' }}>
       <span style={{ fontSize: '9px', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.125rem' }}>{label}</span>
       <span style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#1E293B' }}>{value}</span>
    </div>
  )
}
