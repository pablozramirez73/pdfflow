
import React, { useEffect, useState } from 'react';
import { ArrowRight, Zap, CheckCircle2, Shield, Cpu } from 'lucide-react';

interface LandingPageProps {
  onEnter: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black text-white font-sans">
      
      {/* Background Video Layer */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/60 z-10" /> {/* Overlay Scuro */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 z-10" />
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="w-full h-full object-cover opacity-80"
          poster="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop"
        >
          {/* Abstract Tech / Neural Network Video */}
          <source src="https://assets.mixkit.co/videos/preview/mixkit-network-connection-background-3142-large.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Navigation (Glassmorphism) */}
      <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 transition-all duration-1000 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-500 rounded flex items-center justify-center">
            <Zap size={20} className="text-white" fill="currentColor" />
          </div>
          <span className="text-xl font-bold tracking-tight">DocFlow AI</span>
        </div>
        <div className="flex items-center gap-6 text-sm font-medium text-gray-300">
          <button className="hover:text-white transition-colors">Funzionalità</button>
          <button className="hover:text-white transition-colors">Enterprise</button>
          <button onClick={onEnter} className="text-white hover:text-brand-400 transition-colors">Accedi</button>
        </div>
      </nav>

      {/* Main Hero Content */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full px-4 text-center">
        
        {/* Label */}
        <div 
          className={`mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-xs font-medium uppercase tracking-widest text-brand-300 transition-all duration-1000 delay-300 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
          Intelligenza Artificiale Generativa 2.5
        </div>

        {/* Main Title */}
        <h1 
          className={`text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-4xl bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 transition-all duration-1000 delay-500 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          Il Futuro dei Tuoi Documenti <br /> è Qui.
        </h1>

        {/* Subtitle */}
        <p 
          className={`text-lg md:text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed transition-all duration-1000 delay-700 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          Automatizza analisi, estrazione dati e flussi di lavoro sui PDF con la potenza di Google Gemini.
          <br className="hidden md:block" /> Trasforma archivi statici in conoscenza attiva.
        </p>

        {/* CTA Button */}
        <div className={`transition-all duration-1000 delay-1000 ${loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <button 
            onClick={onEnter}
            className="group relative px-8 py-4 bg-brand-600 text-white font-semibold rounded-full overflow-hidden shadow-[0_0_40px_-10px_rgba(234,88,12,0.6)] hover:shadow-[0_0_60px_-10px_rgba(234,88,12,0.8)] transition-all duration-300 hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-brand-600 via-orange-400 to-brand-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[length:200%_auto] animate-gradient" />
            <span className="relative flex items-center gap-2">
              Inizia Ora Gratuitamente
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </div>
      </div>

      {/* Feature Pills (Bottom) */}
      <div 
        className={`absolute bottom-12 left-0 right-0 z-20 flex justify-center gap-4 md:gap-12 px-4 transition-all duration-1000 delay-[1200ms] ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        {[
          { icon: <Cpu size={18} />, text: "Gemini 2.5 Powered" },
          { icon: <Shield size={18} />, text: "Enterprise Security" },
          { icon: <CheckCircle2 size={18} />, text: "Workflow Automation" }
        ].map((feature, i) => (
          <div key={i} className="flex items-center gap-2 text-gray-400 text-sm font-medium">
            <div className="text-brand-500">{feature.icon}</div>
            <span>{feature.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
