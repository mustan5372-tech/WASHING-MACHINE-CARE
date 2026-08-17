import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, CheckCircle2, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [showIOSModal, setShowIOSModal] = useState<boolean>(false);
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);

  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

  useEffect(() => {
    // Check if running as standalone PWA app
    const checkStandalone = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;
      setIsStandalone(standalone);
    };

    checkStandalone();

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isStandalone) {
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 4000);
      }
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      // Fallback instruction trigger
      alert("To install the Washing Machine Care App on your phone:\n\n1. Tap your browser menu (⋮ or Share icon)\n2. Select 'Install app' or 'Add to Home screen'\n\nEnjoy 1-tap doorstep service booking!");
    }
  };

  if (isStandalone) {
    return null; // App already installed and running in native standalone window
  }

  return (
    <>
      {/* Catchy Banner on Customer Home / Page */}
      <div 
        style={{ 
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
          color: '#ffffff', 
          borderRadius: '16px', 
          padding: '1.25rem 1.5rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          flexWrap: 'wrap', 
          gap: '1rem',
          border: '1px solid #334155',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Smartphone size={26} style={{ color: '#ffffff' }} />
          </div>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 800, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              ⚡ Official Mobile App (PWA)
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0.1rem 0 0.2rem 0', color: '#ffffff' }}>
              Install Washing Machine Care App
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
              Get 1-tap instant booking, live tracking, and quick repair helplines directly on your phone home screen!
            </p>
          </div>
        </div>

        <button 
          onClick={handleInstallClick}
          className="btn btn-primary"
          style={{ backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800, padding: '0.75rem 1.5rem', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)' }}
        >
          <Download size={18} /> Install App Now
        </button>
      </div>

      {/* iOS Safari Guide Modal */}
      {showIOSModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', padding: '1.75rem', maxWidth: '420px', width: '100%', position: 'relative', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <button 
              onClick={() => setShowIOSModal(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
            >
              <X size={22} />
            </button>

            <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
              <Share size={30} />
            </div>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              Install App on iPhone / iPad
            </h3>

            <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '1.25rem' }}>
              Follow these 2 simple steps to install the app on your Apple iOS device:
            </p>

            <div style={{ textAlign: 'left', backgroundColor: '#f8fafc', borderRadius: '12px', padding: '1rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem', color: '#334155' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>1</span>
                <span>Tap the <strong>Share button (⎋)</strong> at the bottom of Safari browser.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>2</span>
                <span>Scroll down & tap <strong>'Add to Home Screen' (➕)</strong>.</span>
              </div>
            </div>

            <button 
              onClick={() => setShowIOSModal(false)} 
              className="btn btn-primary btn-block" 
              style={{ marginTop: '1.25rem', fontWeight: 700 }}
            >
              Got It!
            </button>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccessToast && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', backgroundColor: '#059669', color: '#ffffff', padding: '1rem 1.5rem', borderRadius: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem', boxShadow: '0 10px 25px rgba(5, 150, 105, 0.3)', zIndex: 1000 }}>
          <CheckCircle2 size={20} /> App Installed Successfully!
        </div>
      )}
    </>
  );
};
