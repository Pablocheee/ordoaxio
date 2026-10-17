/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { PortfolioCard } from './components/PortfolioCard';
import { OrdoAxioAi } from './components/OrdoAxioAi';

const translations = {
  RU: {
    projects: [
      {
        title: "Платформа CoFound",
        description: "Платформа для мэтчинга стартап-фаундеров и IT-специалистов. Включает доску проектов, интеграцию умного гео-поиска и строгий темный интерфейс."
      },
      {
        title: "Root Access",
        description: "Браузерный 3D-мультиплеер на движке Three.js"
      },
      {
        title: "Лендинг сайт",
        description: "Коммерческий лендинг сайт с ИИ-администратором и модулем онлайн-оплаты. Реальный кейс."
      }
    ]
  },
  EN: {
    projects: [
      {
        title: "CoFound Platform",
        description: "A platform for matching startup founders and IT specialists. Includes a project board, smart geo-search integration, and a strict dark interface."
      },
      {
        title: "Root Access",
        description: "Browser-based 3D multiplayer built on the Three.js engine."
      },
      {
        title: "Landing Page",
        description: "Commercial landing page with an AI administrator and online payment module. Real case study."
      }
    ]
  }
} as const;

type Language = keyof typeof translations;

const projects = [
  {
    link: "https://cofounder-platformm.onrender.com/",
    accentColor: "#2563eb", // blue-600
    bgImage: "url('https://api.microlink.io/?url=https://cofounder-platformm.onrender.com/&screenshot=true&embed=screenshot.url&colorScheme=dark')",
    titleStyle: "font-sans font-bold uppercase tracking-wide"
  },
  {
    link: "https://rootaccess-drab.vercel.app/",
    accentColor: "#22c55e", // green-500
    bgImage: "url('https://api.microlink.io/?url=https://rootaccess-drab.vercel.app/&screenshot=true&embed=screenshot.url&colorScheme=dark')",
    titleStyle: "font-sans font-bold uppercase tracking-wide"
  },
  {
    link: "https://inoedyhanie.vercel.app",
    accentColor: "#22d3ee", // cyan-400
    bgImage: "url('https://api.microlink.io/?url=https://inoedyhanie.vercel.app&screenshot=true&embed=screenshot.url&colorScheme=dark')",
    titleStyle: "font-sans font-bold uppercase tracking-wide"
  }
];

export default function App() {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [currentLang, setCurrentLang] = useState('RU');
  const [isGlitching, setIsGlitching] = useState(false);

  const handleLanguageToggle = () => {
    setIsGlitching(true);
    setTimeout(() => {
      setCurrentLang(prev => (prev === 'RU' ? 'EN' : 'RU'));
      setIsGlitching(false);
    }, 600);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setFocusedIndex((prev) => {
          if (prev === -1) return 0;
          return prev >= projects.length - 1 ? 0 : prev + 1;
        });
      } else if (e.key === 'ArrowLeft') {
        setFocusedIndex((prev) => {
          if (prev === -1) return projects.length - 1;
          return prev <= 0 ? projects.length - 1 : prev - 1;
        });
      } else if (e.key === 'Enter' && focusedIndex !== -1) {
        window.open(projects[focusedIndex].link, '_blank', 'noopener,noreferrer');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex]);

  return (
    <main className="h-screen w-screen bg-[#050505] text-zinc-100 font-sans selection:bg-cyan-500/30 overflow-hidden flex flex-col">
      {/* Background Cyber-Grid */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.03]" 
        style={{ 
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', 
          backgroundSize: '40px 40px',
          maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)'
        }} 
      />
      
      {/* Header Brow */}
      <header className="w-full flex justify-between items-center px-6 py-4 z-50 relative bg-black border-b border-white/10">
        <h1 className="font-sans font-bold uppercase tracking-widest text-white/90">
          ORDOAXIO
        </h1>
        <div className="flex items-center gap-3">
          <a 
            href="https://t.me/Mistah_chee"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-white/50 hover:text-white transition-all duration-300 group"
          >
            <svg 
              viewBox="0 0 24 24" 
              fill="currentColor" 
              className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform"
            >
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
          </a>
          <button 
            data-lang-toggle="true"
            onClick={handleLanguageToggle}
            className="flex items-center text-white/50 hover:text-white transition-all duration-300 group cursor-pointer"
          >
            <svg 
              viewBox="0 0 24 24" 
              fill="currentColor" 
              className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
          </button>
        </div>
      </header>

      <section className="flex-1 relative w-full overflow-hidden flex z-10 animate-emerge">
        <div className="flex flex-col md:flex-row w-full md:w-[110vw] md:-ml-[5vw] h-full skew-x-0 md:-skew-x-12 gap-0 scale-[1.05]">
          {projects.map((project, i) => {
            const langData = translations[currentLang as Language].projects[i];
            return (
              <PortfolioCard 
                key={i} 
                {...project} 
                title={langData.title}
                description={langData.description}
                isFocused={focusedIndex === i} 
                onHover={() => setFocusedIndex(i)} 
                onLeave={() => setFocusedIndex(-1)} 
              />
            );
          })}
        </div>
      </section>

      {/* Glitch Overlay Effect */}
      {isGlitching && (
        <div className="fixed inset-0 z-[9999] pointer-events-none mix-blend-exclusion overflow-hidden">
          <style>{`
            @keyframes glitchSlice {
              0% { clip-path: inset(10% 0 80% 0); transform: translate(-10px, 5px); }
              20% { clip-path: inset(80% 0 10% 0); transform: translate(10px, -5px); }
              40% { clip-path: inset(40% 0 50% 0); transform: translate(-10px, 5px); }
              60% { clip-path: inset(20% 0 60% 0); transform: translate(10px, -5px); }
              80% { clip-path: inset(60% 0 20% 0); transform: translate(-10px, 5px); }
              100% { clip-path: inset(10% 0 80% 0); transform: translate(10px, -5px); }
            }
            .glitch-layer-cyan {
              position: absolute;
              inset: 0;
              background: cyan;
              mix-blend-mode: overlay;
              animation: glitchSlice 0.1s steps(2, end) infinite;
            }
            .glitch-layer-red {
              position: absolute;
              inset: 0;
              background: red;
              mix-blend-mode: overlay;
              animation: glitchSlice 0.15s steps(2, end) infinite reverse;
            }
            .glitch-invert {
              position: absolute;
              inset: 0;
              backdrop-filter: invert(1) hue-rotate(180deg);
              animation: glitchSlice 0.2s steps(2, end) infinite;
            }
          `}</style>
          <div className="glitch-layer-cyan" />
          <div className="glitch-layer-red" />
          <div className="glitch-invert" />
        </div>
      )}

      {/* Retro-Futuristic AI Assistant */}
      <OrdoAxioAi 
        currentLang={currentLang} 
        isTransparent={focusedIndex === 2} 
      />
    </main>
  );
}

