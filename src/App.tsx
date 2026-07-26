/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { PortfolioCard } from './components/PortfolioCard';

const projects = [
  {
    title: "Платформа CoFound",
    description: "Платформа для мэтчинга стартап-фаундеров и IT-специалистов. Включает доску проектов, интеграцию умного гео-поиска и строгий темный интерфейс.",
    link: "https://cofounder-platformm.onrender.com/",
    accentColor: "#2563eb", // blue-600
    bgImage: "url('https://api.microlink.io/?url=https://cofounder-platformm.onrender.com/&screenshot=true&embed=screenshot.url&colorScheme=dark')",
    titleStyle: "font-sans font-bold uppercase tracking-wide"
  },
  {
    title: "Root Access",
    description: "Браузерный 3D-мультиплеер на движке Three.js",
    link: "https://rootaccess-drab.vercel.app/",
    accentColor: "#22c55e", // green-500
    bgImage: "url('https://api.microlink.io/?url=https://rootaccess-drab.vercel.app/&screenshot=true&embed=screenshot.url&colorScheme=dark')",
    titleStyle: "font-sans font-bold uppercase tracking-wide"
  },
  {
    title: "Лендинг сайт",
    description: "Коммерческий лендинг сайт с ИИ-администратором и модулем онлайн-оплаты. Реальный кейс.",
    link: "https://inoedyhanie.vercel.app",
    accentColor: "#22d3ee", // cyan-400
    bgImage: "url('https://api.microlink.io/?url=https://inoedyhanie.vercel.app&screenshot=true&embed=screenshot.url&colorScheme=dark')",
    titleStyle: "font-sans font-bold uppercase tracking-wide"
  }
];

export default function App() {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

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
        <div className="font-sans font-bold uppercase tracking-widest text-white/90">
          ORDOAXIO
        </div>
        <a 
          href="https://t.me/Mistah_chee"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 text-white/50 hover:text-white transition-all duration-300 group"
        >
          <svg 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform"
          >
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
          </svg>
        </a>
      </header>

      <div className="flex-1 relative w-full overflow-hidden flex z-10 animate-emerge">
        <div className="flex flex-col md:flex-row w-full md:w-[110vw] md:-ml-[5vw] h-full skew-x-0 md:-skew-x-12 gap-0 scale-[1.05]">
          {projects.map((project, i) => (
            <PortfolioCard key={i} {...project} isFocused={focusedIndex === i} onHover={() => setFocusedIndex(i)} onLeave={() => setFocusedIndex(-1)} />
          ))}
        </div>
      </div>
    </main>
  );
}

